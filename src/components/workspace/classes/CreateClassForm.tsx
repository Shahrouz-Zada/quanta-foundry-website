'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { createClass } from '@/app/workspace-q/classes/actions';
import { useAction } from '@/components/workspace/files/ui';

/** Administrators only: create a class (dark styling, to sit on the Workspace Q landing page). */
export default function CreateClassForm({ copyOptions }: { copyOptions: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [copyFrom, setCopyFrom] = useState('');
  const action = useAction();

  const field =
    'w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 ' +
    'focus:border-[#4A90E2] focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/40';

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-[#4A90E2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3a7fd0]"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Create a class
      </button>
    );
  }

  return (
    <form
      className="w-full max-w-xl space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left"
      onSubmit={(e) => {
        e.preventDefault();
        action.run(async () => {
          const result = await createClass({ name, copyFromOfferingId: copyFrom || null });
          if (result.ok && result.offeringId) router.push(`/workspace-q/${result.offeringId}/manage`);
          return result;
        });
      }}
    >
      <div>
        <label htmlFor="class-name" className="mb-1 block text-sm font-medium text-gray-200">
          Class name
        </label>
        <input
          id="class-name"
          className={field}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. DSML · MSc 2027 · Group A"
          maxLength={120}
          autoFocus
        />
      </div>
      {copyOptions.length > 0 && (
        <div>
          <label htmlFor="copy-from" className="mb-1 block text-sm font-medium text-gray-200">
            Copy the sessions from
          </label>
          <select id="copy-from" className={field} value={copyFrom} onChange={(e) => setCopyFrom(e.target.value)}>
            <option value="">Start empty</option>
            {copyOptions.map((o) => (
              <option key={o.id} value={o.id} className="text-black">
                {o.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {action.error && (
        <p role="alert" className="text-sm text-red-300">
          {action.error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={action.pending || name.trim().length < 3}
          className="rounded-lg bg-[#4A90E2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3a7fd0] disabled:opacity-50"
        >
          {action.pending ? 'Creating…' : 'Create class'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-gray-300 hover:text-white">
          Cancel
        </button>
      </div>
    </form>
  );
}
