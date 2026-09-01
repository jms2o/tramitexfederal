import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { ProcedureStatus } from "@/app/generated/prisma/client";

const publicStatusLabels: Record<ProcedureStatus, string> = {
  NEW: "Solicitud recibida", WAITING_DOCUMENTS: "Esperando documentos", UNDER_REVIEW: "En revisión", DOCUMENTS_COMPLETE: "Documentación completa", STARTED: "Trámite iniciado", IN_PROGRESS: "En proceso", READY_FOR_DELIVERY: "Listo para entrega", COMPLETED: "Finalizado", ON_HOLD: "En pausa", REJECTED: "Requiere atención", CANCELLED: "Cancelado",
};

export async function findPublicTracking(folio: string, email: string) {
  const procedure = await prisma.procedure.findFirst({
    where: {
      folio: folio.trim().toUpperCase(),
      client: { email: { equals: email.trim().toLowerCase(), mode: "insensitive" } },
    },
    select: { folio: true, status: true, updatedAt: true, publicMessage: true, service: { select: { name: true } } },
  });
  if (!procedure) return null;
  return { folio: procedure.folio, service: procedure.service.name, status: publicStatusLabels[procedure.status], updatedAt: procedure.updatedAt, message: procedure.publicMessage || "Tu trámite continúa en seguimiento. Para más información, comunícate con nuestro equipo." };
}
