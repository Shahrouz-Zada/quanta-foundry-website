'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import type { ActionResult } from '@/app/courses/admin/actions';
import { cn } from '@/lib/utils';

/** Runs a server action inside a transition and keeps its error message. */
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

export const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#0A1929] placeholder:text-gray-400 focus:border-[#4A90E2] focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/20 disabled:bg-gray-50';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variants: Record<Variant, string> = {
  primary: 'bg-[#0A1929] text-white hover:bg-[#0D2137]',
  secondary: 'border border-gray-200 bg-white text-[#0A1929] hover:border-[#4A90E2] hover:text-[#3A7BD0]',
  ghost: 'text-[#2C3E50] hover:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export function Button({
  children,
  variant = 'secondary',
  pending = false,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; pending?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || pending}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className,
      )}
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

/** Small square icon button with an accessible label. */
export function IconButton({
  label,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#2C3E50] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30',
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Delete button that asks "Are you sure?" inline instead of a popup. */
export function ConfirmDelete({
  label,
  confirmText,
  onConfirm,
  pending,
}: {
  label: ReactNode;
  confirmText: string;
  onConfirm: () => void;
  pending?: boolean;
}) {
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setAsking(true)} disabled={pending}>
        {label}
      </Button>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2 rounded-lg bg-red-50 px-2 py-1">
      <span className="text-xs font-medium text-red-700">{confirmText}</span>
      <Button variant="danger" className="px-2 py-1 text-xs" pending={pending} onClick={onConfirm}>
        Yes, delete
      </Button>
      <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setAsking(false)} disabled={pending}>
        Cancel
      </Button>
    </span>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="text-sm text-red-600">
      {children}
    </p>
  );
}
