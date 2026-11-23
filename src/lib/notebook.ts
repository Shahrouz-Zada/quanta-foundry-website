// =============================================================================
// Workspace Q · notebook preview — turns the text of an .ipynb file into a
// plain, safe description of what to draw.
//
// Pure functions, no React and no server code. The viewer only ever draws
// what comes out of here, as text and <img> tags, so nothing inside a student's
// notebook (scripts, HTML, widgets) can run. A notebook is untrusted input:
// every field is checked and nothing is assumed to have the right type.
// =============================================================================

export type NotebookOutput =
  | { kind: 'text'; text: string; stream: 'stdout' | 'stderr' | 'result' }
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'html'; html: string }
  | { kind: 'markdown'; text: string }
  | { kind: 'error'; name: string; message: string; traceback: string }
  /** An output that needs a live notebook (widgets, interactive plots) and has no text fallback. */
  | { kind: 'unsupported'; mimeTypes: string[] };

export type NotebookCell =
  | { kind: 'markdown'; source: string; attachments: Record<string, string> }
  | { kind: 'code'; source: string; executionCount: number | null; outputs: NotebookOutput[] }
  | { kind: 'raw'; source: string };

export interface Notebook {
  cells: NotebookCell[];
  /** Language of the code cells, lower case ("python" when the notebook doesn't say). */
  language: string;
  /** Kernel display name when the notebook records one. */
  kernel: string | null;
  nbformat: number;
  /** Counts for the summary line. */
  counts: { markdown: number; code: number; raw: number; outputs: number };
  /** True when long output was cut to keep the page responsive. */
  truncated: boolean;
}

export type ParseResult =
  | { ok: true; notebook: Notebook }
  | { ok: false; reason: 'empty' | 'notJson' | 'notNotebook' | 'tooNew' };

/** Longest text kept for one output / one cell source; the rest is replaced by a note. */
export const MAX_OUTPUT_CHARS = 60_000;
export const MAX_SOURCE_CHARS = 200_000;
/** Most cells drawn; a notebook with more is cut off with a note. */
export const MAX_CELLS = 1500;

type Json = Record<string, unknown>;

const isObject = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v);

/** nbformat stores text as a string or as an array of lines. */
export function joinText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.filter((v) => typeof v === 'string').join('');
  return '';
}

// ANSI colour codes in tracebacks and some library output (the ESC character is not valid in a regex literal).
const ANSI = /\u001b\[[0-9;?]*[ -/]*[@-~]/g;

export function stripAnsi(text: string): string {
  return text.replace(ANSI, '');
}

/**
 * Progress bars rewrite the same line with "\r". Keep what the line finally
 * said, like a terminal does.
 */
export function settleCarriageReturns(text: string): string {
  if (!text.includes('\r')) return text;
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => {
      const parts = line.split('\r');
      return parts[parts.length - 1] || parts.filter(Boolean).pop() || '';
    })
    .join('\n');
}

function clip(text: string, max: number): { text: string; cut: boolean } {
  if (text.length <= max) return { text, cut: false };
  return { text: text.slice(0, max), cut: true };
}

const BASE64 = /^[A-Za-z0-9+/=\s]+$/;
const IMAGE_TYPES: Record<string, string> = {
  'image/png': 'image/png',
  'image/jpeg': 'image/jpeg',
  'image/jpg': 'image/jpeg',
  'image/gif': 'image/gif',
  'image/webp': 'image/webp',
};

/** A data: address for an embedded raster image, or null if the data isn't plausible base64. */
export function imageDataUrl(mime: string, data: unknown): string | null {
  const type = IMAGE_TYPES[mime.toLowerCase()];
  const raw = joinText(data).replace(/\s+/g, '');
  if (!type || !raw || !BASE64.test(raw)) return null;
  return `data:${type};base64,${raw}`;
}

/** SVG is only ever shown through an <img>, where browsers never run its scripts. */
function svgDataUrl(data: unknown): string | null {
  const svg = joinText(data).trim();
  if (!svg.toLowerCase().includes('<svg')) return null;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Tags that could redirect or restyle the frame that shows an HTML output
 * (a meta refresh, a stylesheet link, a new base address) are removed. Scripts
 * never get this far: outputs containing them are not shown as HTML at all.
 */
export function cleanOutputHtml(html: string): string {
  return html.replace(/<\/?(?:meta|link|base)\b[^>]*>/gi, '');
}

/** Interactive HTML (plotly, bokeh, widgets) needs scripts, which we never run. */
const HAS_ACTIVE_HTML = /<script|<iframe|<object|<embed|javascript:/i;

/**
 * Picks the best thing to show for a bundle of formats (a "mime bundle"), the
 * way Jupyter does, but only from formats we can draw safely.
 */
function outputFromBundle(data: Json, kind: 'result' | 'display', notes: { cut: boolean }): NotebookOutput | null {
  for (const mime of ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']) {
    if (mime in data) {
      const src = imageDataUrl(mime, data[mime]);
      if (src) return { kind: 'image', src, alt: 'Notebook output' };
    }
  }
  if ('image/svg+xml' in data) {
    const src = svgDataUrl(data['image/svg+xml']);
    if (src) return { kind: 'image', src, alt: 'Notebook output' };
  }
  const plain = 'text/plain' in data ? joinText(data['text/plain']) : null;
  if ('text/html' in data) {
    const html = joinText(data['text/html']);
    if (html.trim() && !HAS_ACTIVE_HTML.test(html)) {
      const c = clip(html, MAX_OUTPUT_CHARS * 2);
      if (c.cut) notes.cut = true;
      // A cut table would be broken markup; fall back to the text version when there is one.
      if (!c.cut || plain === null) return { kind: 'html', html: cleanOutputHtml(c.text) };
    }
  }
  if ('text/markdown' in data) {
    const md = clip(joinText(data['text/markdown']), MAX_OUTPUT_CHARS);
    if (md.cut) notes.cut = true;
    if (md.text.trim()) return { kind: 'markdown', text: md.text };
  }
  const latex = 'text/latex' in data ? joinText(data['text/latex']) : null;
  const text = plain ?? latex;
  if (text !== null && text !== '') {
    const c = clip(settleCarriageReturns(stripAnsi(text)), MAX_OUTPUT_CHARS);
    if (c.cut) notes.cut = true;
    return { kind: 'text', text: c.text, stream: kind === 'result' ? 'result' : 'stdout' };
  }
  const mimeTypes = Object.keys(data).filter((m) => m !== 'text/plain');
  return mimeTypes.length > 0 ? { kind: 'unsupported', mimeTypes: mimeTypes.slice(0, 5) } : null;
}

function normalizeOutput(raw: unknown, notes: { cut: boolean }): NotebookOutput | null {
  if (!isObject(raw)) return null;
  const type = raw.output_type;

  if (type === 'stream') {
    const name = raw.name === 'stderr' ? 'stderr' : 'stdout';
    const c = clip(settleCarriageReturns(stripAnsi(joinText(raw.text))), MAX_OUTPUT_CHARS);
    if (c.cut) notes.cut = true;
    return c.text === '' ? null : { kind: 'text', text: c.text, stream: name };
  }
  if (type === 'execute_result' || type === 'display_data' || type === 'pyout') {
    // nbformat 3 puts the formats beside the type instead of inside "data".
    let data: Json | null = isObject(raw.data) ? raw.data : null;
    if (!data && type === 'pyout') {
      data = {};
      if ('text' in raw) data['text/plain'] = raw.text;
      if ('html' in raw) data['text/html'] = raw.html;
      if ('png' in raw) data['image/png'] = raw.png;
      if ('jpeg' in raw) data['image/jpeg'] = raw.jpeg;
    }
    return data ? outputFromBundle(data, type === 'display_data' ? 'display' : 'result', notes) : null;
  }
  if (type === 'error' || type === 'pyerr') {
    // Unlike other text, a traceback is a list of lines that carry no line endings of their own.
    const lines = Array.isArray(raw.traceback) ? raw.traceback.filter((l): l is string => typeof l === 'string').join('\n') : joinText(raw.traceback);
    const traceback = clip(stripAnsi(lines), MAX_OUTPUT_CHARS);
    if (traceback.cut) notes.cut = true;
    return {
      kind: 'error',
      name: String(raw.ename ?? 'Error').slice(0, 200),
      message: stripAnsi(String(raw.evalue ?? '')).slice(0, 2000),
      traceback: traceback.text,
    };
  }
  return null;
}

/** Images pasted into markdown cells ("attachment:name.png"). */
function normalizeAttachments(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!isObject(raw)) return out;
  for (const [name, bundle] of Object.entries(raw)) {
    if (!isObject(bundle)) continue;
    for (const [mime, data] of Object.entries(bundle)) {
      const src = imageDataUrl(mime, data);
      if (src) {
        out[name] = src;
        break;
      }
    }
  }
  return out;
}

function normalizeCell(raw: unknown, notes: { cut: boolean }): NotebookCell | null {
  if (!isObject(raw)) return null;
  // nbformat 3 calls code "input" and headings a separate cell type.
  const rawSource = raw.source ?? raw.input ?? '';
  const sourceClip = clip(joinText(rawSource), MAX_SOURCE_CHARS);
  if (sourceClip.cut) notes.cut = true;
  const source = sourceClip.text;

  switch (raw.cell_type) {
    case 'markdown':
      return { kind: 'markdown', source, attachments: normalizeAttachments(raw.attachments) };
    case 'heading': {
      const level = Math.min(6, Math.max(1, Number(raw.level) || 1));
      return { kind: 'markdown', source: `${'#'.repeat(level)} ${source}`, attachments: {} };
    }
    case 'code': {
      const count = raw.execution_count ?? raw.prompt_number;
      const outputs = Array.isArray(raw.outputs)
        ? raw.outputs.map((o) => normalizeOutput(o, notes)).filter((o): o is NotebookOutput => o !== null)
        : [];
      return {
        kind: 'code',
        source,
        executionCount: typeof count === 'number' && Number.isFinite(count) ? count : null,
        outputs,
      };
    }
    case 'raw':
      return { kind: 'raw', source };
    default:
      return null;
  }
}

export function parseNotebook(text: string): ParseResult {
  const trimmed = text.replace(/^﻿/, '').trim();
  if (!trimmed) return { ok: false, reason: 'empty' };

  let json: unknown;
  try {
    json = JSON.parse(trimmed);
  } catch {
    return { ok: false, reason: 'notJson' };
  }
  if (!isObject(json)) return { ok: false, reason: 'notNotebook' };

  const nbformat = Number(json.nbformat);
  if (!Number.isFinite(nbformat)) return { ok: false, reason: 'notNotebook' };
  if (nbformat > 4) return { ok: false, reason: 'tooNew' };

  let rawCells: unknown = json.cells;
  if (nbformat < 4) {
    const sheets = json.worksheets;
    rawCells = Array.isArray(sheets) && isObject(sheets[0]) ? sheets[0].cells : [];
  }
  if (!Array.isArray(rawCells)) return { ok: false, reason: 'notNotebook' };

  const notes = { cut: rawCells.length > MAX_CELLS };
  const cells = rawCells
    .slice(0, MAX_CELLS)
    .map((c) => normalizeCell(c, notes))
    .filter((c): c is NotebookCell => c !== null);

  const metadata = isObject(json.metadata) ? json.metadata : {};
  const kernelspec = isObject(metadata.kernelspec) ? metadata.kernelspec : {};
  const languageInfo = isObject(metadata.language_info) ? metadata.language_info : {};
  const language = String(languageInfo.name ?? kernelspec.language ?? 'python').toLowerCase().slice(0, 40);
  const kernelName = kernelspec.display_name ?? kernelspec.name;

  const counts = { markdown: 0, code: 0, raw: 0, outputs: 0 };
  for (const cell of cells) {
    counts[cell.kind] += 1;
    if (cell.kind === 'code') counts.outputs += cell.outputs.length;
  }

  return {
    ok: true,
    notebook: {
      cells,
      language,
      kernel: typeof kernelName === 'string' ? kernelName.slice(0, 80) : null,
      nbformat,
      counts,
      truncated: notes.cut,
    },
  };
}

/** Whether a file name is a notebook, judged from its extension only. */
export function isNotebookFile(fileName: string): boolean {
  return /\.ipynb$/i.test(fileName);
}
