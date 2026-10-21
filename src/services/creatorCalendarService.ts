import { z } from 'zod';

import { mockDeleteCalendarPost, mockGetCreatorCalendar } from '@/dummy/creatorCalendar';
import { mockApiRequest } from '@/dummy/mockApi';
import { creatorPlatformSchema } from '@/services/creatorsService';
import { tolerantEnum } from '@/utils/schema';

// A creator's content calendar, reached from their profile as on the web: what's planned on
// each day of a month and taking a piece off. Writing one is the content editor's
// (contentService.ts).

const idSchema = z.string().regex(/^[A-Za-z0-9_-]+$/);
const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

export const contentTypeSchema = z.enum([
  'reel',
  'post',
  'story',
  'carousel',
  'short',
  'integrated',
  'dedicated',
  'ugc',
]);
export type ContentType = z.infer<typeof contentTypeSchema>;

// "draft" until it has a slot, "posted" once it's live. "UNKNOWN" for anything newer.
const contentStatusSchema = tolerantEnum(['draft', 'scheduled', 'posted']);
export type ContentStatus = z.infer<typeof contentStatusSchema>;

export const POST_TITLE_MAX = 120;

const calendarPostSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(POST_TITLE_MAX),
  platform: tolerantEnum(creatorPlatformSchema.options),
  contentType: tolerantEnum(contentTypeSchema.options),
  status: contentStatusSchema,
  // "YYYY-MM-DD".
  date: z.iso.date(),
  // The brand, for a paid collab; null for the creator's own content.
  brand: z.string().min(1).max(80).nullable(),
  // Planned by Yunto's AI.
  ai: z.boolean(),
});
export type CalendarPost = z.infer<typeof calendarPostSchema>;

const creatorCalendarResponse = z.object({
  posts: z.array(calendarPostSchema),
  // False when the creator isn't on the agency's roster: the calendar is view only.
  canEdit: z.boolean(),
});
export type CreatorCalendar = z.infer<typeof creatorCalendarResponse>;

// `month` is "YYYY-MM".
export async function getCreatorCalendar(
  creatorId: string,
  month: string,
): Promise<CreatorCalendar> {
  const id = idSchema.parse(creatorId);
  const key = monthSchema.parse(month);
  return mockApiRequest({
    method: 'GET',
    path: `/creators/${encodeURIComponent(id)}/calendar?month=${key}`,
    response: creatorCalendarResponse,
    mock: () => mockGetCreatorCalendar(id, key),
  });
}

const deleteCalendarPostResponse = z.object({ ok: z.literal(true) });

export async function deleteCalendarPost(creatorId: string, postId: string): Promise<void> {
  const id = idSchema.parse(creatorId);
  const post = idSchema.parse(postId);
  await mockApiRequest({
    method: 'DELETE',
    path: `/creators/${encodeURIComponent(id)}/calendar/${encodeURIComponent(post)}`,
    response: deleteCalendarPostResponse,
    mock: () => mockDeleteCalendarPost(id, post),
  });
}
