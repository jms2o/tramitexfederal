"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { clientSchema, vehicleSchema } from "@/lib/validations/crm";
import { procedureSchema, procedureStatusSchema } from "@/lib/validations/procedure";
import { Prisma, ProcedureStatus } from "@/app/generated/prisma/client";
import { FileValidationError, removePrivateFile, savePrivateFile } from "@/lib/security/private-storage";
import { parseQuoteItems, paymentSchema, quoteSchema } from "@/lib/validations/finance";
import { z } from "zod";

function readForm(formData: FormData) {
  return Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, typeof value === "string" ? value : ""]));
}

export async function createClient(formData: FormData) {
  const user = await requireRole("ADMIN", "MANAGER", "AGENT", "DATA_ENTRY");
  const parsed = clientSchema.safeParse(readForm(formData));
  if (!parsed.success) redirect(`/admin/clientes/nuevo?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Datos inválidos")}`);
  const input = parsed.data;

  await prisma.$transaction(async (tx) => {
    const created = await tx.client.create({
      data: {
        type: input.type,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email || undefined,
        phone: input.phone,
        rfc: input.rfc,
        address: input.address,
        company: input.type === "COMPANY" && input.legalName && input.rfc ? {
          create: {
            legalName: input.legalName,
            tradeName: input.tradeName,
            rfc: input.rfc,
            legalRepresentative: input.legalRepresentative,
            taxAddress: input.address,
            partners: { create: (input.partnerNames ?? "").split("\n").map((name) => name.trim()).filter(Boolean).map((fullName) => ({ fullName })) },
          },
        } : undefined,
      },
    });
    await tx.activityLog.create({ data: { userId: user.user.id, action: "Registró un cliente", entityType: "Client", entityId: created.id } });
    return created;
  });
  revalidatePath("/admin/clientes");
  revalidatePath("/admin/expedientes");
  revalidatePath("/admin/empresas");
  revalidatePath("/admin");
  redirect("/admin/expedientes?created=1");
}

export async function updateClient(formData: FormData) {
  const user = await requireRole("ADMIN", "MANAGER", "AGENT", "DATA_ENTRY");
  const clientId = formData.get("clientId");
  if (typeof clientId !== "string" || !clientId) throw new Error("Expediente inválido.");
  const parsed = clientSchema.safeParse(readForm(formData));
  if (!parsed.success) redirect(`/admin/expedientes/${clientId}/editar?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Datos inválidos")}`);
  const input = parsed.data;
  await prisma.$transaction(async (tx) => {
    const client = await tx.client.findFirst({ where: { id: clientId, deletedAt: null }, select: { id: true } });
    if (!client) throw new Error("Expediente no encontrado.");
    await tx.client.update({ where: { id: client.id }, data: { type: input.type, firstName: input.firstName, lastName: input.lastName, email: input.email || undefined, phone: input.phone, rfc: input.rfc, address: input.address } });
    if (input.type === "COMPANY" && input.legalName && input.rfc) {
      await tx.company.upsert({ where: { clientId: client.id }, update: { legalName: input.legalName, tradeName: input.tradeName, rfc: input.rfc, legalRepresentative: input.legalRepresentative, taxAddress: input.address, partners: { deleteMany: {}, create: (input.partnerNames ?? "").split("\n").map((name) => name.trim()).filter(Boolean).map((fullName) => ({ fullName })) } }, create: { clientId: client.id, legalName: input.legalName, tradeName: input.tradeName, rfc: input.rfc, legalRepresentative: input.legalRepresentative, taxAddress: input.address, partners: { create: (input.partnerNames ?? "").split("\n").map((name) => name.trim()).filter(Boolean).map((fullName) => ({ fullName })) } } });
    }
    await tx.activityLog.create({ data: { userId: user.user.id, action: "Actualizó el expediente del cliente", entityType: "Client", entityId: client.id } });
  });
  revalidatePath(`/admin/expedientes/${clientId}`);
  revalidatePath("/admin/expedientes");
  redirect(`/admin/expedientes/${clientId}?updated=1`);
}

export async function archiveClientExpedient(formData: FormData) {
  const user = await requireRole("ADMIN", "MANAGER");
  const clientId = formData.get("clientId");
  if (typeof clientId !== "string" || !clientId) throw new Error("Expediente inválido.");
  await prisma.$transaction(async (tx) => {
    const client = await tx.client.findFirst({ where: { id: clientId, deletedAt: null }, select: { id: true } });
    if (!client) throw new Error("Expediente no encontrado o ya eliminado.");
    await tx.client.update({ where: { id: client.id }, data: { deletedAt: new Date(), isActive: false } });
    await tx.activityLog.create({ data: { userId: user.user.id, action: "Archivó un expediente de cliente", entityType: "Client", entityId: client.id } });
  });
  revalidatePath("/admin/expedientes");
  redirect("/admin/expedientes?archived=1");
}

const procedureDetailsSchema = z.object({ procedureId: z.string().cuid(), vehicleId: z.string().cuid().optional().or(z.literal("")), publicMessage: z.string().trim().max(1500).optional(), internalNotes: z.string().trim().max(3000).optional() });

export async function updateProcedureDetails(formData: FormData) {
  const user = await requireRole("ADMIN", "MANAGER", "AGENT");
  const parsed = procedureDetailsSchema.safeParse(readForm(formData));
  if (!parsed.success) throw new Error("Datos de trámite inválidos.");
  const input = parsed.data;
  await prisma.$transaction(async (tx) => {
    const procedure = await tx.procedure.findUnique({ where: { id: input.procedureId }, select: { id: true, clientId: true } });
    if (!procedure) throw new Error("Trámite no encontrado.");
    if (input.vehicleId) {
      const vehicle = await tx.vehicle.findFirst({ where: { id: input.vehicleId, clientId: procedure.clientId }, select: { id: true } });
      if (!vehicle) throw new Error("La unidad no pertenece al cliente del trámite.");
    }
    await tx.procedure.update({ where: { id: procedure.id }, data: { vehicleId: input.vehicleId || null, publicMessage: input.publicMessage || null, internalNotes: input.internalNotes || null } });
    await tx.activityLog.create({ data: { userId: user.user.id, action: "Editó los datos de un trámite", entityType: "Procedure", entityId: procedure.id } });
  });
  revalidatePath(`/admin/tramites/${input.procedureId}`);
  revalidatePath("/admin/expedientes");
  redirect(`/admin/tramites/${input.procedureId}?updated=1`);
}

export async function cancelProcedure(formData: FormData) {
  const user = await requireRole("ADMIN", "MANAGER");
  const procedureId = formData.get("procedureId");
  if (typeof procedureId !== "string" || !procedureId) throw new Error("Trámite inválido.");
  await prisma.$transaction(async (tx) => {
    const procedure = await tx.procedure.findUnique({ where: { id: procedureId }, select: { id: true, status: true } });
    if (!procedure) throw new Error("Trámite no encontrado.");
    if (procedure.status === ProcedureStatus.CANCELLED) return;
    await tx.procedure.update({ where: { id: procedure.id }, data: { status: ProcedureStatus.CANCELLED } });
    await tx.procedureStatusHistory.create({ data: { procedureId: procedure.id, changedById: user.user.id, fromStatus: procedure.status, toStatus: ProcedureStatus.CANCELLED, internalNote: "Trámite cancelado desde el panel administrativo." } });
    await tx.activityLog.create({ data: { userId: user.user.id, action: "Canceló un trámite", entityType: "Procedure", entityId: procedure.id } });
  });
  revalidatePath(`/admin/tramites/${procedureId}`);
  revalidatePath("/admin/expedientes");
  revalidatePath("/admin");
  redirect(`/admin/tramites/${procedureId}?cancelled=1`);
}

export async function createVehicle(formData: FormData) {
  const user = await requireRole("ADMIN", "MANAGER", "AGENT", "DATA_ENTRY");
  const parsed = vehicleSchema.safeParse(readForm(formData));
  if (!parsed.success) redirect(`/admin/vehiculos/nuevo?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Datos inválidos")}`);
  const input = parsed.data;
  await prisma.$transaction(async (tx) => {
    const created = await tx.vehicle.create({ data: input });
    await tx.activityLog.create({ data: { userId: user.user.id, action: "Registró un vehículo", entityType: "Vehicle", entityId: created.id } });
    return created;
  });
  revalidatePath("/admin/vehiculos");
  revalidatePath("/admin/clientes");
  revalidatePath("/admin/expedientes");
  revalidatePath("/admin");
  redirect("/admin/vehiculos?created=1");
}

export async function createProcedure(formData: FormData) {
  const user = await requireRole("ADMIN", "MANAGER", "AGENT");
  const parsed = procedureSchema.safeParse(readForm(formData));
  if (!parsed.success) redirect(`/admin/tramites/nuevo?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Datos inválidos")}`);
  const input = parsed.data;
  const year = new Date().getFullYear();
  const procedure = await prisma.$transaction(async (tx) => {
    const [sequence, service, vehicle] = await Promise.all([
      tx.folioSequence.upsert({ where: { year }, create: { year, value: 1 }, update: { value: { increment: 1 } } }),
      tx.service.findUnique({ where: { id: input.serviceId }, include: { requirements: { orderBy: { sortOrder: "asc" } } } }),
      input.vehicleId ? tx.vehicle.findUnique({ where: { id: input.vehicleId }, select: { clientId: true } }) : null,
    ]);
    if (!service?.isActive) throw new Error("El servicio seleccionado no existe o está inactivo.");
    if (input.vehicleId && (!vehicle || vehicle.clientId !== input.clientId)) throw new Error("La unidad seleccionada no pertenece al cliente.");
    const folio = `TRM-${year}-${String(sequence.value).padStart(5, "0")}`;
    const created = await tx.procedure.create({
      data: {
        folio,
        clientId: input.clientId,
        vehicleId: input.vehicleId || undefined,
        serviceId: service.id,
        assigneeId: user.user.id,
        publicMessage: input.publicMessage || undefined,
        internalNotes: input.internalNotes || undefined,
        requirements: { create: service.requirements.map((requirement) => ({ serviceRequirementId: requirement.id, label: requirement.label, isRequired: requirement.isRequired })) },
        statusHistory: { create: { toStatus: ProcedureStatus.NEW, changedById: user.user.id, publicMessage: input.publicMessage || undefined, internalNote: input.internalNotes || undefined } },
      },
    });
    await tx.activityLog.create({ data: { userId: user.user.id, action: "Creó un expediente", entityType: "Procedure", entityId: created.id } });
    return created;
  });
  revalidatePath("/admin/tramites");
  revalidatePath("/admin/expedientes");
  revalidatePath("/admin");
  redirect(`/admin/tramites/${procedure.id}`);
}

export async function updateProcedureStatus(formData: FormData) {
  const user = await requireRole("ADMIN", "MANAGER", "AGENT");
  const parsed = procedureStatusSchema.safeParse(readForm(formData));
  if (!parsed.success) throw new Error("Datos de actualización inválidos.");
  const input = parsed.data;
  await prisma.$transaction(async (tx) => {
    const current = await tx.procedure.findUnique({ where: { id: input.procedureId }, select: { status: true } });
    if (!current) throw new Error("Expediente no encontrado.");
    await tx.procedure.update({ where: { id: input.procedureId }, data: { status: input.status, publicMessage: input.publicMessage || undefined } });
    await tx.procedureStatusHistory.create({ data: { procedureId: input.procedureId, changedById: user.user.id, fromStatus: current.status, toStatus: input.status, publicMessage: input.publicMessage || undefined, internalNote: input.internalNote || undefined } });
    await tx.activityLog.create({ data: { userId: user.user.id, action: "Actualizó el estado del expediente", entityType: "Procedure", entityId: input.procedureId, metadata: { from: current.status, to: input.status } } });
  });
  revalidatePath(`/admin/tramites/${input.procedureId}`);
  revalidatePath("/admin/tramites");
  revalidatePath("/admin/expedientes");
  revalidatePath("/admin");
}

export async function uploadProcedureDocument(formData: FormData) {
  const user = await requireRole("ADMIN", "MANAGER", "AGENT", "DATA_ENTRY");
  const procedureId = formData.get("procedureId");
  const requirementId = formData.get("requirementId");
  const file = formData.get("file");
  if (typeof procedureId !== "string" || typeof requirementId !== "string" || !(file instanceof File)) throw new Error("Datos de documento inválidos.");
  const procedure = await prisma.procedure.findUnique({ where: { id: procedureId }, select: { clientId: true, requirements: { where: { id: requirementId }, select: { id: true, label: true } } } });
  if (!procedure || !procedure.requirements.length) throw new Error("El requisito no pertenece al expediente.");
  const category = procedure.requirements[0].label;
  try {
    const saved = await savePrivateFile(file);
    try {
      await prisma.$transaction(async (tx) => {
        const document = await tx.document.create({ data: { clientId: procedure.clientId, uploadedById: user.user.id, category, status: "RECEIVED", ...saved } });
        await tx.procedureDocument.create({ data: { procedureId, documentId: document.id, requirementId } });
        await tx.procedureRequirement.update({ where: { id: requirementId }, data: { isComplete: true, completedAt: new Date() } });
        await tx.activityLog.create({ data: { userId: user.user.id, action: "Subió un documento", entityType: "Document", entityId: document.id } });
      });
    } catch (error) {
      await removePrivateFile(saved.storageKey);
      throw error;
    }
  } catch (error) {
    const message = error instanceof FileValidationError ? error.message : "No fue posible guardar el documento.";
    redirect(`/admin/tramites/${procedureId}?documentError=${encodeURIComponent(message)}`);
  }
  revalidatePath(`/admin/tramites/${procedureId}`);
  revalidatePath("/admin/documentos");
  revalidatePath("/admin/expedientes");
  revalidatePath("/admin");
}

const documentReviewSchema = z.object({
  documentId: z.string().cuid(),
  status: z.enum(["PENDING", "RECEIVED", "UNDER_REVIEW", "APPROVED", "REJECTED", "EXPIRED", "CANCELLED"]),
  reviewNotes: z.string().trim().max(1000).optional(),
});

export async function reviewDocument(formData: FormData) {
  const user = await requireRole("ADMIN", "MANAGER", "AGENT");
  const parsed = documentReviewSchema.safeParse(readForm(formData));
  if (!parsed.success) throw new Error("Datos de revisión inválidos.");
  const document = await prisma.document.findUnique({ where: { id: parsed.data.documentId }, select: { id: true } });
  if (!document) throw new Error("Documento no encontrado.");
  await prisma.$transaction([
    prisma.document.update({ where: { id: document.id }, data: { status: parsed.data.status, reviewNotes: parsed.data.reviewNotes || undefined, reviewedAt: new Date(), reviewedById: user.user.id } }),
    prisma.activityLog.create({ data: { userId: user.user.id, action: "Actualizó el estado documental", entityType: "Document", entityId: document.id, metadata: { status: parsed.data.status } } }),
  ]);
  revalidatePath("/admin/documentos");
  revalidatePath("/admin/clientes");
  revalidatePath("/admin/expedientes");
  revalidatePath("/cuenta/documentos");
}

export async function saveQuote(formData: FormData) {
  const user = await requireRole("ADMIN", "MANAGER", "AGENT");
  const parsed = quoteSchema.safeParse(readForm(formData));
  if (!parsed.success) throw new Error("Datos de cotización inválidos.");
  const input = parsed.data;
  const requestedClientId = formData.get("clientId");
  if (typeof requestedClientId === "string" && requestedClientId) {
    const procedure = await prisma.procedure.findUnique({ where: { id: input.procedureId }, select: { clientId: true } });
    if (!procedure || procedure.clientId !== requestedClientId) throw new Error("El trámite seleccionado no pertenece al cliente.");
  }
  const items = parseQuoteItems(input.items);
  const subtotal = items.reduce((sum, item) => sum.plus(item.amount), new Prisma.Decimal(0));
  const tax = new Prisma.Decimal(input.tax);
  const total = subtotal.plus(tax);
  await prisma.$transaction(async (tx) => {
    const saved = await tx.quote.upsert({
      where: { procedureId: input.procedureId },
      update: { subtotal, tax, total, notes: input.notes || undefined, items: { deleteMany: {}, create: items } },
      create: { procedureId: input.procedureId, subtotal, tax, total, notes: input.notes || undefined, items: { create: items } },
    });
    await tx.activityLog.create({ data: { userId: user.user.id, action: "Guardó una cotización", entityType: "Quote", entityId: saved.id } });
    return saved;
  });
  revalidatePath(`/admin/tramites/${input.procedureId}`);
  revalidatePath("/admin/cotizaciones");
  revalidatePath("/admin");
}

export async function registerPayment(formData: FormData) {
  const user = await requireRole("ADMIN", "MANAGER", "AGENT");
  const parsed = paymentSchema.safeParse(readForm(formData));
  if (!parsed.success) throw new Error("Datos de pago inválidos.");
  const input = parsed.data;
  if (input.amount <= 0) throw new Error("El monto debe ser mayor que cero.");
  const requestedClientId = formData.get("clientId");
  if (typeof requestedClientId === "string" && requestedClientId) {
    const procedure = await prisma.procedure.findUnique({ where: { id: input.procedureId }, select: { clientId: true } });
    if (!procedure || procedure.clientId !== requestedClientId) throw new Error("El trámite seleccionado no pertenece al cliente.");
  }
  await prisma.$transaction(async (tx) => {
    const quote = await tx.quote.findUnique({ where: { procedureId: input.procedureId }, include: { procedure: { select: { clientId: true, payments: { select: { amount: true } } } } } });
    if (!quote) throw new Error("El trámite no tiene una cotización válida.");
    if (requestedClientId && quote.procedure.clientId !== requestedClientId) throw new Error("El trámite seleccionado no pertenece al cliente.");
    const alreadyPaid = quote.procedure.payments.reduce((sum, payment) => sum.plus(payment.amount), new Prisma.Decimal(0));
    if (alreadyPaid.plus(input.amount).greaterThan(quote.total)) throw new Error("El pago excede el saldo pendiente de la cotización.");
    const payment = await tx.payment.create({ data: { ...input, status: "PAID", paidAt: new Date(), reference: input.reference || undefined, proofStorageKey: input.proofStorageKey || undefined } });
    await tx.activityLog.create({ data: { userId: user.user.id, action: "Registró un pago", entityType: "Payment", entityId: payment.id } });
  });
  revalidatePath(`/admin/tramites/${input.procedureId}`);
  revalidatePath("/admin/pagos");
  revalidatePath("/admin");
  revalidatePath("/admin/cotizaciones");
}
