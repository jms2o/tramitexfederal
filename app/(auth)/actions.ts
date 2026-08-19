"use server";

import { compare, hash } from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { sendTransactionalEmail } from "@/lib/email/transactional";
import { createPasswordResetToken, hashPasswordResetToken } from "@/lib/security/password-reset";
import { checkRateLimit, getRequestKey } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { passwordResetRequestSchema, passwordResetSchema, registrationSchema } from "@/lib/validations/auth";

const dummyPasswordHash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxcG2VjE5Kx7b7wVj1uGfVQ4ZQe";

function formValues(formData: FormData) {
  return Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, typeof value === "string" ? value : ""]));
}

async function requestIp() {
  const requestHeaders = await headers();
  return requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function registerClient(formData: FormData) {
  const parsed = registrationSchema.safeParse(formValues(formData));
  if (!parsed.success) redirect(`/registro?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Datos inválidos")}`);
  const ip = await requestIp();
  const sourceKey = getRequestKey(ip, "registration");
  if (!checkRateLimit(`register:${sourceKey}`, 5, 60 * 60 * 1000).allowed || !checkRateLimit(`register:email:${parsed.data.email}`, 3, 60 * 60 * 1000).allowed) {
    redirect("/registro?error=rate-limit");
  }
  if (!await verifyTurnstile(parsed.data.turnstileToken, ip)) redirect("/registro?error=turnstile");

  try {
    const existing = await prisma.user.findFirst({ where: { email: { equals: parsed.data.email, mode: "insensitive" } }, select: { id: true } });
    if (existing) redirect("/registro?error=account-unavailable");
    const passwordHash = await hash(parsed.data.password, 12);
    const account = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { name: "Cliente", email: parsed.data.email, passwordHash, role: "CLIENT" } });
      const client = await tx.client.create({ data: { email: parsed.data.email, userId: user.id } });
      await tx.activityLog.create({ data: { userId: user.id, action: "Creó una cuenta de cliente", entityType: "Client", entityId: client.id } });
      return user;
    });
    redirect(`/login?created=1&email=${encodeURIComponent(account.email)}&callbackUrl=/cuenta`);
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") redirect("/registro?error=account-unavailable");
    throw error;
  }
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
