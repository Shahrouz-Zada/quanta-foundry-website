// =============================================================================
// One-off cleanup: remove stale OfferingSession rows left behind by the
// upsert bug described in seed.ts (each republish of a session used to
// create a NEW OfferingSession row instead of repointing the existing one,
// see the comment above the OfferingSessions step in seed.ts for the full
// story). That bug is fixed going forward — this script cleans up rows it
// already created before the fix landed.
//
// SAFE BY DEFAULT: dry-run unless you pass --apply. Refuses to delete any
// row that has ANY Response, Progress, or Artifact referencing it — those
// would be real learner data, and this script does not decide what happens
// to real learner data. It only removes rows that are provably unused.
//
// Usage:
//   npx tsx src/scripts/cleanup-duplicate-offering-sessions.ts            (dry run — reports only)
//   npx tsx src/scripts/cleanup-duplicate-offering-sessions.ts --apply    (actually deletes)
// =============================================================================

import { prisma } from '../lib/prisma';

async function main() {
  const apply = process.argv.includes('--apply');

  // Group all OfferingSession rows by (offeringId, sessionId) — the real
  // "slot" a session occupies in an offering, independent of which
  // published version currently fills it. More than one row per group is
  // the bug: it means a republish forked a new row instead of repointing.
  const rows = await prisma.offeringSession.findMany({
    select: {
      id: true,
      offeringId: true,
      createdAt: true,
      offering: { select: { slug: true } },
      sessionVersion: {
        select: {
          id: true,
          version: true,
          sessionId: true,
          session: { select: { slug: true } },
        },
      },
      _count: { select: { responses: true, progress: true, artifacts: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  const groups = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = `${row.offeringId}::${row.sessionVersion.sessionId}`;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }

  let staleFound = 0;
  let staleDeleted = 0;
  let staleBlocked = 0;

  for (const [, group] of groups) {
    if (group.length <= 1) continue;

    // Keep whichever row points at the highest-numbered SessionVersion
    // (the current published version); everything else in this group is
    // stale, left over from the pre-fix upsert bug.
    const sorted = [...group].sort((a, b) => b.sessionVersion.version - a.sessionVersion.version);
    const [keep, ...stale] = sorted;

    console.log(
      `\nOffering "${keep.offering.slug}" / session "${keep.sessionVersion.session.slug}": ` +
      `${group.length} OfferingSession rows found, keeping v${keep.sessionVersion.version} (${keep.id}).`
    );

    for (const row of stale) {
      staleFound++;
      const hasData = row._count.responses > 0 || row._count.progress > 0 || row._count.artifacts > 0;

      if (hasData) {
        staleBlocked++;
        console.log(
          `  ⛔ NOT deleting ${row.id} (v${row.sessionVersion.version}) — it has ` +
          `${row._count.responses} Response(s), ${row._count.progress} Progress row(s), ` +
          `${row._count.artifacts} Artifact(s) attached. This is real data; decide by hand ` +
          `whether it needs to be migrated onto the row being kept before removing it.`
        );
        continue;
      }

      if (apply) {
        await prisma.offeringSession.delete({ where: { id: row.id } });
        staleDeleted++;
        console.log(`  🗑️  Deleted ${row.id} (v${row.sessionVersion.version}) — no data referenced it.`);
      } else {
        console.log(`  Would delete ${row.id} (v${row.sessionVersion.version}) — no data referenced it. (dry run)`);
      }
    }
  }

  console.log(
    `\n${staleFound} stale row(s) found, ${staleDeleted} deleted, ${staleBlocked} blocked by real data.` +
    (apply ? '' : ' Re-run with --apply to actually delete.')
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
