import { PrismaClient } from '@prisma/client';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Setup connection pool for Neon Serverless Postgres
neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL
});

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any; // We use 'any' here to avoid complex type intersection issues with $extends
};

const basePrisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Enforce immutability for published SessionVersions.
// Published records are an append-only audit trail — they must never be modified or deleted.
export const prisma = globalForPrisma.prisma ?? basePrisma.$extends({
  query: {
    sessionVersion: {
      async update({ args, query }) {
        const target = await basePrisma.sessionVersion.findUnique({ where: args.where });
        if (target?.status === 'PUBLISHED') {
          throw new Error('Forbidden: Published SessionVersions are immutable and cannot be modified.');
        }
        return query(args);
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async updateMany({ args, query }) {
        throw new Error('Forbidden: Bulk updates on SessionVersions are disabled to enforce immutability.');
      },
      async delete({ args, query }) {
        const target = await basePrisma.sessionVersion.findUnique({ where: args.where });
        if (target?.status === 'PUBLISHED') {
          throw new Error('Forbidden: Published SessionVersions cannot be deleted.');
        }
        return query(args);
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async deleteMany({ args, query }) {
        throw new Error('Forbidden: Bulk deletes on SessionVersions are disabled to enforce immutability.');
      },
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
