import "server-only";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";

export async function getQuotes() {
  await requireRole("ADMIN", "MANAGER", "AGENT");
  return prisma.quote.findMany({ include: { procedure: { include: { client: { select: { firstName: true, lastName: true, company: { select: { legalName: true } } } }, service: { select: { name: true } }, payments: { select: { amount: true } } }, }, items: true }, orderBy: { updatedAt: "desc" } });
}

export async function getQuote(id: string) {
  await requireRole("ADMIN", "MANAGER", "AGENT");
  return prisma.quote.findUnique({ where: { id }, include: { items: true, procedure: { include: { client: { include: { company: true } }, service: true, payments: { orderBy: { paidAt: "desc" } } } } } });
}

export async function getPayments() {
  await requireRole("ADMIN", "MANAGER", "AGENT");
  return prisma.payment.findMany({ include: { procedure: { include: { client: { select: { firstName: true, lastName: true, company: { select: { legalName: true } } } }, service: { select: { name: true } } } } }, orderBy: { createdAt: "desc" } });
}

export async function getFinanceFormData() {
  await requireRole("ADMIN", "MANAGER", "AGENT");
  return prisma.procedure.findMany({
    select: { id: true, folio: true, clientId: true, client: { select: { firstName: true, lastName: true, company: { select: { legalName: true } } } } },
    orderBy: { updatedAt: "desc" },
  });
}

export function clientLabel(client: { firstName: string | null; lastName: string | null; company: { legalName: string } | null }) {
  return client.company?.legalName ?? `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim();
}
