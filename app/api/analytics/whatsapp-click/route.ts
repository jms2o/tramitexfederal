import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, getRequestKey } from "@/lib/security/rate-limit";
import { securityFingerprint } from "@/lib/security/security-events";

const sourceToEntityType = {
  "floating-bubble": "WhatsAppBubble",
  "home-hero": "WhatsAppHero",
  "client-help": "WhatsAppClientHelp",
  "document-help": "WhatsAppDocumentHelp",
} as const;

type WhatsAppSource = keyof typeof sourceToEntityType;

function sanitizeContext(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entries = Object.entries(value as Record<string, unknown>).slice(0, 10);
  const clean: Record<string, string | number | boolean | null> = {};
  for (const [key, raw] of entries) {
    const safeKey = key.slice(0, 40);
    if (typeof raw === "string") clean[safeKey] = raw.slice(0, 180);
    else if (typeof raw === "number" || typeof raw === "boolean" || raw === null) clean[safeKey] = raw;
  }
  return Object.keys(clean).length ? clean : undefined;
}

export async function POST(request: Request) {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? null;
  const userAgent = requestHeaders.get("user-agent")?.slice(0, 220) ?? null;
  const requestKey = getRequestKey(forwardedFor, "whatsapp-analytics");

  if (!checkRateLimit(`whatsapp-click:${requestKey}`, 40, 60 * 60 * 1000).allowed) {
    return new Response(null, { status: 204 });
  }

  let body: { source?: unknown; path?: unknown; context?: unknown };
  try {
    body = await request.json() as { source?: unknown; path?: unknown; context?: unknown };
  } catch {
    return new Response(null, { status: 204 });
  }

  if (typeof body.source !== "string" || !(body.source in sourceToEntityType)) {
    return new Response(null, { status: 204 });
  }

  const source = body.source as WhatsAppSource;
  const entityType = sourceToEntityType[source];
  const path = typeof body.path === "string" ? body.path.slice(0, 160) : "/";
  const context = sanitizeContext(body.context);
  const visitorId = securityFingerprint(`${ip ?? "unknown"}|${userAgent ?? "unknown"}`);
  const duplicateCutoff = new Date(Date.now() - 2 * 60 * 1000);

  const recent = await prisma.activityLog.findFirst({
    where: {
      action: "WHATSAPP_CLICK",
      entityType,
      entityId: visitorId,
      createdAt: { gte: duplicateCutoff },
    },
    select: { id: true },
  });

  if (!recent) {
    await prisma.activityLog.create({
      data: {
        action: "WHATSAPP_CLICK",
        entityType,
        entityId: visitorId,
        metadata: { source, path, ...(context ? { context } : {}) },
      },
    });
  }

  return new Response(null, { status: 204 });
}
