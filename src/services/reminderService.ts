import { z } from 'zod';

import { mockCreateReminder, mockGetReminders } from '@/dummy/reminders';
import { mockApiRequest } from '@/dummy/mockApi';
import { daysFromToday, fromDateKey } from '@/utils/dates';

// The agency's own to-dos: a title, optional details, a priority and the day it's due.

export const REMINDER_TITLE_MAX = 120;
export const REMINDER_DETAILS_MAX = 1000;

export const reminderPrioritySchema = z.enum(['low', 'medium', 'high']);
export type ReminderPriority = z.infer<typeof reminderPrioritySchema>;

const reminderSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]+$/),
  title: z.string().min(1).max(REMINDER_TITLE_MAX),
  details: z.string().max(REMINDER_DETAILS_MAX),
  // An unknown priority from the server shows as medium.
  priority: reminderPrioritySchema.catch('medium'),
  // "YYYY-MM-DD", the IST calendar day it's due.
  dueDate: z.iso.date(),
  // "HH:mm" (24h, IST), or null for any time that day.
  dueTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .nullable(),
});
export type Reminder = z.infer<typeof reminderSchema>;

const remindersResponse = z.object({ reminders: z.array(reminderSchema) });

// Soonest first.
export async function getReminders(): Promise<Reminder[]> {
  const { reminders } = await mockApiRequest({
    method: 'GET',
    path: '/reminders',
    response: remindersResponse,
    mock: mockGetReminders,
  });
  return reminders;
}

const createReminderRequest = z.object({
  title: z.string().trim().min(1, 'Add a title').max(REMINDER_TITLE_MAX),
  details: z.string().trim().max(REMINDER_DETAILS_MAX),
  priority: reminderPrioritySchema,
  dueDate: z.iso.date().refine((date) => daysFromToday(fromDateKey(date)) >= 0, {
    message: 'Pick today or a later day',
  }),
});
export type CreateReminderInput = z.input<typeof createReminderRequest>;

// The created reminder; priority and time aren't echoed back (the list is refetched).
const createdReminderSchema = reminderSchema.pick({
  id: true,
  title: true,
  details: true,
  dueDate: true,
});
export type CreatedReminder = z.infer<typeof createdReminderSchema>;
const createReminderResponse = z.object({ reminder: createdReminderSchema });

// `idempotencyKey` is made once per user action and reused if that action is retried.
export async function createReminder(
  input: CreateReminderInput,
  idempotencyKey: string,
): Promise<CreatedReminder> {
  const { reminder } = await mockApiRequest({
    method: 'POST',
    path: '/reminders',
    request: createReminderRequest,
    body: input,
    idempotencyKey,
    response: createReminderResponse,
    mock: (payload) => mockCreateReminder(payload),
  });
  return reminder;
}

// The first thing still missing from `input`, or null when it's ready to create.
export function reminderProblem(input: CreateReminderInput): string | null {
  const result = createReminderRequest.safeParse(input);
  return result.success ? null : (result.error.issues[0]?.message ?? 'Check the form');
}
