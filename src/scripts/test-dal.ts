/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config';
import assert from 'node:assert';
import { requireOfferingRole, getLearnerSessionState } from '../lib/dal';
import { prisma } from '../lib/prisma';
import { EnrollmentRole, GlobalRole, Audience, Visibility, Status } from '@prisma/client';
import * as authModule from '../auth';
import { createHash } from 'crypto';

// Mock the auth module so we can simulate different authenticated users
const mockAuth = (userId: string | undefined) => {
  (authModule.auth as any) = async () => userId ? { user: { id: userId } } : null;
};

async function runTests() {
  console.log('Running DAL Authorization Tests...\n');

  // ── Shared test fixtures ────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: { email: `test_admin_${Date.now()}@example.com`, globalRole: GlobalRole.ADMIN }
  });
  const learner1 = await prisma.user.create({
    data: { email: `learner1_${Date.now()}@example.com`, globalRole: GlobalRole.USER }
  });
  const learner2 = await prisma.user.create({
    data: { email: `learner2_${Date.now()}@example.com`, globalRole: GlobalRole.USER }
  });

  // Cohort offering — learner1 enrolled, learner2 not enrolled
  const cohortOffering = await prisma.offering.create({
    data: {
      slug: `test-cohort-${Date.now()}`,
      name: 'Test Cohort Offering',
      audience: Audience.COHORT,
      visibility: Visibility.COHORT,
    }
  });
  await prisma.enrollment.create({
    data: { userId: learner1.id, offeringId: cohortOffering.id, role: EnrollmentRole.LEARNER }
  });

  // Community offering — both learners enrolled
  const communityOffering = await prisma.offering.create({
    data: {
      slug: `test-community-${Date.now()}`,
      name: 'Test Community Offering',
      audience: Audience.COMMUNITY,
      visibility: Visibility.COMMUNITY,
    }
  });
  await prisma.enrollment.create({
    data: { userId: learner1.id, offeringId: communityOffering.id, role: EnrollmentRole.LEARNER }
  });
  await prisma.enrollment.create({
    data: { userId: learner2.id, offeringId: communityOffering.id, role: EnrollmentRole.LEARNER }
  });

  // Session + Version for OfferingSession tests
  const track = await prisma.track.create({
    data: { slug: `test-track-${Date.now()}`, title: 'Test Track', domain: 'test', visibility: Visibility.PUBLIC }
  });
  const session = await prisma.session.create({
    data: { trackId: track.id, slug: `test-session-${Date.now()}`, title: 'Test Session' }
  });
  const contentHash = createHash('sha256').update('{}').digest('hex');
  const sessionVersion = await prisma.sessionVersion.create({
    data: {
      sessionId: session.id,
      version: 1,
      status: Status.PUBLISHED,
      contentHash,
      schemaVersion: '1.0.0',
      content: {},
      publishedAt: new Date(),
    }
  });
  const cohortOfferingSession = await prisma.offeringSession.create({
    data: { offeringId: cohortOffering.id, sessionVersionId: sessionVersion.id, order: 1 }
  });
  const communityOfferingSession = await prisma.offeringSession.create({
    data: { offeringId: communityOffering.id, sessionVersionId: sessionVersion.id, order: 1 }
  });

  try {
    // ── Test 1: Admin implicit INSTRUCTOR access ────────────────────────────
    mockAuth(admin.id);
    const adminResult = await requireOfferingRole(cohortOffering.id, [EnrollmentRole.INSTRUCTOR]);
    assert.strictEqual(adminResult.user.id, admin.id);
    console.log('✅ Test 1: Admin implicitly granted INSTRUCTOR access.');

    // ── Test 2: Enrolled learner granted LEARNER access ────────────────────
    mockAuth(learner1.id);
    const learnerResult = await requireOfferingRole(cohortOffering.id, [EnrollmentRole.LEARNER]);
    assert.strictEqual(learnerResult.user.id, learner1.id);
    console.log('✅ Test 2: Enrolled learner granted LEARNER access.');

    // ── Test 3: Learner cannot escalate to INSTRUCTOR ──────────────────────
    mockAuth(learner1.id);
    await assert.rejects(
      async () => requireOfferingRole(cohortOffering.id, [EnrollmentRole.INSTRUCTOR]),
      /Forbidden: Requires one of \[INSTRUCTOR\]/
    );
    console.log('✅ Test 3: Learner properly denied INSTRUCTOR access.');

    // ── Test 4: Unenrolled user denied ─────────────────────────────────────
    mockAuth(learner2.id);
    await assert.rejects(
      async () => requireOfferingRole(cohortOffering.id, [EnrollmentRole.LEARNER]),
      /Forbidden: You are not enrolled in this offering./
    );
    console.log('✅ Test 4: Unenrolled user properly denied access.');

    // ── Test 5: Unauthenticated request denied ─────────────────────────────
    mockAuth(undefined);
    await assert.rejects(
      async () => requireOfferingRole(cohortOffering.id, [EnrollmentRole.LEARNER]),
      /Unauthorized/
    );
    console.log('✅ Test 5: Unauthenticated request properly rejected.');

    // ── Test 6: Response / Progress / Artifact isolation (Cohort) ──────────
    // Create Response, Progress, and Project+Artifact owned by learner1
    await prisma.response.create({
      data: { userId: learner1.id, offeringSessionId: cohortOfferingSession.id, blockId: 'block-1', value: { text: 'L1 answer' } }
    });
    await prisma.progress.create({
      data: { userId: learner1.id, offeringSessionId: cohortOfferingSession.id, stageId: 'stage-1', state: 'IN_PROGRESS' }
    });
    const l1Project = await prisma.project.create({
      data: { ownerId: learner1.id, title: 'L1 Project', visibility: Visibility.COHORT }
    });
    await prisma.artifact.create({
      // type must match BRIEF_ARTIFACT_TYPE in dal.ts — getLearnerSessionState
      // now filters `artifacts` to that type, so a different type here would
      // silently make this isolation check vacuous (an empty array passes
      // .every() trivially) instead of actually exercising the filter.
      data: {
        projectId: l1Project.id,
        type: 'prediction-brief',
        title: 'L1 Notebook',
        createdFromOfferingSessionId: cohortOfferingSession.id,
      }
    });
    // Create Response and Progress owned by learner2 (same OfferingSession)
    await prisma.response.create({
      data: { userId: learner2.id, offeringSessionId: cohortOfferingSession.id, blockId: 'block-1', value: { text: 'L2 answer' } }
    });
    await prisma.progress.create({
      data: { userId: learner2.id, offeringSessionId: cohortOfferingSession.id, stageId: 'stage-1', state: 'COMPLETE' }
    });
    const l2Project = await prisma.project.create({
      data: { ownerId: learner2.id, title: 'L2 Project', visibility: Visibility.COHORT }
    });
    await prisma.artifact.create({
      data: {
        projectId: l2Project.id,
        type: 'prediction-brief',
        title: 'L2 Notebook',
        createdFromOfferingSessionId: cohortOfferingSession.id,
      }
    });
    // Learner1 fetches their state — must NOT see learner2's data
    mockAuth(learner1.id);
    const l1State = await getLearnerSessionState(cohortOfferingSession.id);
    assert.ok(l1State.responses.every((r: any) => r.userId === learner1.id), 'Responses must only belong to learner1');
    assert.ok(l1State.progress.every((p: any) => p.userId === learner1.id), 'Progress must only belong to learner1');
    assert.ok(l1State.artifacts.every((a: any) => a.project.ownerId === learner1.id), 'Artifacts must only belong to learner1');
    assert.strictEqual(l1State.responses.length, 1);
    assert.strictEqual(l1State.progress.length, 1);
    console.log('✅ Test 6: Cohort offering — learner sees only their own Response/Progress/Artifact data.');

    // ── Test 7: Community offering isolation ───────────────────────────────
    // Learner1 creates a response in the Community session
    await prisma.response.create({
      data: { userId: learner1.id, offeringSessionId: communityOfferingSession.id, blockId: 'block-1', value: { text: 'community L1 answer' } }
    });
    // Learner2 also creates a response in the same Community session
    await prisma.response.create({
      data: { userId: learner2.id, offeringSessionId: communityOfferingSession.id, blockId: 'block-1', value: { text: 'community L2 answer' } }
    });
    // Learner1 fetches state — must NOT see learner2's community response
    mockAuth(learner1.id);
    const communityState = await getLearnerSessionState(communityOfferingSession.id);
    assert.ok(communityState.responses.every((r: any) => r.userId === learner1.id), 'Community responses must be isolated per learner');
    assert.strictEqual(communityState.responses.length, 1);
    console.log('✅ Test 7: Community offering — learner2\'s private work is never exposed to learner1.');

    // ── Test 8: Published SessionVersion cannot be deleted ─────────────────
    await assert.rejects(
      async () => prisma.sessionVersion.delete({ where: { id: sessionVersion.id } }),
      /Forbidden: Published SessionVersions cannot be deleted/
    );
    console.log('✅ Test 8: Published SessionVersion correctly rejected on delete attempt.');

    console.log('\n🎉 All 8 DAL Tests Passed!');
  } finally {
    // Cleanup test data — order matters due to FK constraints
    await prisma.response.deleteMany({ where: { offeringSessionId: { in: [cohortOfferingSession.id, communityOfferingSession.id] } } });
    await prisma.progress.deleteMany({ where: { offeringSessionId: { in: [cohortOfferingSession.id, communityOfferingSession.id] } } });
    await prisma.artifact.deleteMany({ where: { createdFromOfferingSessionId: { in: [cohortOfferingSession.id, communityOfferingSession.id] } } });
    await prisma.project.deleteMany({ where: { ownerId: { in: [learner1.id, learner2.id] } } });
    await prisma.offeringSession.deleteMany({ where: { id: { in: [cohortOfferingSession.id, communityOfferingSession.id] } } });
    // Mark sessionVersion as DRAFT so we can delete it (it's a test record, not real published content)
    await prisma.$executeRaw`UPDATE "SessionVersion" SET status = 'DRAFT' WHERE id = ${sessionVersion.id}`;
    await prisma.sessionVersion.delete({ where: { id: sessionVersion.id } });
    await prisma.session.delete({ where: { id: session.id } });
    await prisma.track.delete({ where: { id: track.id } });
    await prisma.enrollment.deleteMany({ where: { offeringId: { in: [cohortOffering.id, communityOffering.id] } } });
    await prisma.offering.deleteMany({ where: { id: { in: [cohortOffering.id, communityOffering.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [admin.id, learner1.id, learner2.id] } } });
    console.log('Cleanup complete.');
  }
}

runTests().catch(console.error).finally(() => process.exit(0));

