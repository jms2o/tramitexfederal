import { z } from "zod";

const amount = z.coerce.number().nonnegative().max(9_999_999.99);

export const quoteSchema = z.object({
  procedureId: z.string().cuid(),
  tax: amount,
  notes: z.string().trim().max(1500).optional(),
  items: z.string().trim().min(3).max(3000),
});

export const paymentSchema = z.object({
  procedureId: z.string().cuid(),
  amount,
  method: z.enum(["CASH", "TRANSFER", "CARD", "OTHER"]),
  reference: z.string().trim().max(255).optional(),
  proofStorageKey: z.string().trim().max(255).optional(),
});

export function parseQuoteItems(value: string) {
  const items = value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [concept, rawAmount] = line.split("|").map((part) => part.trim());
    const parsedAmount = Number(rawAmount);
    if (!concept || !Number.isFinite(parsedAmount) || parsedAmount < 0) throw new Error("Cada concepto debe usar el formato: Concepto | 1250.00");
    return { concept: concept.slice(0, 255), amount: parsedAmount };
  });
  if (!items.length) throw new Error("Agrega al menos un concepto.");
  return items;
}
