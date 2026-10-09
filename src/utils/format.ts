// Display formatting shared across screens.

const LAKH = 100_000;
const CRORE = 100 * LAKH;

const trim = (n: number) => String(Number(n.toFixed(2)));

// ₹ amounts the Indian way, kept short for cards: ₹950, ₹42.8k, ₹1.25L, ₹2.1Cr.
export function formatInr(amount: number): string {
  if (amount >= CRORE) return `₹${trim(amount / CRORE)}Cr`;
  if (amount >= LAKH) return `₹${trim(amount / LAKH)}L`;
  if (amount >= 1000) return `₹${trim(amount / 1000)}k`;
  return `₹${Math.round(amount)}`;
}

// Counts kept short for stats: 950, 42.8K, 1.2M.
export function formatCount(value: number): string {
  const short = (n: number) => String(Number(n.toFixed(1)));
  if (value >= 1_000_000) return `${short(value / 1_000_000)}M`;
  if (value >= 1000) return `${short(value / 1000)}K`;
  return String(Math.round(value));
}

// "Just now", "2h ago", "Yesterday", or a date for anything older.
export function formatRelativeTime(iso: string, now = Date.now()): string {
  const hours = Math.floor((now - new Date(iso).getTime()) / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return 'Yesterday';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// Full number with Indian digit grouping: 125000 → "1,25,000".
export function groupDigits(value: number): string {
  return value.toLocaleString('en-IN');
}
