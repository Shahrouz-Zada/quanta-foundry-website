import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { del } from '@vercel/blob';
import { classesDueForDeletion, purgeClassData } from '@/lib/privacy-server';
import { studentFilesToken } from '@/lib/workspace-files-server';

// Runs once a day (vercel.json → crons): deletes the student data of every
// class whose deletion date has passed. Vercel calls it with
// "Authorization: Bearer <CRON_SECRET>"; anyone else gets 401.

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) return NextResponse.json({ error: 'CRON_SECRET is not set' }, { status: 503 });
  if (!authorized(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const token = studentFilesToken();
  const deleteBlobs = async (pathnames: string[]) => {
    if (!token || pathnames.length === 0) return;
    try {
      for (let i = 0; i < pathnames.length; i += 500) await del(pathnames.slice(i, i + 500), { token });
    } catch (error) {
      console.error('Retention: could not delete stored files', pathnames.length, error);
    }
  };

  const done: { offeringId: string; result: unknown }[] = [];
  for (const offeringId of await classesDueForDeletion()) {
    try {
      done.push({ offeringId, result: await purgeClassData(offeringId, null, deleteBlobs) });
    } catch (error) {
      console.error('Retention: could not delete class data', offeringId, error);
      done.push({ offeringId, result: 'failed' });
    }
  }
  return NextResponse.json({ ok: true, done });
}
