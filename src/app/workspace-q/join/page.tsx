import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import JoinForm from '@/components/workspace/classes/JoinForm';
import { prisma } from '@/lib/prisma';
import { normalizeJoinCode } from '@/lib/workspace-classes';
import type { PrismaClient } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Join a class · Workspace Q',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function JoinClassPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code: rawCode } = await searchParams;
  // Only letters and digits are kept, so nothing odd can be echoed into the page.
  const code = rawCode ? normalizeJoinCode(rawCode).slice(0, 16) : '';
  const returnTo = `/workspace-q/join${code ? `?code=${code}` : ''}`;

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/workspace-q/signin?callbackUrl=${encodeURIComponent(returnTo)}&join=1`);
  }
  const user = await (prisma as PrismaClient).user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });
  if (!user) redirect(`/workspace-q/signin?callbackUrl=${encodeURIComponent(returnTo)}&join=1`);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-24 text-slate-50">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Join a class</h1>
          <p className="text-sm text-slate-400">Enter your full name and the pass code your instructor gave you.</p>
        </div>
        <JoinForm initialName={user.name ?? ''} initialCode={code} email={user.email} returnTo={returnTo} />
      </div>
    </div>
  );
}
