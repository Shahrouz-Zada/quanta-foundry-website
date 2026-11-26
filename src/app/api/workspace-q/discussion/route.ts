import { NextResponse, type NextRequest } from 'next/server';
import { listMessages, resolveThread } from '@/lib/discussions-server';

// Reading a discussion thread. The page calls this when a thread opens, then
// every few seconds while it stays open (`?since=` the time the previous call
// returned), so new messages appear without reloading. Access is checked again
// on every call.

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');
  const sinceParam = request.nextUrl.searchParams.get('since');
  const since = sinceParam !== null && /^\d{1,15}$/.test(sinceParam) ? Number(sinceParam) : undefined;

  // Taken before reading, so a message saved while we read is caught by the next call.
  const now = Date.now();
  const access = await resolveThread(key);
  if (!access.ok) {
    return NextResponse.json({ error: access.reason }, { status: access.reason === 'signed-out' ? 401 : 404, headers });
  }
  const messages = await listMessages(access.key, access.offeringId, since);
  return NextResponse.json(
    { messages, now, me: access.user.id, canModerate: access.canModerate },
    { status: 200, headers },
  );
}
