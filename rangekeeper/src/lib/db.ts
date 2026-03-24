/**
 * Prisma Client Singleton
 *
 * In development, Next.js hot-reloading can create multiple PrismaClient instances.
 * This module ensures only one instance exists at a time by caching it on the global object.
 *
 * In production, the module cache persists for the lifetime of the process,
 * so a new instance is only created once.
 *
 * @see https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
