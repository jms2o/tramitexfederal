import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || "Administrador";
const resetExisting = process.env.ADMIN_RESET_EXISTING === "true";

if (!connectionString || !email || !password) {
  throw new Error("DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD are required.");
}
if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
  throw new Error("ADMIN_PASSWORD must contain at least 12 characters, uppercase, lowercase, a number and a symbol.");
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("ADMIN_EMAIL must be valid.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: email! }, select: { id: true } });
  if (existing && !resetExisting) {
    throw new Error("An account with ADMIN_EMAIL already exists. Set ADMIN_RESET_EXISTING=true only for an intentional credential reset.");
  }
  const passwordHash = await hash(password!, 12);
  const administrator = existing
    ? await prisma.user.update({ where: { id: existing.id }, data: { name, passwordHash, role: UserRole.ADMIN, isActive: true } })
    : await prisma.user.create({ data: { name, email: email!, passwordHash, role: UserRole.ADMIN } });
  await prisma.activityLog.create({
    data: { userId: administrator.id, action: existing ? "Restableció el administrador inicial" : "Creó el administrador inicial", entityType: "User", entityId: administrator.id },
  });
}

main().then(() => prisma.$disconnect()).catch(async (error: unknown) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
