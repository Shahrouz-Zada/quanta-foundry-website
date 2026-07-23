'use client';
// =============================================================================
// WorkspaceQHeader — compact 56 px fixed application header
// Replaces the public Quanta Foundry Navbar on Learning Session routes.
//
// Left:   QF logo → quantafoundry.com  |  "Workspace Q" → /workspace-q
// Centre: Track › Session 01 › Stage breadcrumb (from BreadcrumbContext)
// Right:  Language selector (EN/FR) | Theme toggle | Profile avatar menu
// =============================================================================

import {
  useState, useRef, useEffect, useCallback, type KeyboardEvent,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sun, Moon, ChevronDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation, type Lang } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useBreadcrumb } from '@/lib/breadcrumb-context';
import ReportProblemModal from './ReportProblemModal';

// ── Profile menu definition ───────────────────────────────────────────────────

const useProfileMenu = () => {
  const { t } = useTranslation();
  return [
    { id: 'my-profile',  labelKey: 'header.myProfile'   as const, disabled: true },
    { id: 'my-progress', labelKey: 'header.myProgress'  as const, disabled: true },
    { id: 'preferences', labelKey: 'header.preferences' as const, disabled: true },
    { id: 'divider-1',   labelKey: null, disabled: false },
    { id: 'report',      labelKey: 'header.reportProblem' as const, disabled: false },
    { id: 'privacy',     labelKey: 'header.privacy'     as const, disabled: true },
    { id: 'divider-2',   labelKey: null, disabled: false },
    { id: 'sign-out',    labelKey: 'header.signOut'     as const, disabled: true },
  ] as const;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function WorkspaceQHeader() {
  const { lang, setLang, t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { track, sessionLabel, stageLabel } = useBreadcrumb();

  const [profileOpen, setProfileOpen] = useState(false);
  const [reportOpen,  setReportOpen]  = useState(false);

  const profileBtnRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu on outside click or Escape
  useEffect(() => {
    if (!profileOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        !profileMenuRef.current?.contains(e.target as Node) &&
        !profileBtnRef.current?.contains(e.target as Node)
      ) setProfileOpen(false);
    };
    const handleKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileOpen(false);
        profileBtnRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [profileOpen]);

  // Move focus into menu when it opens
  useEffect(() => {
    if (!profileOpen) return;
    const first = profileMenuRef.current?.querySelector<HTMLElement>(
      'button:not([disabled]), [href]'
    );
    first?.focus();
  }, [profileOpen]);

  const handleProfileKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setProfileOpen((p) => !p);
    }
    if (e.key === 'Escape') setProfileOpen(false);
  }, []);

  const profileItems = useProfileMenu();
  const isDark = theme === 'quanta-dark';

  return (
    <>
      {/* ── Fixed header bar ──────────────────────────────────────────── */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-[60]',
          'h-[var(--wq-header-h)] flex items-center',
          'bg-[var(--wq-shell)] border-b border-[var(--wq-shell-border)]',
          'px-4 sm:px-5 gap-3'
        )}
        aria-label="Workspace Q navigation"
      >
        {/* ── Left: Logo + Workspace Q link ────────────────────────── */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* QF logo → public homepage */}
          <Link
            href="https://www.quantafoundry.com"
            aria-label="Return to Quanta Foundry homepage"
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)] rounded"
          >
            <Image
              src="/images/logo.jpg"
              alt="Quanta Foundry logo"
              width={28}
              height={28}
              className="rounded transition-opacity group-hover:opacity-80"
              priority
            />
            <span className="hidden sm:block text-xs font-semibold text-white/55 group-hover:text-white/80 transition-colors whitespace-nowrap">
              Quanta Foundry
            </span>
          </Link>

          {/* Separator */}
          <span className="text-white/15 text-sm select-none" aria-hidden="true">/</span>

          {/* Workspace Q → dashboard */}
          <Link
            href="/workspace-q"
            className="text-xs font-semibold text-white/80 hover:text-white transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)] rounded"
          >
            {t('nav.workspaceQ')}
          </Link>
        </div>

        {/* ── Centre: Breadcrumb ───────────────────────────────────── */}
        <nav
          className="hidden md:flex flex-1 items-center justify-center min-w-0"
          aria-label="Session breadcrumb"
        >
          <ol className="flex items-center gap-1.5 text-xs text-white/35 min-w-0">
            {track && (
              <>
                <li className="truncate max-w-[12rem]">
                  <span className="font-medium text-white/50 whitespace-nowrap">{track}</span>
                </li>
                <li aria-hidden="true" className="text-white/20 shrink-0">›</li>
              </>
            )}
            {sessionLabel && (
              <>
                <li>
                  <Link
                    href="/workspace-q/learning-sessions/session-01?stage=overview"
                    className="hover:text-white/70 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--wq-accent)] rounded"
                  >
                    {sessionLabel}
                  </Link>
                </li>
                <li aria-hidden="true" className="text-white/20 shrink-0">›</li>
              </>
            )}
            {stageLabel && (
              <li aria-current="page">
                <span className="text-white/75 font-medium whitespace-nowrap">{stageLabel}</span>
              </li>
            )}
          </ol>
        </nav>

        {/* Spacer on small screens (breadcrumb is hidden) */}
        <div className="flex-1 md:hidden" aria-hidden="true" />

        {/* ── Right: Controls ──────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 shrink-0">

          {/* Language selector — EN / FR */}
          <div
            className="flex items-center rounded-lg overflow-hidden border border-white/10 bg-white/5"
            role="group"
            aria-label={t('header.language')}
          >
            {(['en', 'fr'] as Lang[]).map((code) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                aria-label={code === 'en' ? 'English' : 'Français'}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--wq-accent)]',
                  lang === code
                    ? 'bg-[var(--wq-accent)] text-white'
                    : 'text-white/45 hover:text-white/70'
                )}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={t('header.switchTheme') + ': ' + (isDark ? t('header.focusLight') : t('header.quantaDark'))}
            title={isDark ? t('header.focusLight') : t('header.quantaDark')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/45',
              'hover:text-white hover:bg-white/8 transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)]',
            )}
          >
            {isDark
              ? <Sun  size={14} aria-hidden="true" />
              : <Moon size={14} aria-hidden="true" />
            }
            <span className="hidden lg:block text-[11px] font-medium whitespace-nowrap">
              {isDark ? t('header.focusLight') : t('header.quantaDark')}
            </span>
          </button>

          {/* Profile avatar */}
          <div className="relative">
            <button
              ref={profileBtnRef}
              onClick={() => setProfileOpen((p) => !p)}
              onKeyDown={handleProfileKeyDown}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-label={t(profileOpen ? 'header.closeProfile' : 'header.openProfile')}
              className={cn(
                'flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-lg transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)]',
                profileOpen ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white hover:bg-white/8'
              )}
            >
              {/* Avatar circle */}
              <span
                aria-hidden="true"
                className="w-6 h-6 rounded-full bg-[var(--wq-accent)] flex items-center justify-center text-white text-[10px] font-bold"
              >
                <User size={12} />
              </span>
              <ChevronDown
                size={12}
                aria-hidden="true"
                className={cn(
                  'hidden sm:block transition-transform duration-150',
                  profileOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Profile dropdown */}
            {profileOpen && (
              <div
                ref={profileMenuRef}
                role="menu"
                aria-label={t('header.profile')}
                className={cn(
                  'absolute right-0 top-[calc(100%+8px)] z-10 w-56',
                  'rounded-xl border border-[var(--wq-shell-border)] shadow-xl shadow-black/25',
                  'bg-[var(--wq-shell)] py-1.5 overflow-hidden',
                )}
              >
                {profileItems.map((item) => {
                  if (item.labelKey === null) {
                    return (
                      <div key={item.id} className="h-px mx-2 my-1 bg-white/8" role="separator" />
                    );
                  }
                  const label = t(item.labelKey);
                  const isReport = item.id === 'report';

                  if (item.disabled) {
                    return (
                      <div
                        key={item.id}
                        role="menuitem"
                        aria-disabled="true"
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-white/25 cursor-not-allowed select-none"
                      >
                        <span>{label}</span>
                        <span className="text-[10px] font-semibold text-[var(--wq-accent)]/50 uppercase tracking-wide border border-[var(--wq-accent)]/20 px-1.5 py-0.5 rounded">
                          {t('header.phaseLabel')}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        if (isReport) setReportOpen(true);
                      }}
                      className={cn(
                        'w-full text-left px-4 py-2.5 text-sm transition-colors duration-100',
                        'focus-visible:outline-none focus-visible:bg-white/8',
                        'text-white/70 hover:text-white hover:bg-white/8',
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Report a Problem modal ────────────────────────────────────── */}
      <ReportProblemModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </>
  );
}
