import { z } from 'zod';

import { mockAddNote, mockGetActivity, mockScheduleFollowUp } from '@/dummy/leads';
import { mockApiRequest } from '@/dummy/mockApi';
import { tolerantEnum } from '@/utils/schema';

// The "Notes & Activity" tab of a lead: the team's notes, what's happened on it so far, and the
// next follow-up.

export const NOTE_MAX = 500;

// "UNKNOWN" for anything else; shown with a neutral icon.
export const activityTypeSchema = tolerantEnum([
  'reminder',
  'follow-up',
  'call',
  'contacted',
  'converted',
  'intent',
]);
export type ActivityType = z.infer<typeof activityTypeSchema>;

const activitySchema = z.object({
  id: z.string().min(1),
  type: activityTypeSchema,
  // e.g. "Follow-up scheduled".
  title: z.string().min(1),
  at: z.iso.datetime(),
});
export type Activity = z.infer<typeof activitySchema>;

const noteSchema = z.object({
  id: z.string().min(1),
  text: z.string().trim().min(1).max(NOTE_MAX),
  createdAt: z.iso.datetime(),
});
export type Note = z.infer<typeof noteSchema>;

// Where the deal should be by the follow-up.
export const followUpUpdateSchema = z.enum(['discussion', 'negotiations', 'signing']);
export type FollowUpUpdate = z.infer<typeof followUpUpdateSchema>;

const followUpSchema = z.object({
  // The IST calendar day, e.g. "2026-06-19".
  date: z.iso.date(),
  update: followUpUpdateSchema,
});
export type FollowUp = z.infer<typeof followUpSchema>;

// As returned: only the date is shown, so an unknown or missing `update` doesn't fail it.
const followUpResponseSchema = followUpSchema.extend({
  update: followUpUpdateSchema.optional().catch(undefined),
});
export type ScheduledFollowUpDay = z.infer<typeof followUpResponseSchema>;

const notesActivitySchema = z.object({
  // Newest first.
  notes: z.array(noteSchema),
  activity: z.array(activitySchema),
  // The soonest upcoming follow-up, null when none is scheduled.
  followUp: followUpResponseSchema.nullable(),
});
export type NotesActivity = z.infer<typeof notesActivitySchema>;

const leadIdSchema = z.string().regex(/^[A-Za-z0-9_-]+$/);

// Validated before it's interpolated into the path.
const leadPath = (leadId: string) => `/leads/${encodeURIComponent(leadIdSchema.parse(leadId))}`;

export async function getLeadActivity(leadId: string): Promise<NotesActivity> {
  return mockApiRequest({
    method: 'GET',
    path: `${leadPath(leadId)}/activity`,
    response: notesActivitySchema,
    mock: () => mockGetActivity(leadIdSchema.parse(leadId)),
  });
}

const addNoteRequest = noteSchema.pick({ text: true });
const addNoteResponse = z.object({ note: noteSchema });

// `idempotencyKey`: one per user action (a tap on save), reused if that action is retried.
export async function addLeadNote(
  leadId: string,
  text: string,
  idempotencyKey: string,
): Promise<Note> {
  const { note } = await mockApiRequest({
    method: 'POST',
    path: `${leadPath(leadId)}/notes`,
    request: addNoteRequest,
    body: { text },
    response: addNoteResponse,
    idempotencyKey,
    mock: (payload) => mockAddNote(leadIdSchema.parse(leadId), payload),
  });
  return note;
}

const scheduleFollowUpResponse = z.object({
  // The next follow-up after this one is added (may be an earlier one).
  followUp: followUpResponseSchema,
  // The timeline entry logged for it.
  activity: activitySchema,
});
export type ScheduledFollowUp = z.infer<typeof scheduleFollowUpResponse>;

export async function scheduleLeadFollowUp(
  leadId: string,
  followUp: FollowUp,
  // One per user action, reused if that action is retried.
  idempotencyKey: string,
): Promise<ScheduledFollowUp> {
  return mockApiRequest({
    method: 'POST',
    path: `${leadPath(leadId)}/follow-ups`,
    request: followUpSchema,
    body: followUp,
    response: scheduleFollowUpResponse,
    idempotencyKey,
    mock: (payload) => mockScheduleFollowUp(leadIdSchema.parse(leadId), payload),
  });
}
