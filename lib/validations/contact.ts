import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(30),
  email: z.string().trim().email().max(254),
  clientType: z.enum(["INDIVIDUAL", "COMPANY"]),
  serviceSlug: z.string().trim().max(120).optional().or(z.literal("")),
  state: z.string().trim().min(2).max(80),
  message: z.string().trim().min(10).max(2000),
});
