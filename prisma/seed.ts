import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ClientType, UserRole } from "../app/generated/prisma/client";
import { services } from "../lib/data/services";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to seed the database.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const permissions = [
    { key: "dashboard.read", name: "Consultar dashboard" },
    { key: "clients.manage", name: "Gestionar clientes y empresas" },
    { key: "vehicles.manage", name: "Gestionar vehículos" },
    { key: "procedures.manage", name: "Gestionar trámites" },
    { key: "documents.manage", name: "Gestionar documentos" },
    { key: "quotes.manage", name: "Gestionar cotizaciones" },
    { key: "payments.manage", name: "Gestionar pagos" },
    { key: "users.manage", name: "Gestionar usuarios" },
    { key: "reports.read", name: "Consultar reportes" },
    { key: "settings.manage", name: "Gestionar configuración" },
    { key: "account.manage", name: "Gestionar cuenta propia" },
    { key: "support.manage", name: "Gestionar soporte" },
  ] as const;
  const rolePermissions: Record<UserRole, readonly string[]> = {
    ADMIN: permissions.map(({ key }) => key),
    MANAGER: ["dashboard.read", "clients.manage", "vehicles.manage", "procedures.manage", "documents.manage", "quotes.manage", "payments.manage", "reports.read"],
    AGENT: ["dashboard.read", "clients.manage", "vehicles.manage", "procedures.manage", "documents.manage", "quotes.manage", "payments.manage"],
    DATA_ENTRY: ["dashboard.read", "clients.manage", "vehicles.manage", "documents.manage"],
    CLIENT: ["account.manage", "support.manage"],
  };
  const roleNames: Record<UserRole, string> = { ADMIN: "Administrador", MANAGER: "Gerente", AGENT: "Asesor", DATA_ENTRY: "Capturista", CLIENT: "Cliente" };

  const permissionRecords = new Map<string, string>();
  for (const permission of permissions) {
    const record = await prisma.permission.upsert({ where: { key: permission.key }, update: { name: permission.name }, create: permission });
    permissionRecords.set(permission.key, record.id);
  }
  for (const role of Object.values(UserRole)) {
    const definition = await prisma.roleDefinition.upsert({ where: { role }, update: { name: roleNames[role] }, create: { role, name: roleNames[role] } });
    await prisma.rolePermission.deleteMany({ where: { roleDefinitionId: definition.id } });
    await prisma.rolePermission.createMany({ data: rolePermissions[role].map((key) => ({ roleDefinitionId: definition.id, permissionId: permissionRecords.get(key)! })) });
  }

  for (const [index, service] of services.entries()) {
    const record = await prisma.service.upsert({
      where: { slug: service.slug },
      update: { name: service.name, description: service.description, sortOrder: index, isActive: true },
      create: { slug: service.slug, name: service.name, description: service.description, sortOrder: index },
    });
    for (const audience of ["persona", "empresa"] as const) {
      const clientType = audience === "persona" ? ClientType.INDIVIDUAL : ClientType.COMPANY;
      for (const [requirementIndex, label] of service.requirements[audience].entries()) {
        await prisma.serviceRequirement.upsert({
          where: { serviceId_audience_sortOrder: { serviceId: record.id, audience: clientType, sortOrder: requirementIndex } },
          update: { label, isRequired: true },
          create: { serviceId: record.id, audience: clientType, label, sortOrder: requirementIndex },
        });
      }
    }
  }
  await prisma.service.updateMany({ where: { slug: { notIn: services.map((service) => service.slug) } }, data: { isActive: false } });

  const settings = [
    { key: "public_tracking.enabled", value: true, description: "Habilita la consulta pública por folio." },
    { key: "documents.max_size_mb", value: 10, description: "Límite operativo de carga de documentos." },
    { key: "organization.timezone", value: "America/Chihuahua", description: "Zona horaria operativa." },
  ];
  for (const setting of settings) {
    await prisma.systemSetting.upsert({ where: { key: setting.key }, update: setting, create: setting });
  }
}

main().then(() => prisma.$disconnect()).catch(async (error: unknown) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
