import { PrismaClient } from "./generated/prisma";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Prisma v7 requires an adapter for SQLite
// Use libsql adapter which supports file-based SQLite
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaLibSql({
    url: "file:prisma/dev.db",
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
