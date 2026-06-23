'use client';

import { useMemo } from 'react';
import { GitMerge, Star, Users, Activity as ActivityIcon, Award } from 'lucide-react';
import { contributors, getTierCounts } from '@/data/contributors';
import { recentActivities, getRecentActivities } from '@/data/activities';
import { projectsAndNotes } from '@/data/projects';
import { isWorkspaceVisibleProject } from '@/lib/project-utils';
import type { ContributorTier } from '@/types';

// =============================================================================
// Tier configuration
// =============================================================================
const TIER_CONFIG: Record<
  ContributorTier,
  { label: string; color: string; bg: string; border: string; icon: string; description: string }
> = {
  'observer': {
    label: 'Observer',
    color: '#9CA3AF',
    bg: 'rgba(156,163,175,0.08)',
    border: 'rgba(156,163,175,0.2)',
    icon: '👁',
    description: 'Learning the ropes — reading, exploring, and getting familiar with the ecosystem.',
  },
  'contributor': {
    label: 'Contributor',
    color: '#4A90E2',
    bg: 'rgba(74,144,226,0.08)',
    border: 'rgba(74,144,226,0.25)',
    icon: '🔬',
    description: 'Actively submitting project notes, drafts, or participating in peer discussions.',
  },
  'core-contributor': {
    label: 'Core Contributor',
    color: '#D4AF37',
    bg: 'rgba(212,175,55,0.08)',
    border: 'rgba(212,175,55,0.25)',
    icon: '⚡',
    description: 'Consistently producing reviewed outputs and supporting the quality of the community.',
  },
  'founding-contributor': {
    label: 'Founding Contributor',
    color: '#A78BFA',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.25)',
    icon: '✦',
    description: 'Foundational community members who shaped the early direction of Quanta Foundry projects.',
  },
};

const ACTIVITY_TYPE_ICONS: Record<string, string> = {
  submission: '📄',
  review:     '🔍',
  note:       '📝',
  dataset:    '📊',
  revision:   '✏️',
  milestone:  '🏆',
};

// =============================================================================
// ContributionBoard Component
// =============================================================================
export default function ContributionBoard() {
  const feed = useMemo(() => getRecentActivities(recentActivities, 5), []);
  const tierCounts = useMemo(() => getTierCounts(contributors), []);

  const workspaceProjects = useMemo(
    () => projectsAndNotes.filter(isWorkspaceVisibleProject),
    []
  );

  const totalPeerReviews = useMemo(
    () => recentActivities.filter((a) => a.type === 'review').length,
    []
  );

  const tierOrder: ContributorTier[] = [
    'founding-contributor',
    'core-contributor',
    'contributor',
    'observer',
  ];

  return (
    <section id="contribution-board" aria-labelledby="contribution-board-heading">

      {/* Section Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            id="contribution-board-heading"
            className="text-2xl font-bold text-white flex items-center gap-2"
          >
            <GitMerge size={22} className="text-[#A78BFA]" />
            Community Contributions
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            A collaborative record of community learning and output — not a ranking.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#A78BFA]/10 border border-[#A78BFA]/25 text-[#A78BFA] self-start sm:self-auto">
          <Star size={11} /> Collaborative Board
        </span>
      </div>

      {/* Community Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          {
            label: 'Active Contributors',
            value: contributors.length,
            icon: <Users size={16} />,
            color: '#4A90E2',
          },
          {
            label: 'Workspace Projects',
            value: workspaceProjects.length,
            icon: <ActivityIcon size={16} />,
            color: '#D4AF37',
          },
          {
            label: 'Peer Reviews',
            value: totalPeerReviews,
            icon: <Star size={16} />,
            color: '#A78BFA',
          },
          {
            label: 'Community Actions',
            value: recentActivities.length,
            icon: <GitMerge size={16} />,
            color: '#27AE60',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] flex flex-col gap-2"
          >
            <div style={{ color: stat.color }}>{stat.icon}</div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Recent Activity Feed */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#A78BFA] mb-4">
            Recent Contributions
          </h3>
          <div className="space-y-3">
            {feed.map((activity) => {
              const icon = ACTIVITY_TYPE_ICONS[activity.type] ?? '•';
              const date = new Date(activity.date).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              });
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] transition-colors"
                >
                  <span className="text-base shrink-0 mt-0.5" aria-hidden="true">
                    {icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contributor Tiers */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#D4AF37] mb-4">
            Community Tiers
          </h3>
          <div className="space-y-3">
            {tierOrder.map((tier) => {
              const config = TIER_CONFIG[tier];
              const count = tierCounts[tier] ?? 0;
              return (
                <div
                  key={tier}
                  className="p-4 rounded-xl border transition-colors"
                  style={{ background: config.bg, borderColor: config.border }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true">{config.icon}</span>
                      <span className="text-sm font-bold" style={{ color: config.color }}>
                        {config.label}
                      </span>
                    </div>
                    <span
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      style={{
                        background: `${config.color}18`,
                        color: config.color,
                      }}
                    >
                      {count} {count === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {config.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contribution Badges Key */}
      <div className="mt-10">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
          <Award size={14} /> Contribution Badges
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'first-submission',
              icon: '📄',
              label: 'First Submission',
              desc: 'Submitted a first project note, notebook, or technical output.',
            },
            {
              id: 'peer-reviewer',
              icon: '🔍',
              label: 'Peer Reviewer',
              desc: 'Provided a structured review of another contributor\'s work.',
            },
            {
              id: 'milestone-reached',
              icon: '🏆',
              label: 'Milestone Reached',
              desc: 'Reached a meaningful contribution milestone within the community.',
            },
          ].map((badge) => (
            <div
              key={badge.id}
              className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
            >
              <span className="text-xl shrink-0" aria-hidden="true">{badge.icon}</span>
              <div>
                <p className="text-xs font-semibold text-white mb-0.5">{badge.label}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tone note */}
      <p className="text-center text-xs text-gray-700 mt-8">
        This board celebrates collective progress. Contribution counts are not ranked publicly.
      </p>
    </section>
  );
}
