import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('=== All Users ===');
  const users = await prisma.user.findMany({
    include: {
      enrollments: { include: { offering: { select: { slug: true } } } },
      accounts: { select: { provider: true, providerAccountId: true } },
    },
  });
  for (const u of users) {
    console.log(`\nUser ID: ${u.id}`);
    console.log(`  Email: ${u.email}`);
    console.log(`  Name: ${u.name}`);
    console.log(`  GlobalRole: ${u.globalRole}`);
    console.log(`  Accounts: ${u.accounts.map(a => a.provider).join(', ') || 'NONE (no OAuth link)'}`);
    console.log(`  Enrollments: ${u.enrollments.map(e => `${e.offering.slug} (${e.role})`).join(', ') || 'NONE'}`);
  }

  console.log('\n=== All Offerings ===');
  const offerings = await prisma.offering.findMany({
    include: {
      offeringSessions: {
        include: {
          sessionVersion: {
            include: { session: { select: { slug: true, title: true } } }
          }
        }
      }
    }
  });
  for (const o of offerings) {
    console.log(`\nOffering: ${o.slug} (ID: ${o.id})`);
    for (const os of o.offeringSessions) {
      console.log(`  Session: ${os.sessionVersion.session.slug} — "${os.sessionVersion.session.title}"`);
      console.log(`    OfferingSession ID: ${os.id}`);
    }
  }
}

main().catch(console.error).finally(() => process.exit());
