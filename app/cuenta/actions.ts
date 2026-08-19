"use server";

import { revalidatePath } from "next/cache";
import { Prisma, ProcedureStatus } from "@/app/generated/prisma/client";
import { requireClient } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { FileValidationError, removePrivateFile, savePrivateFile } from "@/lib/security/private-storage";
import { clientProcedureSchema, clientProfileSchema, supportTicketSchema } from "@/lib/validations/client-portal";

function formValues(formData: FormData) {
  return Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, typeof value === "string" ? value : ""]));
}

export async function createClientProcedure(formData: FormData) {
  const { session, client } = await requireClient();
  const parsed = clientProcedureSchema.safeParse(formValues(formData));
  if (!parsed.success) return { ok: false, message: "Selecciona un servicio válido." };
  const year = new Date().getFullYear();
  const procedure = await prisma.$transaction(async (tx) => {
    const [service, sequence] = await Promise.all([
      tx.service.findUnique({ where: { id: parsed.data.serviceId }, include: { requirements: { where: { audience: client.type }, orderBy: { sortOrder: "asc" } } } }),
      tx.folioSequence.upsert({ where: { year }, create: { year, value: 1 }, update: { value: { increment: 1 } } }),
    ]);
    if (!service?.isActive) throw new Error("Servicio no disponible.");
    const created = await tx.procedure.create({
      data: {
        folio: `TRM-${year}-${String(sequence.value).padStart(5, "0")}`,
        clientId: client.id,
        serviceId: service.id,
        status: ProcedureStatus.WAITING_DOCUMENTS,
        requirements: { create: service.requirements.map((requirement) => ({ serviceRequirementId: requirement.id, label: requirement.label, isRequired: requirement.isRequired })) },
        statusHistory: { create: { fromStatus: ProcedureStatus.NEW, toStatus: ProcedureStatus.WAITING_DOCUMENTS, changedById: session.user.id, publicMessage: "Tu expediente fue creado. Sube los documentos requeridos para continuar." } },
      },
    });
    await tx.activityLog.create({ data: { userId: session.user.id, action: "Cliente inició un trámite", entityType: "Procedure", entityId: created.id } });
    return tx.procedure.findUniqueOrThrow({ where: { id: created.id }, select: { id: true, folio: true, requirements: { select: { id: true, label: true, isRequired: true } } } });
  });
  revalidatePath("/cuenta");
  revalidatePath("/cuenta/mis-tramites");
  return { ok: true, procedureId: procedure.id, folio: procedure.folio, requirements: procedure.requirements };
}

export async function uploadClientRequirementDocument(formData: FormData) {
  const { session, client } = await requireClient();
  const procedureId = formData.get("procedureId");
  const requirementId = formData.get("requirementId");
  const replacesDocumentId = formData.get("replacesDocumentId");
  const file = formData.get("file");
  if (typeof procedureId !== "string" || typeof requirementId !== "string" || !(file instanceof File)) return { ok: false, message: "Datos de carga inválidos." };
  const requirement = await prisma.procedureRequirement.findFirst({ where: { id: requirementId, procedureId, procedure: { clientId: client.id } }, select: { id: true, label: true, procedureId: true } });
  if (!requirement) return { ok: false, message: "No tienes acceso a este requisito." };
  let saved: Awaited<ReturnType<typeof savePrivateFile>>;
  try {
    saved = await savePrivateFile(file);
  } catch (error) {
    return { ok: false, message: error instanceof FileValidationError ? error.message : "No fue posible validar el archivo." };
  }
  try {
    const document = await prisma.$transaction(async (tx) => {
      if (typeof replacesDocumentId === "string" && replacesDocumentId) {
        const previous = await tx.procedureDocument.findFirst({ where: { documentId: replacesDocumentId, requirementId: requirement.id, procedureId, document: { clientId: client.id } }, select: { documentId: true } });
        if (!previous) throw new Error("El archivo a reemplazar no pertenece al requisito.");
        await tx.document.update({ where: { id: previous.documentId }, data: { status: "CANCELLED", reviewNotes: "Reemplazado por el cliente." } });
      }
      const created = await tx.document.create({ data: { clientId: client.id, uploadedById: session.user.id, category: requirement.label, status: "RECEIVED", replacesDocumentId: typeof replacesDocumentId === "string" && replacesDocumentId ? replacesDocumentId : undefined, ...saved } });
      await tx.procedureDocument.create({ data: { procedureId, requirementId: requirement.id, documentId: created.id } });
      await tx.procedureRequirement.update({ where: { id: requirement.id }, data: { isComplete: true, completedAt: new Date() } });
      await tx.activityLog.create({ data: { userId: session.user.id, action: replacesDocumentId ? "Cliente reemplazó un documento" : "Cliente subió un documento", entityType: "Document", entityId: created.id } });
      return created;
    });
    revalidatePath(`/cuenta/mis-tramites/${procedureId}`);
    revalidatePath("/cuenta/documentos");
    return { ok: true, documentId: document.id, originalName: document.originalName, status: document.status };
  } catch (error) {
    await removePrivateFile(saved.storageKey);
    return { ok: false, message: error instanceof Prisma.PrismaClientKnownRequestError ? "No fue posible guardar el documento." : (error as Error).message };
  }
}

export async function updateClientProfile(formData: FormData) {
  const { session, client } = await requireClient();
  const parsed = clientProfileSchema.safeParse(formValues(formData));
  if (!parsed.success) return { ok: false, message: "Revisa los datos del perfil." };
  await prisma.$transaction([
    prisma.client.update({ where: { id: client.id }, data: parsed.data }),
    prisma.user.update({ where: { id: session.user.id }, data: { name: `${parsed.data.firstName ?? ""} ${parsed.data.lastName ?? ""}`.trim() || "Cliente" } }),
  ]);
  revalidatePath("/cuenta/perfil");
  return { ok: true };
}

export async function createSupportTicket(formData: FormData) {
  const { session, client } = await requireClient();
  const parsed = supportTicketSchema.safeParse(formValues(formData));
  if (!parsed.success) return { ok: false, message: "Completa el asunto y mensaje." };
  if (parsed.data.procedureId) {
    const ownsProcedure = await prisma.procedure.count({ where: { id: parsed.data.procedureId, clientId: client.id } });
    if (!ownsProcedure) return { ok: false, message: "El trámite seleccionado no te pertenece." };
  }
  const ticket = await prisma.$transaction(async (tx) => {
    const created = await tx.supportTicket.create({ data: { clientId: client.id, procedureId: parsed.data.procedureId || undefined, subject: parsed.data.subject, messages: { create: { authorId: session.user.id, body: parsed.data.body } } } });
    await tx.activityLog.create({ data: { userId: session.user.id, action: "Cliente creó un ticket de soporte", entityType: "SupportTicket", entityId: created.id } });
    return created;
  });
  revalidatePath("/cuenta/soporte");
  return { ok: true, ticketId: ticket.id };
}
