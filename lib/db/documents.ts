import "server-only";
import { prisma } from "@/lib/db/prisma";
import { requireInternalUser } from "@/lib/auth/session";

export async function getDocuments() {
  await requireInternalUser();
  return prisma.document.findMany({
    include: { client: { select: { firstName: true, lastName: true, company: { select: { legalName: true } } } }, uploadedBy: { select: { name: true } }, procedures: { include: { procedure: { select: { folio: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
