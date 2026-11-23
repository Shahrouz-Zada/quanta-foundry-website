'use client';

import { Fragment, type ReactNode } from 'react';
import { imageDataUrl } from '@/lib/notebook';

// A small Markdown renderer for notebook text cells. It builds React elements
// only (never raw HTML), so whatever a student writes in a notebook can't run
// anything or load anything from the outside:
//   - links open only for http(s) and mailto addresses, in a new tab;
//   - images show only when embedded in the notebook (pasted attachments or
//     data: pictures); pictures hosted elsewhere become a plain link;
//   - HTML tags are dropped (<br> keeps its line break) and their text stays;
//   - maths ($…$) is shown as written.

const SAFE_LINK = /^(https?:\/\/|mailto:)/i;
const DATA_IMAGE = /^data:(image\/(?:png|jpeg|gif|webp));base64,([A-Za-z0-9+/=\s]+)$/i;

type Attachments = Record<string, string>;

const MAX_MARKED_UP_CHARS = 4000;

/** A picture address that may be loaded, or null. */
function safeImageSrc(src: string, attachments: Attachments): string | null {
  const trimmed = src.trim();
  if (trimmed.startsWith('attachment:')) return attachments[trimmed.slice('attachment:'.length)] ?? null;
  const m = DATA_IMAGE.exec(trimmed);
  return m ? imageDataUrl(m[1], m[2]) : null;
}

// -----------------------------------------------------------------------------
// Inline text
// -----------------------------------------------------------------------------

function stripTags(text: string): string {
  return text
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[A-Za-z][^<>]*>/g, '');
}

/** Finds the ")" that closes a link whose "(" is just before `start`, allowing one level of nested parentheses. */
function closingParen(text: string, start: number): number {
  let depth = 1;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')' && --depth === 0) return i;
  }
  return -1;
}

function Inline({ text, attachments, imageLabel }: { text: string; attachments: Attachments; imageLabel: string }): ReactNode {
  // Marking up a huge paragraph can take quadratic time; a very long one is shown as plain text.
  if (text.length > MAX_MARKED_UP_CHARS) return <>{stripTags(text)}</>;
  const out: ReactNode[] = [];
  let buffer = '';
  let key = 0;
  const flush = () => {
    if (buffer) out.push(<Fragment key={key++}>{stripTags(buffer)}</Fragment>);
    buffer = '';
  };
  const sub = (t: string) => <Inline text={t} attachments={attachments} imageLabel={imageLabel} />;

  for (let i = 0; i < text.length; ) {
    const rest = text.slice(i);

    // `code`
    const code = /^(`+)([\s\S]*?[^`])\1(?!`)/.exec(rest);
    if (code) {
      flush();
      out.push(
        <code key={key++} className="rounded bg-[var(--wq-canvas-alt)] px-1 py-0.5 font-mono text-[0.9em]">
          {code[2].trim()}
        </code>,
      );
      i += code[0].length;
      continue;
    }

    // ![alt](src) and [text](url)
    const isImage = rest.startsWith('![');
    if (isImage || rest[0] === '[') {
      const labelEnd = rest.indexOf(']', isImage ? 2 : 1);
      if (labelEnd > 0 && rest[labelEnd + 1] === '(') {
        const end = closingParen(rest, labelEnd + 2);
        if (end > 0) {
          const label = rest.slice(isImage ? 2 : 1, labelEnd);
          const target = rest.slice(labelEnd + 2, end).trim().split(/\s+"/)[0].replace(/^<|>$/g, '');
          flush();
          if (isImage) {
            const src = safeImageSrc(target, attachments);
            if (src) {
              // eslint-disable-next-line @next/next/no-img-element
              out.push(<img key={key++} src={src} alt={label} className="my-2 max-w-full" />);
            } else if (SAFE_LINK.test(target)) {
              out.push(
                <a key={key++} href={target} target="_blank" rel="noopener noreferrer nofollow ugc" className="text-[var(--wq-accent)] underline">
                  {imageLabel}{label ? `: ${label}` : ''}
                </a>,
              );
            } else {
              out.push(<span key={key++}>{imageLabel}{label ? `: ${label}` : ''}</span>);
            }
          } else if (SAFE_LINK.test(target)) {
            out.push(
              <a key={key++} href={target} target="_blank" rel="noopener noreferrer nofollow ugc" className="text-[var(--wq-accent)] underline">
                {sub(label)}
              </a>,
            );
          } else {
            out.push(<Fragment key={key++}>{sub(label)}</Fragment>);
          }
          i += end + 1;
          continue;
        }
      }
    }

    // <https://autolink>
    const auto = /^<((?:https?:\/\/|mailto:)[^\s<>]+)>/i.exec(rest);
    if (auto) {
      flush();
      out.push(
        <a key={key++} href={auto[1]} target="_blank" rel="noopener noreferrer nofollow ugc" className="break-all text-[var(--wq-accent)] underline">
          {auto[1]}
        </a>,
      );
      i += auto[0].length;
      continue;
    }

    // **bold**, __bold__, ~~strike~~, *italic*, _italic_
    const strong = /^(\*\*|__)(?=\S)([\s\S]*?\S)\1/.exec(rest);
    if (strong) {
      flush();
      out.push(<strong key={key++}>{sub(strong[2])}</strong>);
      i += strong[0].length;
      continue;
    }
    const strike = /^~~(?=\S)([\s\S]*?\S)~~/.exec(rest);
    if (strike) {
      flush();
      out.push(<del key={key++}>{sub(strike[1])}</del>);
      i += strike[0].length;
      continue;
    }
    const em = /^(\*|_)(?=\S)([\s\S]*?\S)\1(?!\w)/.exec(rest);
    // "snake_case_names" and "2 * 3 * 4" are not emphasis.
    if (em && (em[1] === '*' ? !/^\*\s/.test(rest) : !/\w$/.test(buffer))) {
      flush();
      out.push(<em key={key++}>{sub(em[2])}</em>);
      i += em[0].length;
      continue;
    }

    // Backslash escapes.
    if (rest[0] === '\\' && rest.length > 1 && /[\\`*_{}[\]()#+\-.!|<>~$]/.test(rest[1])) {
      buffer += rest[1];
      i += 2;
      continue;
    }

    buffer += rest[0];
    i += 1;
  }
  flush();
  return <>{out}</>;
}

// -----------------------------------------------------------------------------
// Blocks
// -----------------------------------------------------------------------------

type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'code'; text: string }
  | { type: 'math'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'rule' }
  | { type: 'list'; ordered: boolean; items: { text: string; children: string }[] }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'paragraph'; text: string };

const LIST_ITEM = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
const splitRow = (line: string) =>
  line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
const isTableRule = (line: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line) && line.includes('-');

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    const fence = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence[1])) body.push(lines[i++]);
      i++;
      blocks.push({ type: 'code', text: body.join('\n') });
      continue;
    }

    if (line.trim().startsWith('$$')) {
      const body: string[] = [];
      const first = line.trim().slice(2);
      if (first.endsWith('$$') && first.length >= 2) {
        blocks.push({ type: 'math', text: first.slice(0, -2) });
        i++;
        continue;
      }
      if (first) body.push(first);
      i++;
      while (i < lines.length && !lines[i].includes('$$')) body.push(lines[i++]);
      if (i < lines.length) body.push(lines[i].slice(0, lines[i].indexOf('$$')));
      i++;
      blocks.push({ type: 'math', text: body.join('\n').trim() });
      continue;
    }

    const heading = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] });
      i++;
      continue;
    }

    if (/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(line)) {
      blocks.push({ type: 'rule' });
      i++;
      continue;
    }

    if (line.trim().startsWith('>')) {
      const body: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) body.push(lines[i++].replace(/^\s*>\s?/, ''));
      blocks.push({ type: 'quote', text: body.join('\n') });
      continue;
    }

    if (line.includes('|') && i + 1 < lines.length && isTableRule(lines[i + 1])) {
      const head = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim() && lines[i].includes('|')) rows.push(splitRow(lines[i++]));
      blocks.push({ type: 'table', head, rows });
      continue;
    }

    const first = LIST_ITEM.exec(line);
    if (first) {
      const baseIndent = first[1].length;
      const ordered = /\d/.test(first[2]);
      const items: { text: string; children: string }[] = [];
      while (i < lines.length) {
        const m = LIST_ITEM.exec(lines[i]);
        if (m && m[1].length <= baseIndent && /\d/.test(m[2]) === ordered) {
          items.push({ text: m[3], children: '' });
          i++;
          continue;
        }
        const last = items[items.length - 1];
        // Indented lines belong to the current item: a nested list or a continuation.
        if (last && lines[i].trim() && (m ? m[1].length > baseIndent : /^\s+\S/.test(lines[i]))) {
          last.children += `${lines[i].slice(Math.min(lines[i].length - lines[i].trimStart().length, baseIndent + 2))}\n`;
          i++;
          continue;
        }
        break;
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    const body: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*(`{3,}|~{3,})/.test(lines[i]) &&
      !/^\s{0,3}#{1,6}\s/.test(lines[i]) &&
      !lines[i].trim().startsWith('>') &&
      !LIST_ITEM.test(lines[i])
    ) {
      body.push(lines[i++]);
    }
    // A line that fell through every rule above is plain text, so this always moves forward.
    if (body.length === 0) body.push(lines[i++]);
    blocks.push({ type: 'paragraph', text: body.join('\n') });
  }
  return blocks;
}

const headingClass = ['', 'text-2xl font-bold', 'text-xl font-bold', 'text-lg font-semibold', 'text-base font-semibold', 'text-sm font-semibold', 'text-sm font-medium'];

function Blocks({ source, attachments, imageLabel, depth }: { source: string; attachments: Attachments; imageLabel: string; depth: number }): ReactNode {
  const inline = (text: string) => <Inline text={text} attachments={attachments} imageLabel={imageLabel} />;
  return (
    <>
      {parseBlocks(source).map((b, n) => {
        switch (b.type) {
          case 'heading': {
            const Tag = `h${Math.min(6, b.level + 1)}` as 'h2';
            return (
              <Tag key={n} className={`${headingClass[b.level]} mt-4 mb-2 first:mt-0 text-[var(--wq-text)]`}>
                {inline(b.text)}
              </Tag>
            );
          }
          case 'code':
            return (
              <pre key={n} className="my-2 overflow-x-auto rounded-lg bg-[var(--wq-canvas-alt)] p-3 font-mono text-[13px] leading-relaxed">
                {b.text}
              </pre>
            );
          case 'math':
            return (
              <pre key={n} className="my-2 overflow-x-auto rounded-lg border border-dashed border-[var(--wq-border-hover)] p-3 font-mono text-[13px]">
                {b.text}
              </pre>
            );
          case 'quote':
            return (
              <blockquote key={n} className="my-2 border-l-4 border-[var(--wq-border-hover)] pl-3 text-[var(--wq-text-muted)]">
                {depth < 4 ? <Blocks source={b.text} attachments={attachments} imageLabel={imageLabel} depth={depth + 1} /> : b.text}
              </blockquote>
            );
          case 'rule':
            return <hr key={n} className="my-4 border-[var(--wq-border)]" />;
          case 'list': {
            const Tag = b.ordered ? 'ol' : 'ul';
            return (
              <Tag key={n} className={`my-2 space-y-1 pl-6 ${b.ordered ? 'list-decimal' : 'list-disc'}`}>
                {b.items.map((it, k) => (
                  <li key={k}>
                    {inline(it.text)}
                    {it.children.trim() && depth < 6 && (
                      <Blocks source={it.children} attachments={attachments} imageLabel={imageLabel} depth={depth + 1} />
                    )}
                  </li>
                ))}
              </Tag>
            );
          }
          case 'table':
            return (
              <div key={n} className="my-3 overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {b.head.map((h, c) => (
                        <th key={c} className="border border-[var(--wq-border)] bg-[var(--wq-canvas-alt)] px-2 py-1 text-left font-semibold">
                          {inline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, ri) => (
                      <tr key={ri}>
                        {b.head.map((_, c) => (
                          <td key={c} className="border border-[var(--wq-border)] px-2 py-1">
                            {inline(r[c] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return (
              <p key={n} className="my-2 whitespace-pre-line break-words">
                {inline(b.text)}
              </p>
            );
        }
      })}
    </>
  );
}

export function SafeMarkdown({ source, attachments = {}, imageLabel }: { source: string; attachments?: Attachments; imageLabel: string }) {
  return (
    <div className="text-sm leading-relaxed text-[var(--wq-text)] [&>*:first-child]:mt-0">
      <Blocks source={source} attachments={attachments} imageLabel={imageLabel} depth={0} />
    </div>
  );
}
