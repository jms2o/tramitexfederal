import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const apply = process.argv.includes("--apply");
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
async function main() {
  const users = await prisma.user.findMany({ where: { role: "CLIENT", client: null }, select: { id: true, email: true, name: true } });
  console.log(`${apply ? "Aplicando" : "Dry-run"}: ${users.length} cuenta(s) CLIENT sin expediente.`);
  for (const user of users) {
    const existing = await prisma.client.findFirst({ where: { userId: null, email: { equals: user.email, mode: "insensitive" } }, select: { id: true } });
    console.log(`${existing ? "Vincularía" : "Crearía"} Client para ${user.email}`);
    if (!apply) continue;
    if (existing) await prisma.client.update({ where: { id: existing.id }, data: { userId: user.id } });
    else await prisma.client.create({ data: { userId: user.id, email: user.email } });
  }
}
main().finally(() => prisma.$disconnect());
