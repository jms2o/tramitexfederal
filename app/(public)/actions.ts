"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, getRequestKey } from "@/lib/security/rate-limit";
import { contactSchema } from "@/lib/validations/contact";

export async function submitContactRequest(formData: FormData) {
  const requestHeaders = await headers();
  const key = `contact:${getRequestKey(requestHeaders.get("x-forwarded-for"), "contact")}`;
  if (!checkRateLimit(key, 5, 60 * 60 * 1000).allowed) redirect("/contacto?error=rate-limit");
  const parsed = contactSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/contacto?error=validation");
  await prisma.contactRequest.create({ data: parsed.data });
  redirect("/contacto?sent=1");
}
