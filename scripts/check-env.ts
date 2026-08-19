import "dotenv/config";
import path from "path";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXTAUTH_URL: z.url(),
  DATABASE_URL: z.string().url().startsWith("postgres", "DATABASE_URL debe ser una URL PostgreSQL."),
  AUTH_SECRET: z.string().min(32).refine((value) => !value.startsWith("replace-with"), "AUTH_SECRET no puede ser el valor de ejemplo."),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  EMAIL_PROVIDER: z.enum(["resend"]).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().email().or(z.string().regex(/^.+<[^<>\s]+@[^<>\s]+>$/)).optional(),
  DOCUMENT_STORAGE_PATH: z.string().min(3),
  ALLOWED_ORIGINS: z.string().optional(),
  HOSTNAME: z.string().optional(),
  PORT: z.coerce.number().int().min(1).max(65535).optional(),
}).superRefine((env, context) => {
  const publicUrl = new URL(env.NEXT_PUBLIC_SITE_URL);
  const authUrl = new URL(env.NEXTAUTH_URL);
  if (env.NODE_ENV === "production" && (publicUrl.protocol !== "https:" || authUrl.protocol !== "https:")) {
    context.addIssue({ code: "custom", path: ["NEXT_PUBLIC_SITE_URL"], message: "Las URL públicas deben usar HTTPS en producción." });
  }
  if (publicUrl.origin !== authUrl.origin) {
    context.addIssue({ code: "custom", path: ["NEXTAUTH_URL"], message: "Debe tener el mismo origen que NEXT_PUBLIC_SITE_URL." });
  }
  const storagePath = path.resolve(env.DOCUMENT_STORAGE_PATH);
  const publicPath = path.resolve(process.cwd(), "public");
  const relative = path.relative(publicPath, storagePath);
  if (env.NODE_ENV === "production" && !path.isAbsolute(env.DOCUMENT_STORAGE_PATH)) {
    context.addIssue({ code: "custom", path: ["DOCUMENT_STORAGE_PATH"], message: "Debe ser una ruta absoluta en producción." });
  }
  if (!relative || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
    context.addIssue({ code: "custom", path: ["DOCUMENT_STORAGE_PATH"], message: "No puede estar dentro de /public." });
  }
  if (env.NODE_ENV === "production" && /secure-storage[\\/]tramitexfederal$/i.test(env.DOCUMENT_STORAGE_PATH)) {
    context.addIssue({ code: "custom", path: ["DOCUMENT_STORAGE_PATH"], message: "Sustituye la ruta de ejemplo por la ruta privada real." });
  }
  if (env.NODE_ENV === "production" && (!env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || !env.TURNSTILE_SECRET_KEY)) {
    context.addIssue({ code: "custom", path: ["TURNSTILE_SECRET_KEY"], message: "Turnstile es obligatorio para el registro en producción." });
  }
  if (env.NODE_ENV === "production" && (!env.RESEND_API_KEY || !env.EMAIL_FROM)) {
    context.addIssue({ code: "custom", path: ["RESEND_API_KEY"], message: "Configura Resend para recuperación de contraseña en producción." });
  }
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}
console.log("Variables de entorno verificadas.");
