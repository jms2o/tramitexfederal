import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { credentialsSchema } from "@/lib/validations/auth";
import { checkRateLimit, getRequestKey } from "@/lib/security/rate-limit";
import { recordSecurityEvent } from "@/lib/security/security-events";

// Mantiene un tiempo de comparación equivalente cuando el correo no existe.
// No es una credencial válida ni un secreto.
const dummyPasswordHash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxcG2VjE5Kx7b7wVj1uGfVQ4ZQe";

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Correo y contraseña",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();
        const forwardedFor = request.headers?.["x-forwarded-for"] ?? null;
        const sourceIp = forwardedFor?.split(",")[0]?.trim() ?? null;
        const userAgent = request.headers?.["user-agent"] ?? null;
        const requestKey = getRequestKey(forwardedFor, "login");
        const emailAllowed = checkRateLimit(`login:email:${email}`, 5, 15 * 60 * 1000).allowed;
        const sourceAllowed = checkRateLimit(`login:${requestKey}`, 20, 15 * 60 * 1000).allowed;
        if (!emailAllowed || !sourceAllowed) return null;

        const user = await prisma.user.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
          select: { id: true, name: true, email: true, passwordHash: true, role: true, isActive: true },
        });

        const isValid = await compare(parsed.data.password, user?.passwordHash ?? dummyPasswordHash);
        if (!user?.isActive || !user.passwordHash || !isValid) {
          if (user && user.role !== "CLIENT") {
            await recordSecurityEvent({
              action: "Intento fallido de acceso interno",
              severity: "WARNING",
              userId: user.id,
              ip: sourceIp,
              userAgent,
              details: { role: user.role },
              alert: true,
            });
          }
          return null;
        }

        if (user.role === "ADMIN") {
          await recordSecurityEvent({
            action: "Inicio de sesión administrativo",
            severity: "INFO",
            userId: user.id,
            ip: sourceIp,
            userAgent,
            details: { role: user.role },
            alert: true,
          });
        }

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
