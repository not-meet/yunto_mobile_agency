import { addDays, toDateKey } from '@/utils/dates';

// TEMPORARY fixtures for the reminders screens, until the API exists.

type Priority = 'low' | 'medium' | 'high';

interface MockReminder {
  id: string;
  title: string;
  details: string;
  priority: Priority;
  dueDate: string;
  dueTime: string | null;
}

// Days are fixed relative to launch, so there's always something today and coming up.
const LAUNCHED_AT = new Date();
const day = (offset: number) => toDateKey(addDays(LAUNCHED_AT, offset));

const reminders: MockReminder[] = [
  {
    id: 'rmd_01',
    title: 'Campaign shoot review',
    details:
      'Review the final cuts from the Base Skincare campaign and approve the deliverables before noon.',
    priority: 'high',
    dueDate: day(0),
    dueTime: '10:00',
  },
  {
    id: 'rmd_02',
    title: 'Send invoice to Glossier',
    details: 'Attach the usage-rights addendum and the signed brief.',
    priority: 'medium',
    dueDate: day(0),
    dueTime: '15:30',
  },
  {
    id: 'rmd_03',
    title: 'Follow up with Rohan Mehta',
    details: 'Check if the Nike Urban rate card was approved.',
    priority: 'medium',
    dueDate: day(1),
    dueTime: '11:00',
  },
  {
    id: 'rmd_04',
    title: 'Share Nike Urban draft',
    details: 'Upload the 30s reel cut to the shared folder and ping the brand manager.',
    priority: 'high',
    dueDate: day(2),
    dueTime: '09:30',
  },
  {
    id: 'rmd_05',
    title: 'Restock ring light batteries',
    details: '',
    priority: 'low',
    dueDate: day(5),
    dueTime: null,
  },
];

// Date, then time (any-time reminders last in their day).
function soonestFirst(a: MockReminder, b: MockReminder) {
  return a.dueDate.localeCompare(b.dueDate) || (a.dueTime ?? '99').localeCompare(b.dueTime ?? '99');
}

// GET /reminders
export function mockGetReminders() {
  return { reminders: [...reminders].sort(soonestFirst) };
}

// POST /reminders
export function mockCreateReminder(
  payload: { title: string; details: string; priority: Priority; dueDate: string } | undefined,
) {
  if (!payload) throw new Error('Missing reminder');
  const reminder: MockReminder = { id: `rmd_${Date.now()}`, ...payload, dueTime: null };
  reminders.push(reminder);
  return { reminder };
}
