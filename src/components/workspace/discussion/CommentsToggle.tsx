'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import DiscussionThread from './DiscussionThread';

/** A small "3 new" pill. */
export function NewBadge({ n }: { n: number }) {
  const { t } = useTranslation();
  if (n <= 0) return null;
  return (
    <span data-testid="new-badge" className="shrink-0 rounded-full bg-[var(--wq-accent)] px-1.5 py-px text-[10px] font-semibold text-white">
      {t('discussion.new', { n })}
    </span>
  );
}

/**
 * "Comments (3)" button that opens the conversation about a file or an
 * activity answer right where it is.
 */
export default function CommentsToggle({
  threadKey,
  total = 0,
  unread = 0,
  help,
  defaultOpen = false,
  id,
  label,
  scrollTo = false,
}: {
  threadKey: string;
  total?: number;
  unread?: number;
  help?: string;
  defaultOpen?: boolean;
  /** Anchor so links can jump here. */
  id?: string;
  /** Button text (default "Comments"). */
  label?: string;
  /** Open and bring into view when the page loads. */
  scrollTo?: boolean;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(defaultOpen);
  const [seen, setSeen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  // Links from the Discussion page open the right conversation (…#discussion, or ?comments=<file>).
  useEffect(() => {
    if ((id && window.location.hash === `#${id}`) || scrollTo) {
      setOpen(true);
      box.current?.scrollIntoView({ block: 'center' });
    }
  }, [id, scrollTo]);
  return (
    <div id={id} ref={box} data-testid="comments" className="scroll-mt-24">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--wq-text-muted)] hover:text-[var(--wq-text)]"
      >
        <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
        {label ?? t('discussion.comments')}
        {total > 0 && <span>({total})</span>}
        {!seen && <NewBadge n={unread} />}
        <ChevronDown className={cn('h-3.5 w-3.5 transition', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open && (
        <div className="mt-2 space-y-1.5">
          {help && <p className="text-xs text-[var(--wq-text-muted)]">{help}</p>}
          <DiscussionThread threadKey={threadKey} height="short" onSeen={() => setSeen(true)} />
        </div>
      )}
    </div>
  );
}
