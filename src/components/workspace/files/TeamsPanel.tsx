'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { assignTeam, createTeam, deleteTeam, renameTeam } from '@/app/workspace-q/[offeringId]/files/actions';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Button, ErrorText, fieldClass, useAction } from './ui';
import type { RosterEntry, TeamInfo } from './types';

/** Staff only: create teams and put each student in one. */
export default function TeamsPanel({
  offeringId,
  teams,
  roster,
}: {
  offeringId: string;
  teams: TeamInfo[];
  roster: RosterEntry[];
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState('');
  const create = useAction();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <section className="space-y-3" aria-labelledby="teams-title">
        <h2 id="teams-title" className="text-sm font-semibold uppercase tracking-wide text-[var(--wq-text-muted)]">
          {t('files.tab.teams')}
        </h2>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            create.run(() => createTeam({ offeringId, name }), () => {
              setName('');
              router.refresh();
            });
          }}
        >
          <input
            className={cn(fieldClass, 'min-w-0 flex-1')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('files.teams.name')}
            aria-label={t('files.teams.name')}
            maxLength={80}
          />
          <Button type="submit" variant="primary" pending={create.pending} disabled={!name.trim()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('files.teams.create')}
          </Button>
        </form>
        <ErrorText>{create.error}</ErrorText>
        {teams.length === 0 ? (
          <p className="rounded-xl bg-[var(--wq-card)] p-4 text-sm text-[var(--wq-text-muted)]">{t('files.teams.empty')}</p>
        ) : (
          <ul className="space-y-2">
            {teams.map((team) => (
              <TeamItem key={team.id} team={team} />
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3" aria-labelledby="students-title">
        <h2 id="students-title" className="text-sm font-semibold uppercase tracking-wide text-[var(--wq-text-muted)]">
          {t('files.teams.students')}
        </h2>
        {roster.length === 0 ? (
          <p className="rounded-xl bg-[var(--wq-card)] p-4 text-sm text-[var(--wq-text-muted)]">{t('files.teams.noStudents')}</p>
        ) : (
          <ul className="divide-y divide-[var(--wq-border)] rounded-xl border border-[var(--wq-border)] bg-[var(--wq-card)]">
            {roster.map((student) => (
              <StudentItem key={student.userId} offeringId={offeringId} student={student} teams={teams} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TeamItem({ team }: { team: TeamInfo }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(team.name);
  const [confirm, setConfirm] = useState(false);
  const action = useAction();

  return (
    <li className="rounded-xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-3">
      {editing ? (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            action.run(() => renameTeam({ teamId: team.id, name }), () => {
              setEditing(false);
              router.refresh();
            });
          }}
        >
          <input
            className={cn(fieldClass, 'min-w-0 flex-1 py-1.5')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label={t('files.teams.name')}
            maxLength={80}
            autoFocus
          />
          <Button type="submit" size="sm" variant="primary" pending={action.pending}>
            {t('files.save')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setName(team.name); }}>
            {t('files.cancel')}
          </Button>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-[var(--wq-text)]">{team.name}</p>
            <p className="text-xs text-[var(--wq-text-muted)]">
              {team.members.length === 1 ? t('files.teams.member1') : t('files.teams.members', { n: team.members.length })}
              {team.members.length > 0 && ` · ${team.members.map((m) => m.name ?? t('files.unnamed')).join(', ')}`}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)} aria-label={t('files.rename')}>
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirm(true)} aria-label={t('files.delete')}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
      {confirm && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <Button
            size="sm"
            variant="danger"
            pending={action.pending}
            onClick={() => action.run(() => deleteTeam({ teamId: team.id }), () => router.refresh())}
          >
            {t('files.delete')} {team.name}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setConfirm(false); action.setError(null); }}>
            {t('files.cancel')}
          </Button>
        </div>
      )}
      <div className="mt-1">
        <ErrorText>{action.error}</ErrorText>
      </div>
    </li>
  );
}

function StudentItem({ offeringId, student, teams }: { offeringId: string; student: RosterEntry; teams: TeamInfo[] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const action = useAction();

  return (
    <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[var(--wq-text)]">{student.name}</p>
        <p className="truncate text-xs text-[var(--wq-text-muted)]">{student.email}</p>
        <ErrorText>{action.error}</ErrorText>
      </div>
      <select
        className={cn(fieldClass, 'py-1.5 sm:w-48')}
        value={student.teamId ?? ''}
        aria-label={`${t('files.teams.assign')}: ${student.name}`}
        disabled={action.pending}
        onChange={(e) =>
          action.run(
            () => assignTeam({ offeringId, userId: student.userId, teamId: e.target.value || null }),
            () => router.refresh(),
          )
        }
      >
        <option value="">{t('files.teams.none')}</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </li>
  );
}
