/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from 'dotenv';
config({ path: '.env.local', override: true });

import { Visibility, Audience, Status } from '@prisma/client';
import { createHash } from 'crypto';
import { session01 } from '../content/sessions/session-01';
import { prisma } from '../lib/prisma';

function hashContent(content: any) {
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}

async function main() {
  // Production guard: Never run in production unless explicitly overridden.
  if (process.env.NODE_ENV === 'production' && !process.env.DANGEROUS_ALLOW_PROD_SEED) {
    console.error('Seed script aborted: Refusing to run in production without DANGEROUS_ALLOW_PROD_SEED.');
    process.exit(1);
  }

  console.log('Seeding Database (idempotent)...');

  // 1. Users — upsert on email (already idempotent)
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

  // 2. Track — upsert on slug (already idempotent)
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

  // 3. Session Identity — upsert on slug (already idempotent)
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

  // 4. Publish SessionVersion only if content has changed (content-hash gate)
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
  } else {
    console.log(`SessionVersion hash unchanged — skipping publish of ${session01.slug}.`);
  }

  // 5. Cohort Offering — upsert on slug (idempotent via schema @@unique)
  const cohortOffering = await prisma.offering.upsert({
    where: { slug: 'esdes-m2-fall-2026' },
    update: {},
    create: {
      slug: 'esdes-m2-fall-2026',
      trackId: track.id,
      name: 'ESDES M2 — Fall 2026',
      audience: Audience.COHORT,
      visibility: Visibility.COHORT,
      gradingEnabled: true,
    },
  });

  // 6. Community Offering — upsert on slug (idempotent via schema @@unique)
  const communityOffering = await prisma.offering.upsert({
    where: { slug: 'qf-reading-club-open' },
    update: {},
    create: {
      slug: 'qf-reading-club-open',
      trackId: track.id,
      name: 'QF Reading Club — Open',
      audience: Audience.COMMUNITY,
      visibility: Visibility.COMMUNITY,
      gradingEnabled: false,
    },
  });

  // 7. OfferingSessions — repoint to the newly published version rather than
  // forking a new row per republish.
  //
  // This used to upsert keyed on @@unique([offeringId, sessionVersionId]).
  // That key always misses on a republish, because the new sessionVersionId
  // has never been paired with this offeringId before — so `upsert` always
  // took the create branch, leaving the OLD OfferingSession row (still
  // pointing at the previous version) in place, orphaned, alongside a new
  // one. Two rows then exist for the same offering/session slot, and
  // whatever reads it with `findFirst` and no explicit order (see the
  // session page) has no guarantee which one it gets — this is exactly what
  // caused the 7-stage restore to keep showing 4 stages after a reseed.
  //
  // Fixed by finding the existing OfferingSession for this offering that
  // belongs to ANY version of this Session (joining through
  // sessionVersion.sessionId, not sessionVersionId) and repointing its
  // sessionVersionId in place. Preserving the row's own id is what matters:
  // every Response/Progress/Artifact a learner already has is a foreign key
  // into that id, so repointing it makes them see the new content without
  // losing anything — versus creating a new row, which is what stranded
  // them in the first place.
  for (const offering of [cohortOffering, communityOffering]) {
    const existing = await prisma.offeringSession.findFirst({
      where: {
        offeringId: offering.id,
        sessionVersion: { sessionId: session.id },
      },
    });

    if (existing) {
      if (existing.sessionVersionId !== activeVersionId) {
        await prisma.offeringSession.update({
          where: { id: existing.id },
          data: { sessionVersionId: activeVersionId! },
        });
        console.log(`  Repointed OfferingSession ${existing.id} (${offering.slug}) to the newly published version.`);
      }
    } else {
      await prisma.offeringSession.create({
        data: {
          offeringId: offering.id,
          sessionVersionId: activeVersionId!,
          order: 1,
        },
      });
    }
  }

  // 8. Enrollments — upsert on @@unique([offeringId, userId])
  for (const offering of [cohortOffering, communityOffering]) {
    await prisma.enrollment.upsert({
      where: {
        offeringId_userId: {
          offeringId: offering.id,
          userId: learner.id,
        },
      },
      update: {},
      create: {
        offeringId: offering.id,
        userId: learner.id,
        role: 'LEARNER',
      },
    });
  }

  console.log('Seed completed successfully (idempotent run).');
  console.log(`  Admin: ${admin.email}`);
  console.log(`  Learner: ${learner.email}`);
  console.log(`  Cohort Offering: ${cohortOffering.slug}`);
  console.log(`  Community Offering: ${communityOffering.slug}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

