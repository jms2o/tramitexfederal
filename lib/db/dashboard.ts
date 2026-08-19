import "server-only";
import { PaymentStatus, ProcedureStatus } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireInternalUser } from "@/lib/auth/session";

const activeStatuses = [
  ProcedureStatus.NEW,
  ProcedureStatus.WAITING_DOCUMENTS,
  ProcedureStatus.UNDER_REVIEW,
  ProcedureStatus.DOCUMENTS_COMPLETE,
  ProcedureStatus.STARTED,
  ProcedureStatus.IN_PROGRESS,
  ProcedureStatus.READY_FOR_DELIVERY,
  ProcedureStatus.ON_HOLD,
];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("es-MX", { month: "short" }).format(date).replace(".", "");
}

export async function getDashboardData() {
  await requireInternalUser();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const chartStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const months = Array.from({ length: 6 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - 5 + index, 1));

  const [activeProcedures, waitingDocuments, underReview, inProgress, clients, monthlyPayments, procedures, statusGroups, activities] = await Promise.all([
    prisma.procedure.count({ where: { status: { in: activeStatuses } } }),
    prisma.procedure.count({ where: { status: ProcedureStatus.WAITING_DOCUMENTS } }),
    prisma.procedure.count({ where: { status: ProcedureStatus.UNDER_REVIEW } }),
    prisma.procedure.count({ where: { status: ProcedureStatus.IN_PROGRESS } }),
    prisma.client.count({ where: { isActive: true, deletedAt: null } }),
    prisma.payment.aggregate({ where: { status: PaymentStatus.PAID, paidAt: { gte: startOfMonth } }, _sum: { amount: true } }),
    prisma.procedure.findMany({ where: { createdAt: { gte: chartStart } }, select: { createdAt: true } }),
    prisma.procedure.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.activityLog.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } } }),
  ]);

  const countsByMonth = new Map<string, number>();
  for (const procedure of procedures) {
    const key = monthKey(procedure.createdAt);
    countsByMonth.set(key, (countsByMonth.get(key) ?? 0) + 1);
  }

  const statusLabels: Record<ProcedureStatus, string> = {
    NEW: "Nueva solicitud", WAITING_DOCUMENTS: "Esperando documentos", UNDER_REVIEW: "En revisión", DOCUMENTS_COMPLETE: "Documentación completa", STARTED: "Trámite iniciado", IN_PROGRESS: "En proceso", READY_FOR_DELIVERY: "Listo para entrega", COMPLETED: "Finalizado", ON_HOLD: "En pausa", REJECTED: "Rechazado", CANCELLED: "Cancelado",
  };

  return {
    metrics: { activeProcedures, waitingDocuments, underReview, inProgress, clients, monthlyIncome: Number(monthlyPayments._sum.amount ?? 0) },
    proceduresByMonth: months.map((month) => ({ month: monthLabel(month), procedures: countsByMonth.get(monthKey(month)) ?? 0 })),
    proceduresByStatus: statusGroups.map((group) => ({ name: statusLabels[group.status], value: group._count._all })),
    activity: activities.map((activity) => ({ id: activity.id, action: activity.action, entityType: activity.entityType, userName: activity.user?.name ?? "Sistema", createdAt: activity.createdAt.toISOString() })),
  };
}
