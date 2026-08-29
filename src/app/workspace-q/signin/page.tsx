'use client';

import { Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

function SignInContent() {
  const searchParams = useSearchParams();
  // Fall back to the dashboard only if there's genuinely nowhere else to send them.
  const callbackUrl = searchParams.get('callbackUrl') || '/workspace-q';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950 text-slate-50">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-semibold">Sign in to Workspace Q</h1>
        <p className="text-sm text-slate-400">
          Sign in with the Google account associated with your enrollment.
        </p>
        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl })}
          className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-700 font-medium"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}

export default function WorkspaceQSignInPage() {
  // useSearchParams() needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <SignInContent />
    </Suspense>
  );
}
