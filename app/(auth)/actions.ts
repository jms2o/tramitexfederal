"use server";

import { compare, hash } from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { sendTransactionalEmail } from "@/lib/email/transactional";
import { createPasswordResetToken, hashPasswordResetToken } from "@/lib/security/password-reset";
import { checkRateLimit, getRequestKey } from "@/lib/security/rate-limit";
import { createRegistrationCode, hashRegistrationCode, registrationCodeMatches } from "@/lib/security/registration-verification";
import { verifyTurnstile } from "@/lib/security/turnstile";
import {
  passwordResetRequestSchema,
  passwordResetSchema,
  registrationResendSchema,
  registrationSchema,
  registrationVerificationSchema,
} from "@/lib/validations/auth";

const dummyPasswordHash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxcG2VjE5Kx7b7wVj1uGfVQ4ZQe";
const registrationCodeTtlMs = 10 * 60 * 1000;

function formValues(formData: FormData) {
  return Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, typeof value === "string" ? value : ""]));
}

async function requestIp() {
  const requestHeaders = await headers();
  return requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

function verificationPath(verificationId: string, query = "") {
  return `/registro/verificar?id=${encodeURIComponent(verificationId)}${query}`;
}

async function sendRegistrationCode(email: string, code: string) {
  await sendTransactionalEmail({
    to: email,
    subject: "Tu código de verificación de TramitexFederal",
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#082E68"><h2>Confirma tu correo electrónico</h2><p style="color:#475569;line-height:1.6">Usa este código para terminar de crear tu cuenta en TramitexFederal:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px;margin:28px 0;color:#0B57D0">${code}</p><p style="color:#475569;line-height:1.6">El código vence en 10 minutos. Si tú no solicitaste este registro, puedes ignorar este mensaje.</p></div>`,
  });
}

export async function requestRegistrationCode(formData: FormData) {
  const parsed = registrationSchema.safeParse(formValues(formData));
  if (!parsed.success) redirect(`/registro?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Datos inválidos")}`);

  const ip = await requestIp();
  const sourceKey = getRequestKey(ip, "registration");
  if (!checkRateLimit(`register:${sourceKey}`, 5, 60 * 60 * 1000).allowed || !checkRateLimit(`register:email:${parsed.data.email}`, 3, 60 * 60 * 1000).allowed) {
    redirect("/registro?error=rate-limit");
  }
  if (!await verifyTurnstile(parsed.data.turnstileToken, ip)) redirect("/registro?error=turnstile");

  const existing = await prisma.user.findFirst({
    where: { email: { equals: parsed.data.email, mode: "insensitive" } },
    select: { id: true, email: true, isActive: true, role: true, client: { select: { id: true } } },
  });
  if (existing && (existing.isActive || existing.role !== "CLIENT" || existing.client)) redirect("/registro?error=account-unavailable");

  const passwordHash = await hash(parsed.data.password, 12);
  let pendingUser: { id: string; email: string };

  if (existing) {
    pendingUser = await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash, isActive: false },
      select: { id: true, email: true },
    });
  } else {
    try {
      pendingUser = await prisma.user.create({
        data: { name: "Cliente", email: parsed.data.email, passwordHash, role: "CLIENT", isActive: false },
        select: { id: true, email: true },
      });
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") redirect("/registro?error=account-unavailable");
      throw error;
    }
  }

  const code = createRegistrationCode();
  const tokenHash = hashRegistrationCode(pendingUser.id, code);
  const expiresAt = new Date(Date.now() + registrationCodeTtlMs);
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: pendingUser.id } }),
    prisma.passwordResetToken.create({ data: { userId: pendingUser.id, tokenHash, expiresAt } }),
  ]);

  try {
    await sendRegistrationCode(pendingUser.email, code);
  } catch {
    redirect("/registro?error=email-delivery");
  }

  redirect(verificationPath(pendingUser.id));
}

export async function verifyRegistrationCode(formData: FormData) {
  const parsed = registrationVerificationSchema.safeParse(formValues(formData));
  if (!parsed.success) redirect("/registro?error=verification-invalid");

  const ip = await requestIp();
  const sourceKey = getRequestKey(ip, "registration-verification");
  if (!checkRateLimit(`register-verify:${sourceKey}`, 30, 15 * 60 * 1000).allowed || !checkRateLimit(`register-verify:id:${parsed.data.verificationId}`, 8, 15 * 60 * 1000).allowed) {
    redirect(verificationPath(parsed.data.verificationId, "&error=rate-limit"));
  }

  const pendingUser = await prisma.user.findUnique({
    where: { id: parsed.data.verificationId },
    select: { id: true, email: true, isActive: true, role: true, client: { select: { id: true } } },
  });
  if (!pendingUser || pendingUser.isActive || pendingUser.role !== "CLIENT" || pendingUser.client) {
    redirect("/registro?error=verification-invalid");
  }

  const token = await prisma.passwordResetToken.findFirst({
    where: { userId: pendingUser.id, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: { id: true, tokenHash: true },
  });
  if (!token) redirect(verificationPath(pendingUser.id, "&error=code-expired"));
  if (!registrationCodeMatches(pendingUser.id, parsed.data.code, token.tokenHash)) {
    redirect(verificationPath(pendingUser.id, "&error=code-invalid"));
  }

  const now = new Date();
  try {
    const account = await prisma.$transaction(async (tx) => {
      const consumed = await tx.passwordResetToken.updateMany({
        where: { id: token.id, userId: pendingUser.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      });
      if (consumed.count !== 1) return null;

      const current = await tx.user.findUnique({
        where: { id: pendingUser.id },
        select: { id: true, email: true, isActive: true, role: true, client: { select: { id: true } } },
      });
      if (!current || current.isActive || current.role !== "CLIENT" || current.client) return null;

      const user = await tx.user.update({ where: { id: current.id }, data: { isActive: true } });
      const client = await tx.client.create({ data: { email: current.email, userId: current.id } });
      await tx.activityLog.create({ data: { userId: user.id, action: "Verificó su correo y creó una cuenta de cliente", entityType: "Client", entityId: client.id } });
      return user;
    });

    if (!account) redirect(verificationPath(pendingUser.id, "&error=code-invalid"));
    redirect(`/login?created=1&verified=1&email=${encodeURIComponent(account.email)}&callbackUrl=/cuenta`);
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") redirect("/registro?error=account-unavailable");
    throw error;
  }
}

export async function resendRegistrationCode(formData: FormData) {
  const parsed = registrationResendSchema.safeParse(formValues(formData));
  if (!parsed.success) redirect("/registro?error=verification-invalid");

  const ip = await requestIp();
  const sourceKey = getRequestKey(ip, "registration-resend");
  if (!checkRateLimit(`register-resend:${sourceKey}`, 10, 60 * 60 * 1000).allowed || !checkRateLimit(`register-resend:id:${parsed.data.verificationId}`, 3, 60 * 60 * 1000).allowed) {
    redirect(verificationPath(parsed.data.verificationId, "&error=rate-limit"));
  }

  const pendingUser = await prisma.user.findUnique({
    where: { id: parsed.data.verificationId },
    select: { id: true, email: true, isActive: true, role: true, client: { select: { id: true } } },
  });
  if (!pendingUser || pendingUser.isActive || pendingUser.role !== "CLIENT" || pendingUser.client) {
    redirect("/registro?error=verification-invalid");
  }

  const code = createRegistrationCode();
  const tokenHash = hashRegistrationCode(pendingUser.id, code);
  const expiresAt = new Date(Date.now() + registrationCodeTtlMs);
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: pendingUser.id } }),
    prisma.passwordResetToken.create({ data: { userId: pendingUser.id, tokenHash, expiresAt } }),
  ]);

  try {
    await sendRegistrationCode(pendingUser.email, code);
  } catch {
    redirect(verificationPath(pendingUser.id, "&error=email-delivery"));
  }

  redirect(verificationPath(pendingUser.id, "&resent=1"));
}

export async function requestPasswordReset(formData: FormData) {
  const parsed = passwordResetRequestSchema.safeParse(formValues(formData));
  const genericRedirect = "/recuperar-contrasena?sent=1";
  if (!parsed.success) redirect(genericRedirect);
  const ip = await requestIp();
  if (!checkRateLimit(`reset:${getRequestKey(ip, "reset")}`, 5, 60 * 60 * 1000).allowed) redirect(genericRedirect);
  const user = await prisma.user.findFirst({ where: { email: { equals: parsed.data.email, mode: "insensitive" } }, select: { id: true, email: true, isActive: true } });
  if (!user?.isActive) {
    await compare("not-a-password", dummyPasswordHash);
    redirect(genericRedirect);
  }

  const { token, tokenHash } = createPasswordResetToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } }),
    prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } }),
  ]);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_SITE_URL is required.");
  const resetUrl = new URL("/restablecer-contrasena", baseUrl);
  resetUrl.searchParams.set("token", token);
  await sendTransactionalEmail({
    to: user.email,
    subject: "Restablece tu contraseña de TramitexFederal",
    html: `<p>Solicitaste restablecer tu contraseña.</p><p><a href="${resetUrl.toString()}">Restablecer contraseña</a></p><p>El enlace vence en una hora.</p>`,
  });
  redirect(genericRedirect);
}

export async function resetPassword(formData: FormData) {
  const parsed = passwordResetSchema.safeParse(formValues(formData));
  if (!parsed.success) redirect(`/restablecer-contrasena?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Datos inválidos")}`);
  const tokenHash = hashPasswordResetToken(parsed.data.token);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash }, select: { id: true, userId: true, expiresAt: true, usedAt: true } });
  if (!record || record.usedAt || record.expiresAt <= new Date()) redirect("/recuperar-contrasena?error=token-invalid");
  const passwordHash = await hash(parsed.data.password, 12);
  const usedAt = new Date();
  const result = await prisma.$transaction(async (tx) => {
    const consumed = await tx.passwordResetToken.updateMany({ where: { id: record.id, usedAt: null, expiresAt: { gt: usedAt } }, data: { usedAt } });
    if (consumed.count !== 1) return false;
    await tx.user.update({ where: { id: record.userId }, data: { passwordHash } });
    await tx.activityLog.create({ data: { userId: record.userId, action: "Restableció su contraseña", entityType: "User", entityId: record.userId } });
    return true;
  });
  if (!result) redirect("/recuperar-contrasena?error=token-invalid");
  redirect("/login?reset=1&callbackUrl=/cuenta");
}
