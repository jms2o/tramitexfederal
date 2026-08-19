import { getActiveSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { readPrivateFile } from "@/lib/security/private-storage";

export const runtime = "nodejs";

export async function GET(_request: Request, context: RouteContext<"/api/documents/[id]/download">) {
  const session = await getActiveSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { id } = await context.params;
  const document = await prisma.document.findUnique({ where: { id }, select: { id: true, clientId: true, originalName: true, mimeType: true, storageKey: true } });
  if (!document) return new Response("Not found", { status: 404 });
  if (session.user.role === "CLIENT") {
    const client = await prisma.client.findUnique({ where: { userId: session.user.id }, select: { id: true } });
    if (!client || client.id !== document.clientId) return new Response("Not found", { status: 404 });
  }

  try {
    const contents = await readPrivateFile(document.storageKey);
    try {
      await prisma.activityLog.create({ data: { userId: session.user.id, action: "Descargó un documento", entityType: "Document", entityId: document.id } });
    } catch (error) {
      console.error("No fue posible registrar la descarga del documento.", error);
      return new Response("Audit log unavailable", { status: 503 });
    }
    const filename = document.originalName.replace(/[\\/"\r\n]/g, "_");
    return new Response(new Uint8Array(contents), { headers: { "Content-Type": document.mimeType, "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "private, no-store" } });
  } catch {
    return new Response("File unavailable", { status: 404 });
  }
}
