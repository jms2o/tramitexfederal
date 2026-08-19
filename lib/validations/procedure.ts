import { z } from "zod";

export const procedureSchema = z.object({
  clientId: z.string().cuid(),
  vehicleId: z.string().cuid().optional().or(z.literal("")),
  serviceId: z.string().cuid(),
  publicMessage: z.string().trim().max(500).optional(),
  internalNotes: z.string().trim().max(2000).optional(),
});

export const procedureStatusSchema = z.object({
  procedureId: z.string().cuid(),
  status: z.enum(["NEW", "WAITING_DOCUMENTS", "UNDER_REVIEW", "DOCUMENTS_COMPLETE", "STARTED", "IN_PROGRESS", "READY_FOR_DELIVERY", "COMPLETED", "ON_HOLD", "REJECTED", "CANCELLED"]),
  publicMessage: z.string().trim().max(500).optional(),
  internalNote: z.string().trim().max(2000).optional(),
});
