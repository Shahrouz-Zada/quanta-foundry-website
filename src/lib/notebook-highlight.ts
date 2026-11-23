// Light syntax colouring for code cells. Python only (the language of this
// course); other languages are shown as plain text. It cuts the text into
// pieces and never changes it: joining every piece gives back the input.

export type TokenKind = 'plain' | 'keyword' | 'string' | 'comment' | 'number' | 'constant' | 'decorator' | 'magic';
export interface Token {
  text: string;
  kind: TokenKind;
}

const KEYWORDS = new Set([
  'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
  'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass',
  'raise', 'return', 'try', 'while', 'with', 'yield', 'match', 'case',
]);
const CONSTANTS = new Set(['True', 'False', 'None']);

// One alternation, tried in order at each position, so the scan is linear.
const PATTERN = new RegExp(
  [
    '(?<magic>^[ \\t]*[%!][^\\n]*)', // %matplotlib inline, !pip install …
    '(?<comment>#[^\\n]*)',
    // A triple-quoted string runs to its closing quotes, or to the end of the text when it never closes.
    '(?<tstring>[rRbBuUfF]{0,2}(?:"""[\\s\\S]*?(?:"""|(?![\\s\\S]))|\'\'\'[\\s\\S]*?(?:\'\'\'|(?![\\s\\S]))))',
    '(?<string>[rRbBuUfF]{0,2}(?:"(?:\\\\.|[^"\\\\\\n])*"?|\'(?:\\\\.|[^\'\\\\\\n])*\'?))',
    '(?<decorator>^[ \\t]*@[A-Za-z_][\\w.]*)',
    // No trailing word-boundary check on purpose: it makes a very long run of digits take quadratic time.
    '(?<number>(?<![\\w.])(?:0[xX][0-9a-fA-F_]+|\\d[\\d_]*(?:\\.[\\d_]*)?(?:[eE][+-]?\\d+)?j?)|(?<!\\w)\\.\\d[\\d_]*(?:[eE][+-]?\\d+)?)',
    '(?<word>[A-Za-z_][A-Za-z0-9_]*)',
  ].join('|'),
  'gm',
);

export function highlightPython(code: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  const push = (text: string, kind: TokenKind) => {
    if (!text) return;
    const prev = tokens[tokens.length - 1];
    if (prev && prev.kind === kind) prev.text += text;
    else tokens.push({ text, kind });
  };

  PATTERN.lastIndex = 0;
  for (let m = PATTERN.exec(code); m !== null; m = PATTERN.exec(code)) {
    if (m[0] === '') {
      PATTERN.lastIndex++;
      continue;
    }
    push(code.slice(last, m.index), 'plain');
    const g = m.groups ?? {};
    if (g.magic !== undefined) push(m[0], 'magic');
    else if (g.comment !== undefined) push(m[0], 'comment');
    else if (g.tstring !== undefined || g.string !== undefined) push(m[0], 'string');
    else if (g.decorator !== undefined) push(m[0], 'decorator');
    else if (g.number !== undefined) push(m[0], 'number');
    else if (KEYWORDS.has(m[0])) push(m[0], 'keyword');
    else if (CONSTANTS.has(m[0])) push(m[0], 'constant');
    else push(m[0], 'plain');
    last = m.index + m[0].length;
  }
  push(code.slice(last), 'plain');
  return tokens;
}
