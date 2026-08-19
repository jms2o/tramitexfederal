import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Permite `prisma generate` durante una instalación sin secretos.
    // Los comandos que acceden a datos se preceden con `pnpm env:check` en producción.
    url: process.env.DATABASE_URL ?? "postgresql://invalid:invalid@127.0.0.1:5432/invalid",
  },
});
