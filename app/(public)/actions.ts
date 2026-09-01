"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { findPublicTracking } from "@/lib/db/public-tracking";
import { checkRateLimit, getRequestKey } from "@/lib/security/rate-limit";
import { securityFingerprint } from "@/lib/security/security-events";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { contactSchema } from "@/lib/validations/contact";

const trackingLookupSchema = z.object({
  folio: z.string().trim().regex(/^TRM-[0-9]{4}-[0-9]{5}$/),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
});

function requestIp(forwardedFor: string | null) {
  return forwardedFor?.split(",")[0]?.trim() ?? null;
}

export async function submitContactRequest(formData: FormData) {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const ip = requestIp(forwardedFor);
  const key = `contact:${getRequestKey(forwardedFor, "contact")}`;
  if (!checkRateLimit(key, 5, 60 * 60 * 1000).allowed) redirect("/contacto?error=rate-limit");

  const token = formData.get("turnstileToken");
  if (typeof token !== "string" || !await verifyTurnstile(token, ip)) redirect("/contacto?error=turnstile");

  const parsed = contactSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/contacto?error=validation");
  await prisma.contactRequest.create({ data: parsed.data });
  redirect("/contacto?sent=1");
}

export async function lookupPublicTracking(formData: FormData) {
  const parsed = trackingLookupSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false as const, message: "Revisa el folio y el correo e inténtalo nuevamente." };

  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const sourceAllowed = checkRateLimit(`tracking:${getRequestKey(forwardedFor, "tracking")}`, 20, 15 * 60 * 1000).allowed;
  const emailAllowed = checkRateLimit(`tracking:email:${securityFingerprint(parsed.data.email)}`, 10, 15 * 60 * 1000).allowed;
  if (!sourceAllowed || !emailAllowed) return { ok: false as const, message: "Has realizado muchas consultas. Espera unos minutos antes de intentarlo de nuevo." };

  const tracking = await findPublicTracking(parsed.data.folio, parsed.data.email);
  if (!tracking) return { ok: false as const, message: "No encontramos una coincidencia con esos datos. Verifica el folio y el correo." };

  return {
    ok: true as const,
    tracking: { ...tracking, updatedAt: tracking.updatedAt.toISOString() },
  };
}
