'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import type { ActionResult } from '@/app/workspace-q/[offeringId]/files/actions';
import { cn } from '@/lib/utils';

/** Runs a server action in a transition and keeps its error message. */
export function useAction() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<ActionResult>, onSuccess?: () => void) {
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (result.ok) onSuccess?.();
      else setError(result.error);
    });
  }

  return { pending, error, setError, run };
}

export const fieldClass =
  'rounded-lg border border-[var(--wq-border)] bg-[var(--wq-card)] px-3 py-2 text-sm text-[var(--wq-text)] ' +
  'placeholder:text-[var(--wq-text-subtle)] focus:border-[var(--wq-accent)] focus:outline-none focus:ring-2 ' +
  'focus:ring-[var(--wq-accent-glow)] disabled:opacity-60';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variants: Record<Variant, string> = {
  primary: 'bg-[var(--wq-accent)] text-white hover:bg-[var(--wq-accent-hover)]',
  secondary:
    'border border-[var(--wq-border)] bg-[var(--wq-card)] text-[var(--wq-text)] hover:border-[var(--wq-border-hover)]',
  ghost: 'text-[var(--wq-text-muted)] hover:bg-[var(--wq-canvas-alt)] hover:text-[var(--wq-text)]',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export function Button({
  children,
  variant = 'secondary',
  pending = false,
  size = 'md',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; pending?: boolean; size?: 'sm' | 'md' }) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || pending}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm',
        variants[variant],
        className,
      )}
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="text-xs text-red-600">
      {children}
    </p>
  );
}

export function formatDate(iso: string, lang: string): string {
  return new Date(iso).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
