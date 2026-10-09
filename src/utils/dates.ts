// Calendar-day helpers. The display helpers work in the device's local time zone, but the
// server keys every date-only field to Asia/Kolkata, so "today" for anything sent to or compared
// with the server comes from todayKey()/todayDate() (IST).

const DAY_MS = 24 * 60 * 60 * 1000;

// IST is a fixed UTC+05:30 (no daylight saving).
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

const istNow = () => new Date(Date.now() + IST_OFFSET_MS);

// Today's date in IST as "YYYY-MM-DD", whatever the device's time zone.
export function todayKey(): string {
  return istNow().toISOString().slice(0, 10);
}

// Today's IST date as local midnight, for building day strips and picker bounds whose keys go
// to the server (toDateKey(addDays(todayDate(), n)) stays on IST days).
export function todayDate(): Date {
  return fromDateKey(todayKey());
}

// The current hour (0-23) in IST.
export function istHour(): number {
  return istNow().getUTCHours();
}

// Local calendar day as "YYYY-MM-DD" (toISOString would shift it to UTC).
export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// "2026-06-19" → local midnight on that day.
export function fromDateKey(key: string): Date {
  const [year = 0, month = 1, day = 1] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

// Whole calendar days from today to `date`: 0 today, 1 tomorrow, -1 yesterday.
export function daysFromToday(date: Date): number {
  const start = (d: Date) => new Date(d).setHours(0, 0, 0, 0);
  return Math.round((start(date) - start(new Date())) / DAY_MS);
}

// "Thu, Jun 19".
export function shortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// "Today", "Yesterday", "Tomorrow", else "Thu, Jun 19".
export function dayLabel(date: Date): string {
  const days = daysFromToday(date);
  if (days === 0) return 'Today';
  if (days === -1) return 'Yesterday';
  if (days === 1) return 'Tomorrow';
  return shortDate(date);
}

// "10:00 am".
export function timeLabel(date: Date): string {
  return date
    .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    .toLowerCase();
}

// "20 Jun".
export function dayMonth(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// "Thursday, 20 Jun 2026".
export function longDate(date: Date): string {
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
  return `${weekday}, ${dayMonth(date)} ${date.getFullYear()}`;
}

// "Mar 24, 2026".
export function mediumDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
