import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Prefer explicit Turso env vars, but fall back to DATABASE_URL in production
  let tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || tursoUrl === 'undefined') {
    tursoUrl = process.env.DATABASE_URL;
  }

  // Use Turso adapter if we have credentials (production)
  if (tursoUrl && tursoToken && tursoUrl.startsWith('libsql://')) {
    // Dynamically import adapter to avoid build issues
    const { PrismaLibSql } = require('@prisma/adapter-libsql');
    const { createClient } = require('@libsql/client');
    
    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });

    const adapter = new PrismaLibSql(libsql);
    return new PrismaClient({ adapter });
  }

  // Use local SQLite for development
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
