import { z } from "zod";

export const clientProcedureSchema = z.object({ serviceId: z.string().cuid() });
export const clientProfileSchema = z.object({ firstName: z.string().trim().max(100).optional(), lastName: z.string().trim().max(100).optional(), phone: z.string().trim().min(8).max(30).optional(), address: z.string().trim().max(255).optional() });
export const supportTicketSchema = z.object({ subject: z.string().trim().min(4).max(160), body: z.string().trim().min(10).max(2000), procedureId: z.string().cuid().optional().or(z.literal("")) });
export const advisorAssistanceSchema = z.object({
  fullName: z.string().trim().min(3).max(160),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().min(8).max(30),
  serviceId: z.string().cuid(),
  contactMethod: z.enum(["WHATSAPP", "PHONE", "EMAIL"]),
  preferredTime: z.string().trim().max(120).optional().or(z.literal("")),
  comments: z.string().trim().max(1200).optional().or(z.literal("")),
  consent: z.literal("on"),
});
