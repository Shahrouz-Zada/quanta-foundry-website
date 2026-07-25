import 'dotenv/config';
import { Visibility, Audience, Status } from '@prisma/client';
import { createHash } from 'crypto';
import { session01 } from '../content/sessions/session-01';
import { prisma } from '../lib/prisma';

function hashContent(content: any) {
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}

async function main() {
  console.log('Seeding Database...');

  // 1. Create a platform Admin and a Learner
  const admin = await prisma.user.upsert({
    where: { email: 'admin@quantafoundry.com' },
    update: {},
    create: {
      email: 'admin@quantafoundry.com',
      name: 'System Admin',
      globalRole: 'ADMIN',
    },
  });

  const learner = await prisma.user.upsert({
    where: { email: 'learner@example.com' },
    update: {},
    create: {
      email: 'learner@example.com',
      name: 'Test Learner',
    },
  });

  // 2. Create Track
  const track = await prisma.track.upsert({
    where: { slug: 'applied-finance' },
    update: {},
    create: {
      id: 'applied-finance',
      slug: 'applied-finance',
      title: 'Applied Quantitative Finance',
      domain: 'quant-finance',
      visibility: Visibility.PUBLIC,
    },
  });

  // 3. Create Session Identity
  const session = await prisma.session.upsert({
    where: { slug: session01.slug },
    update: {},
    create: {
      id: session01.id,
      trackId: track.id,
      slug: session01.slug,
      title: session01.title,
    },
  });

  // 4. Publish SessionVersion if content changed
  const currentHash = hashContent(session01);
  const latestVersion = await prisma.sessionVersion.findFirst({
    where: { sessionId: session.id },
    orderBy: { version: 'desc' },
  });

  let activeVersionId = latestVersion?.id;

  if (!latestVersion || latestVersion.contentHash !== currentHash) {
    const newVersionNumber = (latestVersion?.version || 0) + 1;
    console.log(`Publishing v${newVersionNumber} of ${session01.slug}...`);
    
    const newVersion = await prisma.sessionVersion.create({
      data: {
        sessionId: session.id,
        version: newVersionNumber,
        status: Status.PUBLISHED,
        contentHash: currentHash,
        schemaVersion: '1.0.0',
        content: session01 as any,
        publishedAt: new Date(),
      }
    });
    
    await prisma.session.update({
      where: { id: session.id },
      data: { latestPublishedVersionId: newVersion.id },
    });
    
    activeVersionId = newVersion.id;
  }

  // 5. Create Offerings (Cohort & Community)
  const cohortOffering = await prisma.offering.create({
    data: {
      trackId: track.id,
      name: 'ESDES M2 — Fall 2026',
      audience: Audience.COHORT,
      visibility: Visibility.COHORT,
      gradingEnabled: true,
      offeringSessions: {
        create: {
          sessionVersionId: activeVersionId!,
          order: 1,
        }
      },
      enrollments: {
        create: {
          userId: learner.id,
          role: 'LEARNER'
        }
      }
    }
  });

  const communityOffering = await prisma.offering.create({
    data: {
      trackId: track.id,
      name: 'QF Reading Club — Open',
      audience: Audience.COMMUNITY,
      visibility: Visibility.COMMUNITY,
      gradingEnabled: false,
      offeringSessions: {
        create: {
          sessionVersionId: activeVersionId!,
          order: 1,
        }
      },
      enrollments: {
        create: {
          userId: learner.id,
          role: 'LEARNER'
        }
      }
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
