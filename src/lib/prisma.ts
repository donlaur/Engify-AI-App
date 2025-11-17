/**
 * Legacy Prisma client stub
 * Note: This file is not currently used. The project uses MongoDB.
 * Kept for backwards compatibility but stubbed to avoid build errors.
 */

// Stub implementation - @prisma/client not generated
type PrismaClient = any;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.prisma || null;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
