import "server-only";
import { cache } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@/app/generated/prisma/client";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

export const getActiveSession = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  if (!user?.isActive) return null;

  session.user = {
    ...session.user,
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  return session;
});

export async function requireUser() {
  const session = await getActiveSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(...roles: UserRole[]) {
  const session = await requireUser();
  if (!roles.includes(session.user.role)) redirect(session.user.role === "CLIENT" ? "/cuenta" : "/admin");
  return session;
}

export async function requireInternalUser() {
  return requireRole("ADMIN", "MANAGER", "AGENT", "DATA_ENTRY");
}

export const getClientContext = cache(async () => {
  const session = await getActiveSession();
  if (!session || session.user.role !== "CLIENT") return null;
  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
    select: { id: true, type: true, firstName: true, lastName: true, email: true, phone: true, address: true, isActive: true },
  });
  if (!client?.isActive) return null;
  return { session, client };
});

export async function requireClient() {
  const session = await getActiveSession();
  if (!session) redirect("/login?callbackUrl=/cuenta");
  if (session.user.role !== "CLIENT") redirect("/admin");
  const context = await getClientContext();
  if (!context) redirect("/login?callbackUrl=/cuenta");
  return context;
}
