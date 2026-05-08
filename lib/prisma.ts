import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Global type for dev hot-reload (prevents multiple Prisma instances)
 */
const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
};

/**
 * PostgreSQL adapter (Prisma 7 style)
 */
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

/**
 * Create Prisma client
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

/**
 * Prevent multiple instances in development (Next.js hot reload fix)
 */
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}