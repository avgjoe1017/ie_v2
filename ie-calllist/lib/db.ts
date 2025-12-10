import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  // Use Turso adapter if we have credentials (production)
  if (tursoUrl && tursoToken) {
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
