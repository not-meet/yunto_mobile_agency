import { splitSentences } from '@/components/content/scriptMarks';

// Ported from the web's lib/script-assist.ts: the AI assistant's rewrites (a new hook, shorter,
// a CTA, a Reel structure…), made on the phone from the script itself. `attempt` picks a
// different variant for "Try another".

export type Intent =
  | 'hook'
  | 'conversational'
  | 'variations'
  | 'reel'
  | 'cta'
  | 'improve'
  | 'engaging'
  | 'generate-hook'
  | 'expand'
  | 'shorter'
  | 'cut20';

export const PROMPT_INTENT: Record<string, Intent> = {
  'Improve this hook': 'hook',
  'Make it more conversational': 'conversational',
  'Give me 3 variations': 'variations',
  'Make this suitable for an Instagram Reel': 'reel',
  'Add a stronger CTA': 'cta',
  'Improve idea': 'improve',
  'Make more engaging': 'engaging',
  'Generate hook': 'generate-hook',
  'Expand idea': 'expand',
  'Make it shorter': 'shorter',
  'Punch up the hook': 'hook',
  'Cut 20%': 'cut20',
  'Add a CTA': 'cta',
};

export function intentFor(text: string): Intent | null {
  const t = text.toLowerCase();
  const exact = Object.entries(PROMPT_INTENT).find(([k]) => k.toLowerCase() === t.trim());
  if (exact) return exact[1];
  if (/variation|options|alternat/.test(t)) return 'variations';
  if (/\bhook\b|opening|first line/.test(t)) return 'hook';
  if (/cta|call to action/.test(t)) return 'cta';
  if (/conversation|casual|friendly|natural/.test(t)) return 'conversational';
  if (/reel|instagram|short|vertical|tiktok/.test(t)) return 'reel';
  if (/shorter|tighten|trim|concise|cut/.test(t)) return /20/.test(t) ? 'cut20' : 'shorter';
  if (/expand|longer|more detail|elaborate/.test(t)) return 'expand';
  if (/engag|punch|exciting|energy/.test(t)) return 'engaging';
  if (/improve|better|polish|rewrite/.test(t)) return 'improve';
  return null;
}

const FILLER =
  /\b(really|very|just|actually|basically|literally|kind of|sort of|quite|simply|in order to)\s+/gi;
const CONTRACT: [RegExp, string][] = [
  [/\bdo not\b/gi, 'don’t'],
  [/\bdoes not\b/gi, 'doesn’t'],
  [/\bcannot\b/gi, 'can’t'],
  [/\bwill not\b/gi, 'won’t'],
  [/\bit is\b/gi, 'it’s'],
  [/\bthat is\b/gi, 'that’s'],
  [/\byou are\b/gi, 'you’re'],
  [/\bwe are\b/gi, 'we’re'],
  [/\bi am\b/gi, 'I’m'],
  [/\bthey are\b/gi, 'they’re'],
  [/\bthere is\b/gi, 'there’s'],
  [/\bhere is\b/gi, 'here’s'],
];
const CTA_RE =
  /\b(comment|follow|save|share|subscribe|dm|link in bio|tap|click|sign up|tag a friend)\b/i;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const trimEnd = (s: string) => s.replace(/[.!?\s]+$/, '');
const core = (s: string) =>
  trimEnd(s)
    .replace(/["“”]/g, '')
    .replace(/^(so|well|okay|ok|hey|now)[,\s]+/i, '')
    .trim();
const lower1 = (s: string) => (/^[A-Z][a-z]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const pick = (list: string[], n: number) =>
  list[((n % list.length) + list.length) % list.length] ?? '';

function ctaFor(platform: string, n: number) {
  const p = platform.toLowerCase();
  if (p.includes('youtube'))
    return pick(
      [
        'Subscribe so you don’t miss the next one — and tell me in the comments what I should try.',
        'Hit subscribe, then drop your pick for the next episode below.',
      ],
      n,
    );
  if (p.includes('linkedin'))
    return pick(
      [
        'Follow for the next one, and share this with someone who needs it.',
        'Repost this if it helped — and tell me what you’d add.',
      ],
      n,
    );
  return pick(
    [
      'Comment "list" and I’ll send you the full breakdown.',
      'Save this for later and send it to the friend who needs it.',
      'Follow for part two — it drops this week.',
      'Tell me in the comments: would you try this?',
    ],
    n,
  );
}

function hookVariants(first: string) {
  const short = core(first).split(/\s+/).slice(0, 14).join(' ');
  return [
    `Nobody tells you this: ${lower1(short)}.`,
    `What if ${lower1(short)}?`,
    `I tried it so you don’t have to — ${lower1(short)}.`,
    `Stop scrolling. ${cap(short)}.`,
    `3 seconds, one question: ${lower1(short)}?`,
    `This changed how I see it — ${lower1(short)}.`,
  ];
}

const tighten = (text: string) =>
  text
    .replace(FILLER, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

function cutTo(sentences: string[], ratio: number) {
  const total = sentences.join(' ').split(/\s+/).length;
  const target = Math.max(8, Math.round(total * ratio));
  const scored = sentences.map((s, i) => ({
    i,
    words: s.split(/\s+/).length,
    score:
      (i === 0 ? 100 : 0) +
      (i === sentences.length - 1 ? 50 : 0) +
      (s.match(/\d|%|₹|\?|!/g)?.length ?? 0) * 3 -
      s.split(/\s+/).length / 10,
  }));
  const keep = new Set<number>();
  let words = 0;
  for (const r of [...scored].sort((a, b) => b.score - a.score)) {
    if (words + r.words > target && keep.size > 0) continue;
    keep.add(r.i);
    words += r.words;
  }
  return sentences
    .filter((_, i) => keep.has(i))
    .map(tighten)
    .join(' ');
}

export function assist(
  intent: Intent,
  script: string,
  platform: string,
  attempt: number,
): { text: string; note: string } {
  const s = splitSentences(script);
  const [first = '', ...rest] = s;
  const body = rest.join(' ');
  const last = rest[rest.length - 1] ?? '';
  const hasCta = CTA_RE.test(last);

  switch (intent) {
    case 'hook':
    case 'generate-hook': {
      const h = pick(hookVariants(first), attempt);
      return {
        text: [h, intent === 'generate-hook' ? script : body].filter(Boolean).join(' '),
        note: intent === 'generate-hook' ? 'New hook' : 'Hook tightened',
      };
    }
    case 'variations': {
      const v = hookVariants(first);
      const set = [0, 1, 2].map((k) => pick(v, attempt * 3 + k));
      return {
        text: set
          .map((h, i) => `Variation ${i + 1}\n${[h, body].filter(Boolean).join(' ')}`)
          .join('\n\n'),
        note: '3 variations',
      };
    }
    case 'conversational': {
      let t = script;
      for (const [re, to] of CONTRACT) {
        t = t.replace(re, (m) => (m[0] === m[0]?.toUpperCase() ? cap(to) : to));
      }
      t = tighten(t);
      const opener = pick(
        ['Okay, real talk — ', 'So here’s the thing: ', 'Can I be honest? ', 'Quick one — '],
        attempt,
      );
      return { text: `${opener}${lower1(t)}`, note: 'More conversational' };
    }
    case 'reel': {
      const beats = cutTo(
        rest.filter((x) => x !== last || !hasCta),
        0.7,
      );
      const beatList = splitSentences(beats).slice(0, 4);
      return {
        text: [
          `HOOK (0–3s): ${pick(hookVariants(first), attempt)}`,
          `ON-SCREEN TEXT: ${core(first).split(/\s+/).slice(0, 6).join(' ')}`,
          beatList.length ? `BEATS:\n${beatList.map((b, i) => `${i + 1}. ${b}`).join('\n')}` : null,
          `CTA: ${hasCta ? last : ctaFor(platform || 'Instagram Reel', attempt)}`,
        ]
          .filter(Boolean)
          .join('\n\n'),
        note: 'Reel structure',
      };
    }
    case 'cta': {
      const base = hasCta ? s.slice(0, -1).join(' ') : script.trim();
      return { text: `${base} ${ctaFor(platform, attempt)}`.trim(), note: 'Stronger CTA' };
    }
    case 'improve':
    case 'engaging': {
      const h = pick(hookVariants(first), attempt);
      const mid = tighten(body || first);
      const q = pick(
        ['Would you try it?', 'Which one would you pick?', 'Be honest — have you done this?'],
        attempt,
      );
      return {
        text: [h, mid, q, hasCta ? '' : ctaFor(platform, attempt)].filter(Boolean).join(' '),
        note: intent === 'improve' ? 'Idea improved' : 'More engaging',
      };
    }
    case 'expand': {
      const add =
        attempt % 2 === 0
          ? [
              'Here’s why it works: it’s quick to film, easy to repeat, and the payoff lands in seconds.',
              'The best part? Anyone watching can try it tonight.',
            ]
          : [
              'Think of it as a series, not a one-off — every episode sets up the next.',
              'Keep the format fixed so viewers know exactly what they’re getting.',
            ];
      return { text: [first, ...add, body].filter(Boolean).join(' '), note: 'Idea expanded' };
    }
    case 'shorter':
      return { text: cutTo(s, 0.6), note: 'Shortened' };
    case 'cut20':
      return { text: cutTo(s, 0.8), note: 'Cut 20%' };
  }
}
