import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, getRequestKey } from "@/lib/security/rate-limit";
import { securityFingerprint } from "@/lib/security/security-events";

const sourceToEntityType = {
  "floating-bubble": "WhatsAppBubble",
  "home-hero": "WhatsAppHero",
} as const;

type WhatsAppSource = keyof typeof sourceToEntityType;

export async function POST(request: Request) {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? null;
  const userAgent = requestHeaders.get("user-agent")?.slice(0, 220) ?? null;
  const requestKey = getRequestKey(forwardedFor, "whatsapp-analytics");

  if (!checkRateLimit(`whatsapp-click:${requestKey}`, 30, 60 * 60 * 1000).allowed) {
    return new Response(null, { status: 204 });
  }

  let body: { source?: unknown; path?: unknown };
  try {
    body = await request.json() as { source?: unknown; path?: unknown };
  } catch {
    return new Response(null, { status: 204 });
  }

  if (typeof body.source !== "string" || !(body.source in sourceToEntityType)) {
    return new Response(null, { status: 204 });
  }

  const source = body.source as WhatsAppSource;
  const entityType = sourceToEntityType[source];
  const path = typeof body.path === "string" ? body.path.slice(0, 160) : "/";
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
        metadata: { source, path },
      },
    });
  }

  return new Response(null, { status: 204 });
}
