// Ported from the web's lib/content-extras-shared.ts: splitting a script into sentences and
// topic ideas from its words. All on the phone, no server call.

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
