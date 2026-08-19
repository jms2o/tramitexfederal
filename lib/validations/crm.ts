import { z } from "zod";

const optionalText = z.string().trim().max(255).optional().transform((value) => value || undefined);

export const clientSchema = z.object({
  type: z.enum(["INDIVIDUAL", "COMPANY"]),
  firstName: optionalText,
  lastName: optionalText,
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  phone: z.string().trim().min(8).max(30),
  rfc: optionalText,
  address: optionalText,
  legalName: optionalText,
  tradeName: optionalText,
  legalRepresentative: optionalText,
  partnerNames: z.string().trim().max(2000).optional(),
}).superRefine((data, context) => {
  if (data.type === "INDIVIDUAL" && !data.firstName) context.addIssue({ code: "custom", path: ["firstName"], message: "El nombre es obligatorio." });
  if (data.type === "COMPANY" && !data.legalName) context.addIssue({ code: "custom", path: ["legalName"], message: "La razón social es obligatoria." });
  if (data.type === "COMPANY" && !data.rfc) context.addIssue({ code: "custom", path: ["rfc"], message: "El RFC es obligatorio para empresas." });
});

export const vehicleSchema = z.object({
  clientId: z.string().cuid(),
  brand: z.string().trim().min(2).max(80),
  model: z.string().trim().min(1).max(80),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  vin: optionalText,
  federalPlate: optionalText,
  invoiceRef: optionalText,
  insuranceRef: optionalText,
});
