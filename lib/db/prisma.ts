import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const databaseUrlFile = process.env.DATABASE_URL_FILE;
if (!process.env.DATABASE_URL && databaseUrlFile) {
  const fs = require("node:fs") as typeof import("node:fs");
  process.env.DATABASE_URL = fs.readFileSync(databaseUrlFile, "utf8").trim();
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
