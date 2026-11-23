'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { MessageKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { highlightPython, type TokenKind } from '@/lib/notebook-highlight';
import { parseNotebook, type Notebook, type NotebookCell, type NotebookOutput } from '@/lib/notebook';
import { SafeMarkdown } from './SafeMarkdown';

// Read-only notebook preview. The file is fetched from the permission-checked
// download route, parsed in the browser, and drawn as text and pictures only:
// no notebook script ever runs, nothing is loaded from outside, and HTML
// outputs (such as pandas tables) are shown inside a fully sandboxed frame.

type State =
  | { status: 'loading' }
  | { status: 'error'; message: MessageKey }
  | { status: 'ready'; notebook: Notebook };

export default function NotebookViewer({ src }: { src: string }) {
  const { t } = useTranslation();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [showOutputs, setShowOutputs] = useState(true);
  const [wrap, setWrap] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(src, { signal: controller.signal, credentials: 'same-origin' });
        if (response.status === 404) return setState({ status: 'error', message: 'notebook.err.missing' });
        if (!response.ok) return setState({ status: 'error', message: 'notebook.err.load' });
        const parsed = parseNotebook(await response.text());
        if (!parsed.ok) {
          const keys = {
            empty: 'notebook.err.empty',
            notJson: 'notebook.err.notJson',
            notNotebook: 'notebook.err.notNotebook',
            tooNew: 'notebook.err.tooNew',
          } as const;
          return setState({ status: 'error', message: keys[parsed.reason] });
        }
        setState({ status: 'ready', notebook: parsed.notebook });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setState({ status: 'error', message: 'notebook.err.load' });
      }
    })();
    return () => controller.abort();
  }, [src]);

  if (state.status === 'loading') {
    return (
      <p className="flex items-center gap-2 py-10 text-sm text-[var(--wq-text-muted)]" role="status">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {t('notebook.loading')}
      </p>
    );
  }
  if (state.status === 'error') {
    return (
      <p role="alert" className="rounded-xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-5 text-sm text-[var(--wq-text)]">
        {t(state.message)}
      </p>
    );
  }

  const { notebook } = state;
  return (
    <div data-testid="notebook">
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--wq-text-muted)]">
        <span data-testid="notebook-summary">
          {t('notebook.summary', {
            cells: notebook.cells.length,
            code: notebook.counts.code,
            text: notebook.counts.markdown + notebook.counts.raw,
            outputs: notebook.counts.outputs,
          })}
        </span>
        {notebook.kernel && <span>{t('notebook.kernel', { name: notebook.kernel })}</span>}
        <label className="inline-flex items-center gap-1.5">
          <input type="checkbox" checked={showOutputs} onChange={(e) => setShowOutputs(e.target.checked)} />
          {t('notebook.showOutputs')}
        </label>
        <label className="inline-flex items-center gap-1.5">
          <input type="checkbox" checked={wrap} onChange={(e) => setWrap(e.target.checked)} />
          {t('notebook.wrap')}
        </label>
      </div>

      {notebook.truncated && (
        <p className="mb-3 rounded-lg bg-[var(--wq-gold-muted)] px-3 py-2 text-xs text-[var(--wq-text)]">{t('notebook.cut')}</p>
      )}

      {notebook.cells.length === 0 ? (
        <p className="text-sm text-[var(--wq-text-muted)]">{t('notebook.noCells')}</p>
      ) : (
        <ol className="space-y-3">
          {notebook.cells.map((cell, i) => (
            <li key={i}>
              <Cell cell={cell} language={notebook.language} showOutputs={showOutputs} wrap={wrap} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------

const TOKEN_CLASS: Record<TokenKind, string> = {
  plain: '',
  keyword: 'text-[#c4a7ff] font-medium',
  string: 'text-[#9be29b]',
  comment: 'text-[#8b98a5] italic',
  number: 'text-[#ffb86c]',
  constant: 'text-[#79c0ff]',
  decorator: 'text-[#f2a1d2]',
  magic: 'text-[#8b98a5] italic',
};

function Code({ source, language, wrap }: { source: string; language: string; wrap: boolean }) {
  const tokens = useMemo(
    () => (language === 'python' || language.startsWith('python') ? highlightPython(source) : [{ text: source, kind: 'plain' as const }]),
    [source, language],
  );
  return (
    <pre
      data-testid="code-source"
      // Always a dark block, readable in both site themes.
      className={cn(
        'rounded-lg bg-[#0f1b26] p-3 font-mono text-[13px] leading-relaxed text-[#e6edf3]',
        wrap ? 'whitespace-pre-wrap break-words' : 'overflow-x-auto',
      )}
    >
      <code>
        {tokens.map((tok, i) =>
          tok.kind === 'plain' ? tok.text : (
            <span key={i} className={TOKEN_CLASS[tok.kind]}>
              {tok.text}
            </span>
          ),
        )}
      </code>
    </pre>
  );
}

function Cell({ cell, language, showOutputs, wrap }: { cell: NotebookCell; language: string; showOutputs: boolean; wrap: boolean }) {
  const { t } = useTranslation();
  if (cell.kind === 'markdown') {
    return (
      <div data-testid="cell-markdown" className="rounded-xl border border-[var(--wq-border)] bg-[var(--wq-card)] px-4 py-3">
        <SafeMarkdown source={cell.source} attachments={cell.attachments} imageLabel={t('notebook.image')} />
      </div>
    );
  }
  if (cell.kind === 'raw') {
    return (
      <pre data-testid="cell-raw" className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-dashed border-[var(--wq-border-hover)] p-3 font-mono text-[13px] text-[var(--wq-text-muted)]">
        {cell.source}
      </pre>
    );
  }
  return (
    <div data-testid="cell-code" className="grid gap-1 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-x-2">
      <div className="pt-3 font-mono text-[11px] text-[var(--wq-text-muted)] sm:text-right">
        {cell.executionCount !== null ? t('notebook.cellIn', { n: cell.executionCount }) : 'In [ ]'}
      </div>
      <div className="min-w-0 space-y-1.5">
        {cell.source.trim() !== '' && <Code source={cell.source} language={language} wrap={wrap} />}
        {showOutputs &&
          cell.outputs.map((o, i) => (
            <div key={i} data-testid="cell-output">
              <Output output={o} wrap={wrap} />
            </div>
          ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------

function Output({ output, wrap }: { output: NotebookOutput; wrap: boolean }) {
  const { t } = useTranslation();
  const preClass = cn(
    'max-h-[28rem] overflow-auto rounded-lg border border-[var(--wq-border)] bg-[var(--wq-card)] p-3 font-mono text-[13px] leading-relaxed text-[var(--wq-text)]',
    wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre',
  );
  switch (output.kind) {
    case 'text':
      return (
        <pre className={cn(preClass, output.stream === 'stderr' && 'border-red-300 bg-red-50 text-red-900')} aria-label={output.stream === 'stderr' ? t('notebook.stderr') : undefined}>
          {output.text}
        </pre>
      );
    case 'error':
      return (
        <pre role="note" className="max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-red-300 bg-red-50 p-3 font-mono text-[13px] leading-relaxed text-red-900">
          {output.traceback.trim() || `${output.name}: ${output.message}`}
        </pre>
      );
    case 'image':
      return (
        <div className="overflow-x-auto rounded-lg border border-[var(--wq-border)] bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={output.src} alt={t('notebook.outputTitle')} className="max-w-full" />
        </div>
      );
    case 'markdown':
      return (
        <div className="rounded-lg border border-[var(--wq-border)] bg-[var(--wq-card)] px-4 py-2">
          <SafeMarkdown source={output.text} imageLabel={t('notebook.image')} />
        </div>
      );
    case 'html':
      return <HtmlOutput html={output.html} title={t('notebook.outputTitle')} />;
    default:
      return <p className="rounded-lg bg-[var(--wq-canvas-alt)] px-3 py-2 text-xs text-[var(--wq-text-muted)]">{t('notebook.unsupported')}</p>;
  }
}

/**
 * Rich output such as a pandas table. It goes in a frame with an empty
 * `sandbox` (no scripts, no forms, no navigation, no access to this site) and a
 * policy that blocks every network request, so it can only be looked at.
 */
function HtmlOutput({ html, title }: { html: string; title: string }) {
  const rows = (html.match(/<tr[\s>]/gi) ?? []).length;
  const height = Math.min(520, Math.max(90, rows * 30 + 50));
  const srcDoc =
    '<!doctype html><html><head><meta charset="utf-8">' +
    '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data:; style-src \'unsafe-inline\'">' +
    '<base target="_blank">' +
    '<style>body{margin:8px;font:13px/1.4 system-ui,sans-serif;color:#18242B;background:#fff}' +
    'table{border-collapse:collapse}td,th{padding:3px 8px;border:1px solid #ddd}</style>' +
    `</head><body>${html}</body></html>`;
  return (
    <iframe
      title={title}
      sandbox=""
      referrerPolicy="no-referrer"
      srcDoc={srcDoc}
      style={{ height }}
      className="w-full resize-y rounded-lg border border-[var(--wq-border)] bg-white"
    />
  );
}
