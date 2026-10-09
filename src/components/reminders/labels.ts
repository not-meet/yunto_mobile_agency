import type { Reminder, ReminderPriority } from '@/services/reminderService';
import { daysFromToday, fromDateKey } from '@/utils/dates';

// Priority hues, list filters and date wording for the reminders screens.

// Selected chips and cards share these washes.
export const GREEN_GRADIENT =
  'linear-gradient(110deg, rgba(200, 240, 215, 0.9) 0%, rgba(180, 230, 200, 0.9) 100%)';
export const GREEN_SHADOW =
  '0px 8px 24px rgba(180, 230, 200, 0.4), inset 0px 2px 4px 1px rgba(255, 255, 255, 0.8)';

export const GLASS_SHADOW =
  '0px 16px 40px rgba(30, 20, 50, 0.04), inset 0px 1px 2px 1px rgba(255, 255, 255, 0.9)';

interface PriorityStyle {
  label: string;
  gradient: string;
  shadow: string;
  // Text on the gradient.
  color: string;
}

export const PRIORITY_STYLES: Record<ReminderPriority, PriorityStyle> = {
  low: {
    label: 'Low',
    gradient: GREEN_GRADIENT,
    shadow: '0px 4px 12px rgba(180, 230, 200, 0.4)',
    color: '#1F4D33',
  },
  medium: {
    label: 'Medium',
    gradient:
      'linear-gradient(117.9deg, rgba(255, 235, 210, 0.9) 0%, rgba(255, 210, 160, 0.9) 100%)',
    shadow: '0px 4px 12px rgba(255, 210, 160, 0.5)',
    color: '#884400',
  },
  high: {
    label: 'High',
    gradient:
      'linear-gradient(115.62deg, rgba(255, 220, 215, 0.8) 0%, rgba(255, 200, 195, 0.8) 100%)',
    shadow: '0px 4px 12px rgba(255, 200, 195, 0.3)',
    color: '#993333',
  },
};

export const PRIORITIES = Object.keys(PRIORITY_STYLES) as ReminderPriority[];

export type ReminderFilter = 'today' | 'upcoming' | 'all';

export const FILTERS: { key: ReminderFilter; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'all', label: 'All' },
];

// Anything overdue still counts as today's.
export function matchesFilter(reminder: Reminder, filter: ReminderFilter): boolean {
  if (filter === 'all') return true;
  const days = daysFromToday(fromDateKey(reminder.dueDate));
  return filter === 'today' ? days <= 0 : days > 0;
}

// "14:30" → "2:30 PM".
export function timeLabel(time: string): string {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  const suffix = hours < 12 ? 'AM' : 'PM';
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

// "Sep 28".
export function monthDay(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// "MON".
export function weekdayCaps(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
}
