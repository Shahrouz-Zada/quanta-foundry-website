'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Eye, FolderOpen, Search, Settings, Users } from 'lucide-react';
import { formatBytes as formatBytesOrDash } from '@/lib/course-files';

// Storage figures read better as "0 B" than as a dash.
const formatBytes = (n: number) => (n > 0 ? formatBytesOrDash(n) : '0 B');
import { useTranslation, type MessageKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import FileRow from './FileRow';
import FileUploader from './FileUploader';
import TeamsPanel from './TeamsPanel';
import { fieldClass } from './ui';
import type { AuditPairing, FileView, RosterEntry, StorageInfo, TeamInfo, ViewerInfo } from './types';

export type Tab = 'mine' | 'team' | 'class' | 'audit' | 'all' | 'teams';

export default function FilesWorkspace({
  offering,
  viewer,
  files,
  teams,
  roster,
  storage,
  storageConnected,
  initialTab,
  audits = [],
  auditedTeams = [],
  auditedBy = [],
}: {
  offering: { id: string; name: string };
  viewer: ViewerInfo;
  files: FileView[];
  teams: TeamInfo[];
  roster: RosterEntry[];
  storage: StorageInfo;
  storageConnected: boolean;
  initialTab?: Tab;
  /** Staff: the class's audit pairings. */
  audits?: AuditPairing[];
  /** Student: the teams whose team files their team audits (read-only). */
  auditedTeams?: TeamInfo[];
  /** Student: names of the teams that audit their own team. */
  auditedBy?: string[];
}) {
  const { t } = useTranslation();
  const isStaff = viewer.role === 'staff';
  const isLearner = viewer.role === 'learner';
  const tabs: Tab[] = isStaff
    ? ['all', 'teams']
    : isLearner
      ? ['mine', 'team', 'class', ...(auditedTeams.length > 0 ? (['audit'] as Tab[]) : [])]
      : ['class'];
  const [tab, setTab] = useState<Tab>(initialTab && tabs.includes(initialTab) ? initialTab : tabs[0]);
  const myTeam = teams.find((team) => team.id === viewer.teamId) ?? null;

  const groups = useMemo(() => {
    const mine = files.filter((f) => f.isMine && !f.teamId);
    const teamSpace = files.filter((f) => f.teamId !== null && f.teamId === viewer.teamId);
    const fromTeammates = files.filter((f) => !f.teamId && !f.isMine && f.shareLevel === 'TEAM');
    const classShared = files.filter((f) => f.shareLevel === 'CLASS');
    const audited = files.filter((f) => f.teamId !== null && f.teamId !== viewer.teamId && auditedTeams.some((team) => team.id === f.teamId));
    return { mine, teamSpace, fromTeammates, classShared, audited };
  }, [files, viewer.teamId, auditedTeams]);

  const tabLabel: Record<Tab, MessageKey> = {
    mine: 'files.tab.mine',
    team: 'files.tab.team',
    class: 'files.tab.class',
    audit: 'files.tab.audit',
    all: 'files.tab.all',
    teams: 'files.tab.teams',
  };
  const tabCount: Partial<Record<Tab, number>> = {
    mine: groups.mine.length,
    team: groups.teamSpace.length + groups.fromTeammates.length,
    class: groups.classShared.length,
    audit: groups.audited.length,
    all: files.length,
  };

  return (
    <div className="flex-1 bg-[var(--wq-canvas)] pb-20">
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--wq-accent)]">{offering.name}</p>
            <h1 className="mt-1 text-2xl font-bold text-[var(--wq-text)] sm:text-3xl">{t('files.title')}</h1>
            <p className="mt-1 max-w-2xl text-sm text-[var(--wq-text-muted)]">
              {isStaff ? t('files.staffNote') : t('files.subtitle')}
            </p>
          </div>
          {isStaff && (
            <Link
              href={`/workspace-q/${offering.id}/manage`}
              className="inline-flex items-center gap-1.5 self-start rounded-lg border border-[var(--wq-border)] px-3 py-1.5 text-sm font-medium text-[var(--wq-text)] hover:border-[var(--wq-border-hover)] sm:self-auto"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              Pass code &amp; students
            </Link>
          )}
          {isLearner && (
            <div className="text-xs text-[var(--wq-text-muted)] sm:text-right">
              {myTeam && <p className="font-medium text-[var(--wq-text)]">{t('files.yourTeam', { team: myTeam.name })}</p>}
              <p>{t('files.storage', { used: formatBytes(storage.personalUsed), quota: formatBytes(storage.quota) })}</p>
            </div>
          )}
        </header>

        {!storageConnected && (
          <div className="mb-6 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{t('files.notConnected')}</p>
          </div>
        )}

        <div role="tablist" aria-label={t('files.title')} className="mb-6 flex gap-1 overflow-x-auto border-b border-[var(--wq-border)]">
          {tabs.map((key) => (
            <button
              key={key}
              role="tab"
              id={`tab-${key}`}
              aria-selected={tab === key}
              aria-controls={`panel-${key}`}
              onClick={() => setTab(key)}
              className={cn(
                '-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--wq-accent)]',
                tab === key
                  ? 'border-[var(--wq-accent)] text-[var(--wq-text)]'
                  : 'border-transparent text-[var(--wq-text-muted)] hover:text-[var(--wq-text)]',
              )}
            >
              {t(tabLabel[key])}
              {tabCount[key] !== undefined && (
                <span className="rounded-full bg-[var(--wq-canvas-alt)] px-1.5 text-[11px] text-[var(--wq-text-muted)]">
                  {tabCount[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === 'mine' && (
            <div className="space-y-6">
              <FileUploader offeringId={offering.id} space="personal" hasTeam={Boolean(viewer.teamId)} disabled={!storageConnected} />
              <FileList files={groups.mine} offeringId={offering.id} empty={t('files.emptyMine')} />
            </div>
          )}

          {tab === 'team' &&
            (viewer.teamId ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--wq-text-muted)]">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  <span className="font-medium text-[var(--wq-text)]">{myTeam?.name}</span>
                  {myTeam && <span>· {myTeam.members.map((m) => m.name ?? t('files.unnamed')).join(', ')}</span>}
                  <span className="sm:ml-auto text-xs">
                    {t('files.storageTeam', { used: formatBytes(storage.teamUsed), quota: formatBytes(storage.quota) })}
                  </span>
                </div>
                {auditedBy.length > 0 && (
                  <p data-testid="audited-by" className="flex items-start gap-2 rounded-lg bg-[var(--wq-canvas-alt)] px-3 py-2 text-xs text-[var(--wq-text-muted)]">
                    <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {t('files.audit.seenBy', { teams: auditedBy.join(', ') })}
                  </p>
                )}
                <FileUploader offeringId={offering.id} space="team" hasTeam disabled={!storageConnected} />
                <section>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--wq-text-muted)]">
                    {t('files.teamSpace')}
                  </h2>
                  <FileList files={groups.teamSpace} offeringId={offering.id} empty={t('files.emptyTeam')} />
                </section>
                {groups.fromTeammates.length > 0 && (
                  <section>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--wq-text-muted)]">
                      {t('files.sharedByTeammates')}
                    </h2>
                    <FileList files={groups.fromTeammates} offeringId={offering.id} showOwner empty="" />
                  </section>
                )}
              </div>
            ) : (
              <Empty text={t('files.noTeam')} />
            ))}

          {tab === 'class' && (
            <FileList files={groups.classShared} offeringId={offering.id} showOwner empty={t('files.emptyClass')} />
          )}

          {tab === 'audit' && (
            <div className="space-y-6">
              <p className="flex items-start gap-2 rounded-lg bg-[var(--wq-canvas-alt)] px-3 py-2 text-xs text-[var(--wq-text-muted)]">
                <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {t('files.audit.note')}
              </p>
              {auditedTeams.map((team) => (
                <section key={team.id} data-testid="audited-team">
                  <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--wq-text-muted)]">{team.name}</h2>
                  {team.members.length > 0 && (
                    <p className="mb-3 text-xs text-[var(--wq-text-muted)]">{team.members.map((m) => m.name ?? t('files.unnamed')).join(', ')}</p>
                  )}
                  <FileList
                    files={groups.audited.filter((f) => f.teamId === team.id)}
                    offeringId={offering.id}
                    empty={t('files.audit.empty', { team: team.name })}
                  />
                </section>
              ))}
            </div>
          )}

          {tab === 'all' && <AllFiles files={files} offeringId={offering.id} />}

          {tab === 'teams' && <TeamsPanel offeringId={offering.id} teams={teams} roster={roster} audits={audits} />}
        </div>
      </div>
    </div>
  );
}

function FileList({
  files,
  offeringId,
  showOwner,
  empty,
}: {
  files: FileView[];
  offeringId: string;
  showOwner?: boolean;
  empty: string;
}) {
  if (files.length === 0) return empty ? <Empty text={empty} /> : null;
  return (
    <ul className="space-y-3">
      {files.map((file) => (
        <FileRow key={file.id} file={file} offeringId={offeringId} showOwner={showOwner} />
      ))}
    </ul>
  );
}

function AllFiles({ files, offeringId }: { files: FileView[]; offeringId: string }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const shown = q
    ? files.filter((f) =>
        [f.title, f.current.fileName, f.ownerName ?? '', f.teamName ?? ''].some((s) => s.toLowerCase().includes(q)),
      )
    : files;

  return (
    <div className="space-y-4">
      <label className="relative block max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--wq-text-subtle)]" aria-hidden="true" />
        <input
          className={cn(fieldClass, 'w-full pl-9')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('files.filter')}
          aria-label={t('files.filter')}
        />
      </label>
      <FileList files={shown} offeringId={offeringId} showOwner empty={t('files.emptyAll')} />
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-card)] px-4 py-10 text-center">
      <FolderOpen className="h-8 w-8 text-[var(--wq-text-subtle)]" aria-hidden="true" />
      <p className="text-sm text-[var(--wq-text-muted)]">{text}</p>
    </div>
  );
}
