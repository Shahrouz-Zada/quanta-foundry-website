'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarDays, FolderOpen, MapPin, Pencil, PlayCircle, Plus, Settings, Trash2 } from 'lucide-react';
import { deleteSession } from '@/app/workspace-q/classes/materials-actions';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { formatClassDate, pickTitle } from '@/lib/workspace-materials';
import type { ClassHomeData, MaterialView, SessionView } from '@/lib/workspace-materials-server';
import { Button, ErrorText, useAction } from '@/components/workspace/files/ui';
import MaterialItem, { type SessionOption } from './MaterialItem';
import MaterialUploader from './MaterialUploader';
import SessionForm from './SessionForm';
import ToolsPanel from './ToolsPanel';

export default function ClassHome({
  offering,
  staff,
  data,
  nextSessionId,
  storageConnected,
}: {
  offering: { id: string; name: string };
  staff: boolean;
  data: ClassHomeData;
  nextSessionId: string | null;
  storageConnected: boolean;
}) {
  const { t, lang } = useTranslation();
  const [adding, setAdding] = useState(false);
  const sessionOptions: SessionOption[] = data.sessions.map((s) => ({
    id: s.id,
    label: `${t('class.session', { n: s.number })} · ${pickTitle(s, lang)}`,
  }));
  const nextNumber = data.sessions.length > 0 ? Math.max(...data.sessions.map((s) => s.number)) + 1 : 1;
  const showGeneral = staff || data.general.length > 0;

  return (
    <div className="flex-1 bg-[var(--wq-canvas)] pb-20">
      <div className="mx-auto max-w-5xl space-y-8 px-4 pt-8 sm:px-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--wq-accent)]">Workspace Q</p>
            <h1 className="mt-1 text-2xl font-bold text-[var(--wq-text)] sm:text-3xl">{offering.name}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/workspace-q/${offering.id}/files`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--wq-border)] px-3 py-1.5 text-sm font-medium text-[var(--wq-text)] hover:border-[var(--wq-border-hover)]"
            >
              <FolderOpen className="h-4 w-4" aria-hidden="true" />
              {t('class.files')}
            </Link>
            {staff && (
              <Link
                href={`/workspace-q/${offering.id}/manage`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--wq-border)] px-3 py-1.5 text-sm font-medium text-[var(--wq-text)] hover:border-[var(--wq-border-hover)]"
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                Pass code &amp; students
              </Link>
            )}
          </div>
        </header>

        {staff && !storageConnected && (
          <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            File storage is not connected yet (STUDENT_FILES_READ_WRITE_TOKEN), so materials can&apos;t be uploaded. Links, sessions and tools work.
          </p>
        )}

        <ToolsPanel offeringId={offering.id} tools={data.tools} staff={staff} />

        <section aria-labelledby="sessions-title" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 id="sessions-title" className="text-sm font-semibold uppercase tracking-wide text-[var(--wq-text-muted)]">
              {t('class.sessions')}
            </h2>
            {staff && !adding && (
              <Button size="sm" onClick={() => setAdding(true)}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add session
              </Button>
            )}
          </div>
          {staff && adding && (
            <SessionForm
              offeringId={offering.id}
              interactiveOptions={data.interactiveOptions}
              initial={{ number: nextNumber, titleEn: '', titleFr: '', startsAt: '', room: '', releaseAt: '', offeringSessionId: '' }}
              onDone={() => setAdding(false)}
            />
          )}
          {data.sessions.length === 0 ? (
            <p className="rounded-xl bg-[var(--wq-card)] p-4 text-sm text-[var(--wq-text-muted)]">{t('class.noSessions')}</p>
          ) : (
            <ol className="space-y-4">
              {data.sessions.map((s) => (
                <SessionBlock
                  key={s.id}
                  session={s}
                  offeringId={offering.id}
                  staff={staff}
                  isNext={s.id === nextSessionId}
                  sessionOptions={sessionOptions}
                  interactiveOptions={data.interactiveOptions}
                  storageConnected={storageConnected}
                />
              ))}
            </ol>
          )}
        </section>

        {showGeneral && (
          <section aria-labelledby="general-title" className="space-y-3">
            <h2 id="general-title" className="text-sm font-semibold uppercase tracking-wide text-[var(--wq-text-muted)]">
              {t('class.general')}
            </h2>
            <MaterialList materials={data.general} offeringId={offering.id} staff={staff} sessionOptions={sessionOptions} />
            {staff && <MaterialUploader offeringId={offering.id} sessionId={null} disabled={!storageConnected} />}
          </section>
        )}
      </div>
    </div>
  );
}

function MaterialList({
  materials,
  offeringId,
  staff,
  sessionOptions,
}: {
  materials: MaterialView[];
  offeringId: string;
  staff: boolean;
  sessionOptions: SessionOption[];
}) {
  const { t } = useTranslation();
  if (materials.length === 0) return <p className="text-sm text-[var(--wq-text-muted)]">{t('class.noMaterials')}</p>;
  return (
    <ul className="space-y-2">
      {materials.map((m) => (
        <MaterialItem key={m.id} material={m} offeringId={offeringId} staff={staff} sessionOptions={sessionOptions} />
      ))}
    </ul>
  );
}

function SessionBlock({
  session,
  offeringId,
  staff,
  isNext,
  sessionOptions,
  interactiveOptions,
  storageConnected,
}: {
  session: SessionView;
  offeringId: string;
  staff: boolean;
  isNext: boolean;
  sessionOptions: SessionOption[];
  interactiveOptions: { id: string; label: string }[];
  storageConnected: boolean;
}) {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const del = useAction();

  return (
    <li
      id={`session-${session.number}`}
      className={cn(
        'rounded-2xl border bg-[var(--wq-card)] p-4 sm:p-5',
        isNext ? 'border-[var(--wq-accent)] shadow-sm' : 'border-[var(--wq-border)]',
      )}
    >
      {editing ? (
        <SessionForm
          offeringId={offeringId}
          interactiveOptions={interactiveOptions}
          initial={{
            sessionId: session.id,
            number: session.number,
            titleEn: session.titleEn,
            titleFr: session.titleFr ?? '',
            startsAt: session.startsAtLocal,
            room: session.room ?? '',
            releaseAt: session.releaseLocal,
            offeringSessionId: session.offeringSessionId ?? '',
          }}
          onDone={() => setEditing(false)}
        />
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--wq-accent)]">
              {t('class.session', { n: session.number })}
              {isNext && <span className="ml-2 rounded-full bg-[var(--wq-accent)] px-2 py-0.5 text-[10px] text-white">{t('class.next')}</span>}
            </p>
            <h3 className="mt-0.5 text-lg font-semibold text-[var(--wq-text)]">{pickTitle(session, lang)}</h3>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--wq-text-muted)]">
              {session.startsAt && (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  {formatClassDate(session.startsAt, lang)}
                </span>
              )}
              {session.room && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {t('class.room', { room: session.room })}
                </span>
              )}
            </div>
            {staff && session.releasePending && (
              <p className="mt-1 text-xs text-amber-800">
                {t('class.releaseOn', { date: formatClassDate(session.materialsReleaseAt, 'en') })}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap gap-1.5">
            {session.interactiveHref && (
              <Link
                href={session.interactiveHref}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--wq-accent)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--wq-accent-hover)]"
              >
                <PlayCircle className="h-4 w-4" aria-hidden="true" />
                {t('class.interactive')}
              </Link>
            )}
            {staff && (
              <>
                <Button size="sm" variant="ghost" onClick={() => setEditing(true)} aria-label={`Edit session ${session.number}`}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
                {!confirmDelete && (
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)} aria-label={`Delete session ${session.number}`}>
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {confirmDelete && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          <span>Delete this session?</span>
          <Button size="sm" variant="danger" pending={del.pending} onClick={() => del.run(() => deleteSession({ sessionId: session.id }), () => router.refresh())}>
            Delete
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setConfirmDelete(false); del.setError(null); }}>
            Cancel
          </Button>
        </div>
      )}
      <ErrorText>{del.error}</ErrorText>

      <div className="mt-4 space-y-3">
        {(staff || session.materials.length > 0) && (
          <MaterialList materials={session.materials} offeringId={offeringId} staff={staff} sessionOptions={sessionOptions} />
        )}
        {staff && <MaterialUploader offeringId={offeringId} sessionId={session.id} disabled={!storageConnected} />}
      </div>
    </li>
  );
}
