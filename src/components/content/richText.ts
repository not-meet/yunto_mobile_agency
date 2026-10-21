// Text styles for a caption that stays plain text, so it pastes into Instagram, YouTube or
// LinkedIn as it looks here: bold and italic use the Unicode sans-serif letter forms (𝗯𝗼𝗹𝗱, 𝘪𝘵𝘢𝘭𝘪𝘤),
// underline and strikethrough a combining mark after each character, and lists a "• " or "1. "
// at the start of each line. Every function takes the text and a selection (UTF-16 offsets, as a
// TextInput reports them) and returns the new text with the selection to restore.

export type InlineStyle = 'bold' | 'italic' | 'underline' | 'strike';
export type ListStyle = 'bullet' | 'numbered';

export interface Selection {
  start: number;
  end: number;
}

export interface Edit {
  text: string;
  selection: Selection;
}

const UNDERLINE = '̲';
const STRIKE = '̶';

// First code point of each sans-serif run (Mathematical Alphanumeric Symbols).
const BOLD_UPPER = 0x1d5d4;
const BOLD_LOWER = 0x1d5ee;
const ITALIC_UPPER = 0x1d608;
const ITALIC_LOWER = 0x1d622;
const BOLD_ITALIC_UPPER = 0x1d63c;
const BOLD_ITALIC_LOWER = 0x1d656;
const BOLD_DIGIT = 0x1d7ec;

// One visible character: its plain form, its styles, and any combining marks it carried that
// aren't ours (kept as they were).
interface Cell {
  base: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  otherMarks: string;
  // UTF-16 offsets of the cell in the source text.
  from: number;
  to: number;
}

function decodeLetter(cp: number): { base: string; bold: boolean; italic: boolean } | null {
  const runs: [number, number, number, boolean, boolean][] = [
    [BOLD_UPPER, 26, 65, true, false],
    [BOLD_LOWER, 26, 97, true, false],
    [ITALIC_UPPER, 26, 65, false, true],
    [ITALIC_LOWER, 26, 97, false, true],
    [BOLD_ITALIC_UPPER, 26, 65, true, true],
    [BOLD_ITALIC_LOWER, 26, 97, true, true],
    [BOLD_DIGIT, 10, 48, true, false],
  ];
  for (const [first, length, ascii, bold, italic] of runs) {
    if (cp >= first && cp < first + length) {
      return { base: String.fromCharCode(ascii + cp - first), bold, italic };
    }
  }
  return null;
}

const isLetter = (base: string) => /^[A-Za-z]$/.test(base);
const isDigit = (base: string) => /^[0-9]$/.test(base);

// Whether `style` can be put on the cell: bold on letters and digits, italic on letters only (there
// are no italic digits), the marks on anything but a line break.
function canStyle(cell: Cell, style: InlineStyle): boolean {
  if (style === 'bold') return isLetter(cell.base) || isDigit(cell.base);
  if (style === 'italic') return isLetter(cell.base);
  return cell.base !== '\n';
}

function encode(cell: Cell): string {
  let letter = cell.base;
  const code = cell.base.charCodeAt(0);
  if (isLetter(cell.base) && (cell.bold || cell.italic)) {
    const upper = code < 97;
    const first =
      cell.bold && cell.italic
        ? upper
          ? BOLD_ITALIC_UPPER
          : BOLD_ITALIC_LOWER
        : cell.bold
          ? upper
            ? BOLD_UPPER
            : BOLD_LOWER
          : upper
            ? ITALIC_UPPER
            : ITALIC_LOWER;
    letter = String.fromCodePoint(first + code - (upper ? 65 : 97));
  } else if (isDigit(cell.base) && cell.bold) {
    letter = String.fromCodePoint(BOLD_DIGIT + code - 48);
  }
  return letter + cell.otherMarks + (cell.underline ? UNDERLINE : '') + (cell.strike ? STRIKE : '');
}

function parse(text: string): Cell[] {
  const cells: Cell[] = [];
  let offset = 0;
  for (const char of text) {
    const cp = char.codePointAt(0) ?? 0;
    const last = cells[cells.length - 1];
    const isMark = cp >= 0x0300 && cp <= 0x036f;
    if (isMark && last && last.base !== '\n') {
      if (char === UNDERLINE) last.underline = true;
      else if (char === STRIKE) last.strike = true;
      else last.otherMarks += char;
      last.to += char.length;
    } else {
      const letter = decodeLetter(cp);
      cells.push({
        base: letter?.base ?? char,
        bold: letter?.bold ?? false,
        italic: letter?.italic ?? false,
        underline: false,
        strike: false,
        otherMarks: '',
        from: offset,
        to: offset + char.length,
      });
    }
    offset += char.length;
  }
  return cells;
}

// The cells the selection touches. A collapsed selection touches none.
function selectedRange(cells: Cell[], { start, end }: Selection): [number, number] {
  if (start >= end) return [0, 0];
  const first = cells.findIndex((c) => c.to > start);
  if (first === -1) return [0, 0];
  let last = first;
  while (last < cells.length && (cells[last]?.from ?? end) < end) last++;
  return [first, last];
}

function hasStyle(cell: Cell, style: InlineStyle): boolean {
  return cell[style];
}

// Whether every styleable character in the selection already has `style` (false when it has
// none).
export function selectionHas(text: string, selection: Selection, style: InlineStyle): boolean {
  const cells = parse(text);
  const [first, last] = selectedRange(cells, selection);
  const styleable = cells.slice(first, last).filter((c) => canStyle(c, style));
  return styleable.length > 0 && styleable.every((c) => hasStyle(c, style));
}

// Turns `style` off on the selection if it's all already styled, else on, and keeps the same
// characters selected.
export function toggleInline(text: string, selection: Selection, style: InlineStyle): Edit {
  const cells = parse(text);
  const [first, last] = selectedRange(cells, selection);
  if (first === last) return { text, selection };
  const on = !selectionHas(text, selection, style);
  for (const cell of cells.slice(first, last)) {
    if (canStyle(cell, style)) cell[style] = on;
  }
  const before = cells.slice(0, first).map(encode).join('');
  const middle = cells.slice(first, last).map(encode).join('');
  const after = cells.slice(last).map(encode).join('');
  return {
    text: before + middle + after,
    selection: { start: before.length, end: before.length + middle.length },
  };
}

// Styles freshly typed text with the styles switched on while nothing was selected.
export function styleTyped(typed: string, styles: ReadonlySet<InlineStyle>): string {
  if (styles.size === 0) return typed;
  return parse(typed)
    .map((cell) => {
      for (const style of styles) if (canStyle(cell, style)) cell[style] = true;
      return encode(cell);
    })
    .join('');
}

// Whether the UTF-16 unit at `i` continues the character before it: the low half of a surrogate
// pair, or a combining mark.
const continues = (text: string, i: number) => /[\uDC00-\uDFFF̀-ͯ]/.test(text[i] ?? '');

// The part of `next` that differs from `prev`, widened to whole characters with their marks, or
// null when nothing was added (a deletion). Keyboards don't only append: while composing a word
// they rewrite it, which can drop or move the marks styled onto the letters typed so far, so the
// whole rewritten stretch comes back here to be styled again.
export function typedSpan(prev: string, next: string): { at: number; text: string } | null {
  let start = 0;
  while (start < prev.length && start < next.length && prev[start] === next[start]) start++;
  let tail = 0;
  while (
    tail < Math.min(prev.length, next.length) - start &&
    prev[prev.length - 1 - tail] === next[next.length - 1 - tail]
  ) {
    tail++;
  }
  while (start > 0 && (continues(prev, start) || continues(next, start))) start--;
  while (tail > 0 && (continues(prev, prev.length - tail) || continues(next, next.length - tail))) {
    tail--;
  }
  if (start >= next.length - tail) return null;
  return { at: start, text: next.slice(start, next.length - tail) };
}

// The text with each character's marks in one order and none doubled up.
export function normalize(text: string): string {
  return parse(text).map(encode).join('');
}

// Lists.

const BULLET = '• ';
const NUMBERED = /^\d+\. /;

function lineStart(text: string, at: number) {
  return at <= 0 ? 0 : text.lastIndexOf('\n', at - 1) + 1;
}

function lineEnd(text: string, at: number) {
  const end = text.indexOf('\n', at);
  return end === -1 ? text.length : end;
}

function listOf(line: string): ListStyle | null {
  if (line.startsWith(BULLET)) return 'bullet';
  if (NUMBERED.test(line)) return 'numbered';
  return null;
}

const stripList = (line: string) =>
  line.startsWith(BULLET) ? line.slice(BULLET.length) : line.replace(NUMBERED, '');

// The list the cursor's line is in, if any.
export function lineList(text: string, selection: Selection): ListStyle | null {
  const from = lineStart(text, selection.start);
  return listOf(text.slice(from, lineEnd(text, from)));
}

// Makes every line the selection touches a bullet (or numbered) item, or, when they all already
// are, plain lines again. Blank lines are left as they are.
export function toggleList(text: string, selection: Selection, list: ListStyle): Edit {
  const from = lineStart(text, selection.start);
  const to = lineEnd(text, Math.max(selection.start, selection.end));
  const lines = text.slice(from, to).split('\n');
  const filled = lines.filter((line) => line.trim() !== '' || lines.length === 1);
  const off = filled.every((line) => listOf(line) === list);
  let n = 0;
  const block = lines
    .map((line) => {
      if (line.trim() === '' && lines.length > 1) return line;
      const plain = stripList(line);
      if (off) return plain;
      n++;
      return `${list === 'bullet' ? BULLET : `${n}. `}${plain}`;
    })
    .join('\n');
  const collapsed = selection.start === selection.end;
  return {
    text: text.slice(0, from) + block + text.slice(to),
    selection: collapsed
      ? { start: from + block.length, end: from + block.length }
      : { start: from, end: from + block.length },
  };
}

// After a line break typed at `at`: carries the list on to the new line ("• ", or the next
// number), or, when the line it ended was an empty item, ends the list there instead.
export function continueList(text: string, at: number): Edit | null {
  if (text[at] !== '\n') return null;
  const from = lineStart(text, at);
  const line = text.slice(from, at);
  const list = listOf(line);
  if (!list) return null;
  if (stripList(line).trim() === '') {
    // An empty item: drop it and the break, leaving a plain line.
    const next = text.slice(0, from) + text.slice(at + 1);
    return { text: next, selection: { start: from, end: from } };
  }
  const prefix = list === 'bullet' ? BULLET : `${Number.parseInt(line, 10) + 1}. `;
  const next = text.slice(0, at + 1) + prefix + text.slice(at + 1);
  const cursor = at + 1 + prefix.length;
  return { text: next, selection: { start: cursor, end: cursor } };
}
