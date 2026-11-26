'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, ListChecks, MessagesSquare, Users } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { teamThreadKey } from '@/lib/discussions';
import type { RecentThread } from '@/lib/discussions-server';
import DiscussionThread from './DiscussionThread';
import { NewBadge } from './CommentsToggle';

interface TeamItem {
  id: string;
  name: string;
  members: (string | null)[];
  total: number;
  unread: number;
}

/** The Discussion page: a student's team board, or (staff) every team's board plus recent comments. */
export default function DiscussionBoard({
  offering,
  role,
  teams,
  selectedTeamId,
  recent,
}: {
  offering: { id: string; name: string };
  role: 'staff' | 'learner' | 'observer';
  teams: TeamItem[];
  selectedTeamId: string | null;
  recent: RecentThread[];
}) {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const staff = role === 'staff';
  const [seen, setSeen] = useState<Record<string, boolean>>({});
  const selected = teams.find((x) => x.id === selectedTeamId) ?? null;

  return (
    <div className="flex-1 bg-[var(--wq-canvas)] pb-20">
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--wq-accent)]">{offering.name}</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-[var(--wq-text)] sm:text-3xl">
            <MessagesSquare className="h-6 w-6 text-[var(--wq-accent)]" aria-hidden="true" />
            {t('discussion.title')}
          </h1>
          <p className="mt-1 text-sm text-[var(--wq-text-muted)]">{staff ? t('discussion.staffSubtitle') : t('discussion.subtitle')}</p>
        </header>

        {role === 'observer' ? (
          <Notice text={t('discussion.notForYou')} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
            {/* On a phone, students get their board first and the recent comments below it. */}
            <aside className={cn('space-y-6', !staff && 'order-2 lg:order-none')}>
              {staff && (
                <section aria-labelledby="teams-heading">
                  <h2 id="teams-heading" className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--wq-text-muted)]">
                    {t('discussion.teams')}
                  </h2>
                  {teams.length === 0 ? (
                    <p className="text-sm text-[var(--wq-text-muted)]">{t('discussion.noTeams')}</p>
                  ) : (
                    <ul className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                      {teams.map((team) => (
                        <li key={team.id} className="shrink-0">
                          <button
                            type="button"
                            data-testid="team-board-link"
                            onClick={() => router.push(`/workspace-q/${offering.id}/discussion?team=${team.id}`)}
                            aria-current={team.id === selectedTeamId ? 'true' : undefined}
                            className={cn(
                              'flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm',
                              team.id === selectedTeamId
                                ? 'border-[var(--wq-accent)] bg-[var(--wq-card)] font-semibold text-[var(--wq-text)]'
                                : 'border-[var(--wq-border)] bg-[var(--wq-card)] text-[var(--wq-text-muted)] hover:text-[var(--wq-text)]',
                            )}
                          >
                            <span className="truncate">{team.name}</span>
                            <span className="flex items-center gap-1.5 text-xs font-normal">
                              {team.total > 0 && <span>{team.total}</span>}
                              {!seen[team.id] && <NewBadge n={team.unread} />}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
              {recent.length > 0 && (
                <section aria-labelledby="recent-heading">
                  <h2 id="recent-heading" className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--wq-text-muted)]">
                    {t('discussion.recent')}
                  </h2>
                  <ul className="space-y-1.5" data-testid="recent-threads">
                    {recent.map((r) => (
                      <li key={r.key}>
                        <Link
                          href={r.href}
                          className="flex items-start gap-2 rounded-lg border border-[var(--wq-border)] bg-[var(--wq-card)] px-3 py-2 text-sm hover:border-[var(--wq-border-hover)]"
                        >
                          {r.kind === 'FILE' ? (
                            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--wq-text-muted)]" aria-hidden="true" />
                          ) : (
                            <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-[var(--wq-text-muted)]" aria-hidden="true" />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-[var(--wq-text)]">
                              {(lang === 'fr' && r.titleFr) || r.title}
                            </span>
                            <span className="block truncate text-xs text-[var(--wq-text-muted)]">
                              {r.kind === 'FILE' ? t('discussion.onFile') : t('discussion.onActivity')}
                              {staff && r.owner ? ` · ${r.owner}` : ''} · {r.total}
                            </span>
                          </span>
                          <NewBadge n={r.unread} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </aside>

            <main className={cn('min-w-0', !staff && 'order-1 lg:order-none')}>
              {selected ? (
                <section aria-labelledby="board-heading">
                  <div className="mb-2 flex flex-wrap items-baseline gap-x-2">
                    <h2 id="board-heading" className="flex items-center gap-1.5 font-semibold text-[var(--wq-text)]">
                      <Users className="h-4 w-4 text-[var(--wq-text-muted)]" aria-hidden="true" />
                      {selected.name}
                    </h2>
                    {selected.members.length > 0 && (
                      <span className="text-xs text-[var(--wq-text-muted)]">{selected.members.map((m) => m ?? t('files.unnamed')).join(', ')}</span>
                    )}
                  </div>
                  <DiscussionThread
                    key={selected.id}
                    threadKey={teamThreadKey(selected.id)}
                    onSeen={() => setSeen((s) => ({ ...s, [selected.id]: true }))}
                  />
                </section>
              ) : (
                <Notice text={staff ? t('discussion.noTeams') : t('discussion.noTeam')} />
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-card)] px-4 py-10 text-center text-sm text-[var(--wq-text-muted)]">{text}</div>
  );
}
