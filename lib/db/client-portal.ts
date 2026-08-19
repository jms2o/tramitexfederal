import "server-only";
import { requireClient } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function getClientDashboard() {
  const { client } = await requireClient();
  const [procedures, documents, tickets] = await Promise.all([
    prisma.procedure.findMany({ where: { clientId: client.id }, orderBy: { updatedAt: "desc" }, take: 5, include: { service: { select: { name: true } } } }),
    prisma.document.count({ where: { clientId: client.id, status: { in: ["PENDING", "RECEIVED", "UNDER_REVIEW", "REJECTED"] } } }),
    prisma.supportTicket.count({ where: { clientId: client.id, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
  ]);
  return { client, procedures, pendingDocuments: documents, openTickets: tickets };
}

export async function getClientServices() {
  await requireClient();
  return prisma.service.findMany({ where: { isActive: true }, select: { id: true, slug: true, name: true, description: true }, orderBy: { sortOrder: "asc" } });
}

export async function getClientWizardData() {
  const { client: sessionClient } = await requireClient();
  const [client, services] = await Promise.all([
    prisma.client.findUniqueOrThrow({ where: { id: sessionClient.id }, select: { id: true, type: true, firstName: true, lastName: true, email: true, phone: true, rfc: true, address: true } }),
    prisma.service.findMany({ where: { isActive: true }, select: { id: true, slug: true, name: true, description: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return { client, services };
}

export async function getClientProcedures() {
  const { client } = await requireClient();
  return prisma.procedure.findMany({ where: { clientId: client.id }, include: { service: { select: { name: true } }, requirements: { include: { documents: { include: { document: true }, orderBy: { createdAt: "desc" }, take: 1 } } } }, orderBy: { updatedAt: "desc" } });
}

export async function getClientProcedure(id: string) {
  const { client } = await requireClient();
  return prisma.procedure.findFirst({
    where: { id, clientId: client.id },
    include: {
      service: { select: { name: true } },
      requirements: { orderBy: { createdAt: "asc" }, include: { documents: { include: { document: true }, orderBy: { createdAt: "desc" } } } },
      statusHistory: { orderBy: { createdAt: "desc" }, select: { toStatus: true, publicMessage: true, createdAt: true } },
    },
  });
}

export async function getClientDocuments() {
  const { client } = await requireClient();
  return prisma.document.findMany({ where: { clientId: client.id }, include: { procedures: { include: { procedure: { select: { id: true, folio: true } } } } }, orderBy: { createdAt: "desc" } });
}

export async function getClientTickets() {
  const { client } = await requireClient();
  return prisma.supportTicket.findMany({ where: { clientId: client.id }, include: { procedure: { select: { folio: true } }, messages: { where: { isInternal: false }, orderBy: { createdAt: "asc" }, include: { author: { select: { name: true, role: true } } } } }, orderBy: { updatedAt: "desc" } });
}
