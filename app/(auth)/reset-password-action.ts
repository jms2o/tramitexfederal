"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { hashPasswordResetToken } from "@/lib/security/password-reset";
import { passwordResetSchema } from "@/lib/validations/auth";

function formValues(formData: FormData) {
  return Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [key, typeof value === "string" ? value : ""]),
  );
}

export async function resetPassword(formData: FormData) {
  const values = formValues(formData);
  const parsed = passwordResetSchema.safeParse(values);

  if (!parsed.success) {
    const token = typeof values.token === "string" ? values.token : "";
    const message = parsed.error.issues[0]?.message ?? "Datos inválidos";
    if (token) {
      redirect(`/restablecer-contrasena?token=${encodeURIComponent(token)}&error=${encodeURIComponent(message)}`);
    }
    redirect("/recuperar-contrasena?error=token-invalid");
  }

  const tokenHash = hashPasswordResetToken(parsed.data.token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });

  if (!record || record.usedAt || record.expiresAt <= new Date()) {
    redirect("/recuperar-contrasena?error=token-invalid");
  }

  const passwordHash = await hash(parsed.data.password, 12);
  const usedAt = new Date();
  const role = await prisma.$transaction(async (tx) => {
    const consumed = await tx.passwordResetToken.updateMany({
      where: { id: record.id, usedAt: null, expiresAt: { gt: usedAt } },
      data: { usedAt },
    });
    if (consumed.count !== 1) return null;

    const user = await tx.user.update({
      where: { id: record.userId },
      data: { passwordHash },
      select: { role: true },
    });

    await tx.activityLog.create({
      data: {
        userId: record.userId,
        action: "Restableció su contraseña",
        entityType: "User",
        entityId: record.userId,
      },
    });

    return user.role;
  });

  if (!role) redirect("/recuperar-contrasena?error=token-invalid");

  const callbackUrl = role === "CLIENT" ? "/cuenta" : "/admin";
  redirect(`/login?reset=1&callbackUrl=${encodeURIComponent(callbackUrl)}`);
}
