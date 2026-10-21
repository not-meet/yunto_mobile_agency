import { z } from 'zod';

import {
  mockDeleteContentMedia,
  mockGetContentEditor,
  mockReorderContentMedia,
  mockSaveContent,
  mockUploadContentMedia,
} from '@/dummy/content';
import { mockApiRequest } from '@/dummy/mockApi';
import { contentTypeSchema, POST_TITLE_MAX } from '@/services/creatorCalendarService';
import { creatorPlatformSchema } from '@/services/creatorsService';
import { tolerantEnum } from '@/utils/schema';

// One piece on a creator's calendar opened in the content editor, as the web's
// /app/content/[id]: its script, schedule, segment and topics, brand collab, media and
// versions, plus what the editor needs around it (segments to offer, the agency's brands, how
// many pieces a shift would move, Instagram auto-post).

const idSchema = z.string().regex(/^[A-Za-z0-9_-]+$/);

export const CONTENT_BODY_MAX = 5000;
export const TOPICS_MAX = 20;
export const TOPIC_MAX = 40;
export const SEGMENT_MAX = 40;
export const BRAND_NAME_MAX = 80;
export const DISCLOSURE_MAX = 60;
export const DEAL_AMOUNT_MAX = 99_99_99_999;
export const MEDIA_MAX = 10;

// Must mirror backend enum.
export const brandDealSchema = z.enum(['paid', 'barter', 'hybrid']);
export type BrandDeal = z.infer<typeof brandDealSchema>;

// "draft" until it's put on the calendar, "posted" once it's live. "UNKNOWN" for anything newer.
const contentStatusSchema = tolerantEnum(['draft', 'scheduled', 'posted']);
export type ContentEditorStatus = z.infer<typeof contentStatusSchema>;

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

const brandInfoSchema = z.object({
  name: z.string().min(1).max(BRAND_NAME_MAX),
  // Whole rupees; null when not agreed yet.
  amount: z.number().int().positive().max(DEAL_AMOUNT_MAX).nullable(),
  deal: brandDealSchema,
  disclosure: z.string().max(DISCLOSURE_MAX),
});
export type BrandInfo = z.infer<typeof brandInfoSchema>;

const contentVersionSchema = z.object({
  n: z.number().int().positive(),
  body: z.string().max(CONTENT_BODY_MAX),
  note: z.string().max(80),
  at: z.iso.datetime({ offset: true }),
});
export type ContentVersion = z.infer<typeof contentVersionSchema>;

const contentMediaSchema = z.object({
  id: idSchema,
  name: z.string().max(200),
  mime: z.string().max(100),
  size: z.number().int().nonnegative(),
  url: z.string().min(1),
});
export type ContentMedia = z.infer<typeof contentMediaSchema>;

const contentPostSchema = z.object({
  id: idSchema,
  title: z.string().max(POST_TITLE_MAX),
  // The script or caption notes, plain text (see richText.ts).
  body: z.string().max(CONTENT_BODY_MAX),
  status: contentStatusSchema,
  // "YYYY-MM-DD" and "HH:MM", IST.
  date: z.iso.date(),
  time: timeSchema,
  platform: tolerantEnum(creatorPlatformSchema.options).nullable(),
  contentType: tolerantEnum(contentTypeSchema.options).nullable(),
  segment: z.string().max(SEGMENT_MAX).nullable(),
  topics: z.array(z.string().max(TOPIC_MAX)).max(TOPICS_MAX),
  brandCollab: z.boolean(),
  brand: brandInfoSchema.nullable(),
  // In slide order: the first is the cover.
  media: z.array(contentMediaSchema),
  // Newest first.
  versions: z.array(contentVersionSchema),
  autopost: z.boolean(),
});
export type ContentPost = z.infer<typeof contentPostSchema>;

const autoPostJobSchema = z.object({
  status: tolerantEnum(['scheduled', 'processing', 'published', 'failed']),
  error: z.string().max(300).nullable(),
  permalink: z.url().nullable(),
});

// Null when Instagram isn't set up for the agency.
const autoPostSchema = z
  .object({
    // The creator lets the agency post for them.
    allowed: z.boolean(),
    // Null until the creator's Instagram is connected.
    handle: z.string().max(60).nullable(),
    job: autoPostJobSchema.nullable(),
  })
  .nullable();
export type AutoPost = z.infer<typeof autoPostSchema>;

const contentEditorResponse = z.object({
  // Null for a new piece.
  post: contentPostSchema.nullable(),
  // False when the creator isn't on the agency's roster: view only.
  canEdit: z.boolean(),
  segments: z.array(z.string().max(SEGMENT_MAX)).max(12),
  brandOptions: z.array(z.string().max(BRAND_NAME_MAX)).max(50),
  // Pieces from the day onward that "Shift existing content" would move a day later.
  shiftCount: z.number().int().nonnegative(),
  autoPost: autoPostSchema,
});
export type ContentEditorData = z.infer<typeof contentEditorResponse>;

// `date` is the calendar day it was opened from; `postId` is left out for a new piece.
export async function getContentEditor(
  creatorId: string,
  date: string,
  postId: string | null,
): Promise<ContentEditorData> {
  const id = idSchema.parse(creatorId);
  const day = z.iso.date().parse(date);
  const post = postId ? idSchema.parse(postId) : null;
  const query = `date=${day}${post ? `&post=${encodeURIComponent(post)}` : ''}`;
  return mockApiRequest({
    method: 'GET',
    path: `/creators/${encodeURIComponent(id)}/content/editor?${query}`,
    response: contentEditorResponse,
    mock: () => mockGetContentEditor(id, day, post),
  });
}

// Create (no `id`) or update, as the web's saveContentPost. Request messages are what the
// editor shows when a save can't go through.
export const saveContentRequest = z
  .object({
    id: idSchema.optional(),
    title: z.string().trim().max(POST_TITLE_MAX),
    body: z.string().trim().max(CONTENT_BODY_MAX),
    status: z.enum(['draft', 'scheduled']),
    date: z.iso.date({ message: 'Pick a date before adding this to the calendar' }),
    time: timeSchema,
    platform: creatorPlatformSchema.nullable(),
    contentType: contentTypeSchema.nullable(),
    segment: z.string().trim().min(1).max(SEGMENT_MAX).nullable(),
    topics: z
      .array(
        z
          .string()
          .regex(/^#[^\s#]+$/)
          .max(TOPIC_MAX),
      )
      .max(TOPICS_MAX, `Up to ${TOPICS_MAX} topics`),
    brandCollab: z.boolean(),
    brand: brandInfoSchema.nullable(),
    // Move this creator's later pieces (from `date`, not posted) a day on.
    shiftExisting: z.boolean(),
    // Why this save, kept with the version it makes ("Edited", "Restored v2", "Added CTA").
    versionNote: z.string().trim().min(1).max(80),
    // Only with Instagram auto-post allowed: on to publish at `date` + `time`.
    autopost: z.boolean().optional(),
    // The caption Analyze built, published with auto-post.
    caption: z.string().max(2200).optional(),
  })
  .refine((c) => !c.brandCollab || c.brand !== null, {
    message: 'Add the brand’s name for this collab, or turn Brand collab off',
    path: ['brand'],
  });
export type SaveContentRequest = z.infer<typeof saveContentRequest>;

const saveContentResponse = z.object({
  post: contentPostSchema,
  // Why auto-post couldn't be set up, when it couldn't.
  instagram: z.string().max(300).nullable(),
});
export type SaveContentResponse = z.infer<typeof saveContentResponse>;

export async function saveContent(
  creatorId: string,
  content: SaveContentRequest,
  // One per tap on a save button, reused if that tap is retried.
  idempotencyKey: string,
): Promise<SaveContentResponse> {
  const id = idSchema.parse(creatorId);
  return mockApiRequest({
    method: 'POST',
    path: `/creators/${encodeURIComponent(id)}/content`,
    request: saveContentRequest,
    body: content,
    response: saveContentResponse,
    idempotencyKey,
    mock: (payload) => mockSaveContent(id, payload),
  });
}

// A picked photo or clip, sent as multipart by the real API.
export const uploadMediaRequest = z.object({
  files: z
    .array(
      z.object({
        uri: z.string().min(1),
        name: z.string().min(1).max(200),
        mime: z.string().regex(/^(image|video)\//),
        size: z.number().int().nonnegative(),
      }),
    )
    .min(1)
    .max(MEDIA_MAX),
});
export type UploadMediaRequest = z.infer<typeof uploadMediaRequest>;

const uploadMediaResponse = z.object({ media: z.array(contentMediaSchema) });

export async function uploadContentMedia(
  creatorId: string,
  postId: string,
  files: UploadMediaRequest['files'],
): Promise<ContentMedia[]> {
  const id = idSchema.parse(creatorId);
  const post = idSchema.parse(postId);
  const { media } = await mockApiRequest({
    method: 'POST',
    path: `/creators/${encodeURIComponent(id)}/content/${encodeURIComponent(post)}/media`,
    request: uploadMediaRequest,
    body: { files },
    response: uploadMediaResponse,
    mock: (payload) => mockUploadContentMedia(id, post, payload),
  });
  return media;
}

const reorderMediaRequest = z.object({ ids: z.array(idSchema).max(MEDIA_MAX) });
const okResponse = z.object({ ok: z.literal(true) });

export async function reorderContentMedia(
  creatorId: string,
  postId: string,
  ids: string[],
): Promise<void> {
  const id = idSchema.parse(creatorId);
  const post = idSchema.parse(postId);
  await mockApiRequest({
    method: 'PUT',
    path: `/creators/${encodeURIComponent(id)}/content/${encodeURIComponent(post)}/media/order`,
    request: reorderMediaRequest,
    body: { ids },
    response: okResponse,
    mock: (payload) => mockReorderContentMedia(id, post, payload),
  });
}

export async function deleteContentMedia(
  creatorId: string,
  postId: string,
  mediaId: string,
): Promise<void> {
  const id = idSchema.parse(creatorId);
  const post = idSchema.parse(postId);
  const media = idSchema.parse(mediaId);
  await mockApiRequest({
    method: 'DELETE',
    path: `/creators/${encodeURIComponent(id)}/content/${encodeURIComponent(post)}/media/${encodeURIComponent(media)}`,
    response: okResponse,
    mock: () => mockDeleteContentMedia(id, post, media),
  });
}
