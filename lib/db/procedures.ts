import "server-only";
import { ProcedureStatus } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireInternalUser, requireRole } from "@/lib/auth/session";

export const procedureStatusLabels: Record<ProcedureStatus, string> = {
  NEW: "Nueva solicitud", WAITING_DOCUMENTS: "Esperando documentos", UNDER_REVIEW: "En revisión", DOCUMENTS_COMPLETE: "Documentación completa", STARTED: "Trámite iniciado", IN_PROGRESS: "En proceso", READY_FOR_DELIVERY: "Listo para entrega", COMPLETED: "Finalizado", ON_HOLD: "En pausa", REJECTED: "Rechazado", CANCELLED: "Cancelado",
};

export async function getProcedures(status?: ProcedureStatus[]) {
  await requireInternalUser();
  return prisma.procedure.findMany({
    where: status ? { status: { in: status } } : undefined,
    include: { service: { select: { name: true } }, client: { select: { firstName: true, lastName: true, company: { select: { legalName: true } } } }, assignee: { select: { name: true } }, _count: { select: { requirements: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getProcedureFormData() {
  await requireRole("ADMIN", "MANAGER", "AGENT");
  const [clients, vehicles, services] = await Promise.all([
    prisma.client.findMany({ where: { isActive: true, deletedAt: null }, select: { id: true, firstName: true, lastName: true, company: { select: { legalName: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.vehicle.findMany({ select: { id: true, brand: true, model: true, year: true, clientId: true }, orderBy: { createdAt: "desc" } }),
    prisma.service.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return { clients, vehicles, services };
}

export async function getProcedure(id: string) {
  await requireInternalUser();
  return prisma.procedure.findUnique({
    where: { id },
    include: {
      service: true,
      client: { include: { company: true, vehicles: { orderBy: { updatedAt: "desc" } } } },
      vehicle: true,
      assignee: { select: { name: true } },
      requirements: { orderBy: { createdAt: "asc" }, include: { documents: { include: { document: true } } } },
      statusHistory: { orderBy: { createdAt: "desc" }, include: { changedBy: { select: { name: true } } } },
      quote: { include: { items: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
}
