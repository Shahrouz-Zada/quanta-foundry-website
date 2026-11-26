'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown, Loader2, Send, Trash2, WifiOff } from 'lucide-react';
import { deleteDiscussionMessage, markDiscussionRead, postDiscussionMessage } from '@/app/workspace-q/classes/discussion-actions';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { MAX_MESSAGE_CHARS, linkify, mergeMessages, nextPollDelay, type MessageView } from '@/lib/discussions';

// One conversation: the messages, a box to write, and live updates. The
// thread asks the server for changes every few seconds while it is open and
// the browser tab is visible (faster while people are writing), stops when
// the tab is hidden, and catches up at once when it comes back.

type Status = 'loading' | 'ready' | 'gone';

export default function DiscussionThread({
  threadKey,
  className,
  height = 'tall',
  onSeen,
}: {
  threadKey: string;
  className?: string;
  /** "tall" for the team board page; "short" inside a file or an activity. */
  height?: 'tall' | 'short';
  /** Called after the thread was marked read (lets a parent clear its "new" badge). */
  onSeen?: () => void;
}) {
  const { t, lang } = useTranslation();
  const [messages, setMessages] = useState<MessageView[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [offline, setOffline] = useState(false);
  const [me, setMe] = useState<string | null>(null);
  const [canModerate, setCanModerate] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewBelow, setShowNewBelow] = useState(false);

  const since = useRef<number | null>(null);
  const lastActivity = useRef(Date.now());
  const inFlight = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const readMarked = useRef<string>('');
  const stopped = useRef(false);

  const fetchNow = useCallback(async () => {
    if (inFlight.current || stopped.current) return;
    inFlight.current = true;
    try {
      const q = new URLSearchParams({ key: threadKey });
      if (since.current !== null) q.set('since', String(since.current));
      const res = await fetch(`/api/workspace-q/discussion?${q}`, { cache: 'no-store', credentials: 'same-origin' });
      if (res.status === 404 || res.status === 401) {
        stopped.current = true;
        setStatus('gone');
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { messages: MessageView[]; now: number; me: string; canModerate: boolean };
      setOffline(false);
      setMe(data.me);
      setCanModerate(data.canModerate);
      setMessages((current) => {
        const known = new Set(current.map((m) => `${m.id}:${m.updatedAt}`));
        if (data.messages.some((m) => !known.has(`${m.id}:${m.updatedAt}`) && m.authorId !== data.me)) lastActivity.current = Date.now();
        // A message we just sent may come back from the server before the send finishes: drop its placeholder.
        const mineNow = new Set(data.messages.filter((m) => m.authorId === data.me).map((m) => m.body));
        return mergeMessages(current.filter((m) => !(m.id.startsWith('tmp-') && mineNow.has(m.body))), data.messages);
      });
      since.current = data.now;
      setStatus('ready');
    } catch {
      setOffline(true);
    } finally {
      inFlight.current = false;
    }
  }, [threadKey]);

  // The polling loop.
  useEffect(() => {
    stopped.current = false;
    since.current = null;
    setMessages([]);
    setStatus('loading');
    let cancelled = false;

    const schedule = () => {
      if (cancelled || stopped.current) return;
      const delay = nextPollDelay(lastActivity.current, Date.now(), document.visibilityState === 'visible');
      if (delay === null) return; // resumes on visibilitychange
      timer.current = setTimeout(async () => {
        await fetchNow();
        schedule();
      }, delay);
    };
    const onVisible = () => {
      if (document.visibilityState !== 'visible' || cancelled) return;
      if (timer.current) clearTimeout(timer.current);
      fetchNow().then(schedule);
    };

    fetchNow().then(schedule);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [fetchNow]);

  // Mark as read when someone else's message is on screen and the tab is visible.
  useEffect(() => {
    if (status !== 'ready' || !me || document.visibilityState !== 'visible') return;
    const latestOther = [...messages].reverse().find((m) => m.authorId !== me && !m.id.startsWith('tmp-'));
    if (!latestOther || readMarked.current === latestOther.id) return;
    const handle = setTimeout(() => {
      readMarked.current = latestOther.id;
      markDiscussionRead({ key: threadKey }).then((r) => {
        if (r.ok) onSeen?.();
      });
    }, 800);
    return () => clearTimeout(handle);
  }, [messages, status, me, threadKey, onSeen]);

  // Keep the view at the newest message, unless the reader scrolled up to read older ones.
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
      setShowNewBelow(false);
    } else {
      setShowNewBelow(true);
    }
  }, [messages.length]);

  function onScroll() {
    const el = listRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    if (stickToBottom.current) setShowNewBelow(false);
  }

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    lastActivity.current = Date.now();
    stickToBottom.current = true;
    const tmp: MessageView = {
      id: `tmp-${Date.now()}`,
      authorId: me ?? 'me',
      authorName: null,
      authorIsStaff: false,
      body,
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, tmp]);
    setDraft('');
    const result = await postDiscussionMessage({ key: threadKey, body });
    setMessages((m) => {
      const without = m.filter((x) => x.id !== tmp.id);
      return result.ok ? mergeMessages(without, [result.message]) : without;
    });
    if (!result.ok) {
      setDraft(body);
      setError(result.error);
    } else {
      readMarked.current = '';
    }
    setSending(false);
  }

  async function remove(id: string) {
    const result = await deleteDiscussionMessage({ messageId: id });
    if (!result.ok) return setError(result.error);
    lastActivity.current = Date.now();
    await fetchNow();
  }

  if (status === 'gone') {
    return <p className="rounded-xl bg-[var(--wq-canvas-alt)] p-4 text-sm text-[var(--wq-text-muted)]">{t('discussion.gone')}</p>;
  }

  const left = MAX_MESSAGE_CHARS - draft.length;
  return (
    <div className={cn('flex flex-col rounded-xl border border-[var(--wq-border)] bg-[var(--wq-card)]', className)} data-testid="discussion-thread">
      <div className="relative">
        <div
          ref={listRef}
          onScroll={onScroll}
          role="log"
          aria-live="polite"
          aria-label={t('discussion.title')}
          className={cn('space-y-3 overflow-y-auto px-4 py-3', height === 'tall' ? 'h-[min(60vh,32rem)]' : 'max-h-72 min-h-24')}
        >
          {status === 'loading' ? (
            <p className="flex items-center gap-2 text-sm text-[var(--wq-text-muted)]">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {t('discussion.loading')}
            </p>
          ) : messages.length === 0 ? (
            <p className="py-4 text-center text-sm text-[var(--wq-text-muted)]">{t('discussion.empty')}</p>
          ) : (
            messages.map((m) => (
              <Message
                key={m.id}
                message={m}
                mine={m.authorId === me || m.id.startsWith('tmp-')}
                canDelete={!m.deleted && !m.id.startsWith('tmp-') && (m.authorId === me || canModerate)}
                lang={lang}
                onDelete={() => remove(m.id)}
              />
            ))
          )}
        </div>
        {showNewBelow && (
          <button
            type="button"
            onClick={() => {
              stickToBottom.current = true;
              listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
              setShowNewBelow(false);
            }}
            className="absolute bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-[var(--wq-accent)] px-3 py-1 text-xs font-medium text-white shadow"
          >
            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" /> {t('discussion.newBelow')}
          </button>
        )}
      </div>

      <form
        className="border-t border-[var(--wq-border)] p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              lastActivity.current = Date.now();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            maxLength={MAX_MESSAGE_CHARS}
            placeholder={t('discussion.placeholder')}
            aria-label={t('discussion.placeholder')}
            className="min-h-[2.75rem] flex-1 resize-y rounded-lg border border-[var(--wq-border)] bg-[var(--wq-card)] px-3 py-2 text-sm text-[var(--wq-text)] placeholder:text-[var(--wq-text-subtle)] focus:border-[var(--wq-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--wq-accent-glow)]"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[var(--wq-accent)] px-3 text-sm font-medium text-white hover:bg-[var(--wq-accent-hover)] disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
            <span className="hidden sm:inline">{t('discussion.send')}</span>
          </button>
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--wq-text-muted)]">
          {offline ? (
            <span className="inline-flex items-center gap-1 text-amber-700" role="status">
              <WifiOff className="h-3 w-3" aria-hidden="true" /> {t('discussion.offline')}
            </span>
          ) : (
            <span>{t('discussion.live')}</span>
          )}
          {left < 500 && <span>{t('discussion.charsLeft', { n: left })}</span>}
        </div>
        {error && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

function formatTime(iso: string, lang: string): string {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const locale = lang === 'fr' ? 'fr-FR' : 'en-GB';
  return sameDay
    ? d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function Message({
  message,
  mine,
  canDelete,
  lang,
  onDelete,
}: {
  message: MessageView;
  mine: boolean;
  canDelete: boolean;
  lang: string;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const [confirm, setConfirm] = useState(false);
  const pending = message.id.startsWith('tmp-');
  const name = mine ? t('discussion.you') : (message.authorName ?? t('files.unnamed'));
  return (
    <div data-testid="discussion-message" className={cn('group flex flex-col', mine ? 'items-end' : 'items-start')}>
      <div className="mb-0.5 flex items-center gap-1.5 text-[11px] text-[var(--wq-text-muted)]">
        <span className="font-semibold text-[var(--wq-text)]">{name}</span>
        {message.authorIsStaff && (
          <span className="rounded-full bg-[var(--wq-gold-muted)] px-1.5 py-px text-[10px] font-semibold text-[#9A7B1C]">{t('discussion.instructor')}</span>
        )}
        <time dateTime={message.createdAt}>{formatTime(message.createdAt, lang)}</time>
        {canDelete && !confirm && (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            aria-label={t('discussion.delete')}
            className="rounded p-0.5 text-[var(--wq-text-subtle)] opacity-60 hover:text-red-600 hover:opacity-100 group-hover:opacity-100"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
          </button>
        )}
      </div>
      <div
        className={cn(
          'max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm',
          message.deleted
            ? 'border border-dashed border-[var(--wq-border-hover)] italic text-[var(--wq-text-muted)]'
            : mine
              ? 'bg-[var(--wq-accent)] text-white'
              : 'bg-[var(--wq-canvas-alt)] text-[var(--wq-text)]',
          pending && 'opacity-60',
        )}
      >
        {message.deleted
          ? t('discussion.deleted')
          : linkify(message.body).map((piece, i) =>
              'url' in piece ? (
                <a
                  key={i}
                  href={piece.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow ugc"
                  className={cn('underline break-all', mine ? 'text-white' : 'text-[var(--wq-accent)]')}
                >
                  {piece.text}
                </a>
              ) : (
                <span key={i}>{piece.text}</span>
              ),
            )}
      </div>
      {confirm && (
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className="text-[var(--wq-text-muted)]">{t('discussion.deleteConfirm')}</span>
          <button type="button" onClick={() => { setConfirm(false); onDelete(); }} className="font-semibold text-red-600 hover:underline">
            {t('discussion.delete')}
          </button>
          <button type="button" onClick={() => setConfirm(false)} className="text-[var(--wq-text-muted)] hover:underline">
            {t('discussion.cancel')}
          </button>
        </div>
      )}
    </div>
  );
}
