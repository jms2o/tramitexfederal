import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().trim().email("Ingresa un correo válido.").max(254),
  password: z.string().min(12, "La contraseña debe tener al menos 12 caracteres.").max(128),
});

export const registrationSchema = z.object({
  email: z.string().trim().email("Ingresa un correo válido.").max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(12, "La contraseña debe tener al menos 12 caracteres.").max(128),
  confirmPassword: z.string().max(128),
  turnstileToken: z.string().min(1, "Completa la verificación de seguridad."),
}).superRefine((data, context) => {
  if (data.password !== data.confirmPassword) context.addIssue({ code: "custom", path: ["confirmPassword"], message: "Las contraseñas no coinciden." });
  if (!/[a-z]/.test(data.password) || !/[A-Z]/.test(data.password) || !/\d/.test(data.password) || !/[^A-Za-z0-9]/.test(data.password)) {
    context.addIssue({ code: "custom", path: ["password"], message: "Usa mayúscula, minúscula, número y símbolo." });
  }
});

export const registrationVerificationSchema = z.object({
  verificationId: z.string().trim().min(10).max(64),
  code: z.string().trim().regex(/^\d{6}$/, "Ingresa el código de 6 dígitos."),
});

export const registrationResendSchema = z.object({
  verificationId: z.string().trim().min(10).max(64),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
});

export const passwordResetSchema = z.object({
  token: z.string().min(20).max(500),
  password: z.string().min(12).max(128),
  confirmPassword: z.string().max(128),
}).superRefine((data, context) => {
  if (data.password !== data.confirmPassword) context.addIssue({ code: "custom", path: ["confirmPassword"], message: "Las contraseñas no coinciden." });
  if (!/[a-z]/.test(data.password) || !/[A-Z]/.test(data.password) || !/\d/.test(data.password) || !/[^A-Za-z0-9]/.test(data.password)) {
    context.addIssue({ code: "custom", path: ["password"], message: "Usa mayúscula, minúscula, número y símbolo." });
  }
});
