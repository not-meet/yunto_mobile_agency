// Ported from the web's lib/content-extras-shared.ts: reading a script for its hook, the
// lines worth posting and the call to action (Analyze), and topic ideas from its words. All on
// the phone, no server call.

export interface Marked {
  hook: string;
  highlights: string[];
  cta: string | null;
  suggestedCta: string | null;
  parts: { text: string; tag: 'hook' | 'highlight' | 'cta' | null }[];
}

const CTA_RE =
  /\b(comment|follow|save|share|subscribe|dm|link in bio|tap|click|sign up|download|shop|tag a friend|drop a)\b/i;
const PUNCH_RE =
  /(\d|%|₹|\?|!|"|“|—|\bbut\b|\bwhile\b|\beven\b|\bnever\b|\bevery\b|\bonly\b|\bsecret\b|\bmistake\b|\bwhy\b|\bhow\b)/gi;

export function splitSentences(text: string): string[] {
  return (
    text
      .replace(/\s+/g, ' ')
      .trim()
      .match(/[^.!?]+[.!?]+["”')]*|[^.!?]+$/g) ?? []
  )
    .map((s) => s.trim())
    .filter(Boolean);
}

export function markScript(text: string, platformLabel: string): Marked | null {
  const s = splitSentences(text);
  const first = s[0];
  if (first === undefined) return null;
  const hookEnd = first.split(/\s+/).length < 10 && s[1] ? 2 : 1;
  const hook = s.slice(0, hookEnd).join(' ');
  const rest = s.slice(hookEnd);
  const ctaIdx = rest.findIndex((x) => CTA_RE.test(x));
  const cta = ctaIdx >= 0 ? (rest[ctaIdx] ?? null) : null;
  const scored = rest
    .map((x, i) => ({
      i,
      score: (x.match(PUNCH_RE)?.length ?? 0) + Math.min(3, x.split(/\s+/).length / 12),
    }))
    .filter((r) => r.i !== ctaIdx);
  const top = new Set(
    [...scored]
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(2, scored.length))
      .map((r) => r.i),
  );
  const highlights = rest.filter((_, i) => top.has(i));
  const parts: Marked['parts'] = [
    { text: hook, tag: 'hook' },
    ...rest.map((x, i) => ({
      text: x,
      tag: i === ctaIdx ? ('cta' as const) : top.has(i) ? ('highlight' as const) : null,
    })),
  ];
  const lower = platformLabel.toLowerCase();
  const suggestedCta = cta
    ? null
    : lower.includes('youtube')
      ? 'Subscribe for the next one — and tell me in the comments what to try.'
      : lower.includes('linkedin')
        ? 'Follow for the next one, and share this with someone who needs it.'
        : 'Comment "list" and I’ll send you the full breakdown.';
  return { hook, highlights, cta, suggestedCta, parts };
}

const STOP = new Set(
  'the a an and or but of to in on for with is are was were be it this that you your i my we our they their at by from as so if then than just like into about over up out what when who how why can will not do does did have has had get got make made one all more most very really also its it’s i’m you’re'.split(
    ' ',
  ),
);

export function suggestTopics(text: string, existing: string[], n = 4): string[] {
  const have = new Set(existing.map((t) => t.replace(/^#/, '').toLowerCase()));
  const counts = new Map<string, number>();
  for (const w of text.toLowerCase().match(/[a-z][a-z0-9]{3,}/g) ?? []) {
    if (STOP.has(w) || have.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([w]) => `#${w}`);
}

// "just now", "5m ago", "3h ago", "2d ago".
export function ago(iso: string, now: number): string {
  const m = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
