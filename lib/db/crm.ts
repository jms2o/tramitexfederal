import "server-only";
import { prisma } from "@/lib/db/prisma";
import { requireInternalUser } from "@/lib/auth/session";

export async function getClients() {
  await requireInternalUser();
  return prisma.client.findMany({
    where: { deletedAt: null },
    include: { company: { select: { legalName: true } }, vehicles: { select: { brand: true, model: true, federalPlate: true } }, procedures: { select: { folio: true, status: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 4 }, documents: { select: { id: true, category: true, status: true, originalName: true }, orderBy: { createdAt: "desc" }, take: 6 }, _count: { select: { vehicles: true, procedures: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getClientExpedient(id: string) {
  await requireInternalUser();
  return prisma.client.findFirst({
    where: { id, deletedAt: null },
    include: {
      company: { include: { partners: true } },
      vehicles: { orderBy: { updatedAt: "desc" } },
      procedures: {
        orderBy: { updatedAt: "desc" },
        include: {
          service: { select: { name: true } }, assignee: { select: { name: true } }, vehicle: { select: { brand: true, model: true, federalPlate: true } },
          requirements: { include: { documents: { include: { document: { include: { uploadedBy: { select: { name: true } } } } } } }, orderBy: { createdAt: "asc" } },
          quote: { include: { items: true } }, payments: { orderBy: { paidAt: "desc" } }, statusHistory: { orderBy: { createdAt: "desc" }, take: 5, include: { changedBy: { select: { name: true } } } },
        },
      },
    },
  });
}

export async function getCompanies() {
  await requireInternalUser();
  return prisma.company.findMany({
    include: { client: { select: { phone: true, email: true } }, partners: { select: { id: true, fullName: true } } },
    orderBy: { legalName: "asc" },
  });
}

export async function getVehicles() {
  await requireInternalUser();
  return prisma.vehicle.findMany({
    include: { client: { select: { firstName: true, lastName: true, company: { select: { legalName: true } } } }, procedures: { select: { folio: true, status: true }, orderBy: { updatedAt: "desc" }, take: 5 }, _count: { select: { procedures: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getClientOptions() {
  await requireInternalUser();
  return prisma.client.findMany({
    where: { deletedAt: null, isActive: true },
    select: { id: true, firstName: true, lastName: true, company: { select: { legalName: true } } },
    orderBy: { createdAt: "desc" },
  });
}
