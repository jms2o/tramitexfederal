import "server-only";

import { createHash } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { sendTransactionalEmail } from "@/lib/email/transactional";

type SecuritySeverity = "INFO" | "WARNING" | "HIGH";

type SecurityEvent = {
  action: string;
  severity: SecuritySeverity;
  userId?: string | null;
  entityType?: string;
  entityId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  details?: Record<string, string | number | boolean | null>;
  alert?: boolean;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

export function securityFingerprint(value: string) {
  const salt = process.env.AUTH_SECRET || "tramitexfederal-security-event";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex").slice(0, 20);
}

export async function recordSecurityEvent(event: SecurityEvent) {
  const entityType = event.entityType || "SecurityEvent";
  const entityId = event.entityId || null;
  const cutoff = new Date(Date.now() - 15 * 60 * 1000);

  let recentlyAlerted = false;
  if (event.alert) {
    try {
      recentlyAlerted = Boolean(await prisma.activityLog.findFirst({
        where: {
          action: event.action,
          userId: event.userId ?? null,
          entityType,
          entityId,
          createdAt: { gte: cutoff },
        },
        select: { id: true },
      }));
    } catch (error) {
      console.error("No fue posible comprobar alertas de seguridad recientes.", error);
    }
  }

  const metadata = {
    severity: event.severity,
    ...(event.ip ? { ipFingerprint: securityFingerprint(event.ip) } : {}),
    ...(event.userAgent ? { userAgent: event.userAgent.slice(0, 220) } : {}),
    ...(event.details ?? {}),
  };

  try {
    await prisma.activityLog.create({
      data: {
        userId: event.userId ?? null,
        action: event.action,
        entityType,
        entityId,
        metadata,
      },
    });
  } catch (error) {
    console.error("No fue posible registrar un evento de seguridad.", error);
    return;
  }

  const recipient = process.env.SECURITY_ALERT_EMAIL?.trim();
  if (!event.alert || recentlyAlerted || !recipient) return;

  const source = event.ip ? escapeHtml(event.ip) : "No disponible";
  const userAgent = event.userAgent ? escapeHtml(event.userAgent.slice(0, 220)) : "No disponible";
  const timestamp = new Intl.DateTimeFormat("es-MX", { dateStyle: "full", timeStyle: "long", timeZone: "America/Mexico_City" }).format(new Date());

  try {
    await sendTransactionalEmail({
      to: recipient,
      subject: `[Seguridad ${event.severity}] ${event.action}`,
      html: `<h2>Alerta de seguridad de TramitexFederal</h2><p><strong>Evento:</strong> ${escapeHtml(event.action)}</p><p><strong>Nivel:</strong> ${event.severity}</p><p><strong>Fecha:</strong> ${escapeHtml(timestamp)}</p><p><strong>IP de origen:</strong> ${source}</p><p><strong>Navegador/dispositivo:</strong> ${userAgent}</p><p>Revisa el panel y los registros de actividad si no reconoces este evento.</p>`,
    });
  } catch (error) {
    console.error("No fue posible enviar la alerta de seguridad.", error);
  }
}
