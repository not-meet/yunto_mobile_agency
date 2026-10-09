import { z } from 'zod';

import { mockBookTalent, mockGetTalent, mockGetTalents } from '@/dummy/talent';
import { mockApiRequest } from '@/dummy/mockApi';

// Videographers and editors a creator can book as add-ons on a lead.

export const talentRoleSchema = z.enum(['videographer', 'editor']);
export type TalentRole = z.infer<typeof talentRoleSchema>;

export const talentCategorySchema = z.enum(['fashion', 'travel', 'event', 'makeup', 'cinematic']);
export type TalentCategory = z.infer<typeof talentCategorySchema>;
// As returned: categories the app doesn't know ("UNKNOWN") are dropped.
const talentCategoriesSchema = z
  .array(z.string())
  .transform((values) =>
    values.filter(
      (value): value is TalentCategory => talentCategorySchema.safeParse(value).success,
    ),
  );

// How big the job is; each talent quotes a rate per tier.
export const shootTierSchema = z.enum(['basic', 'standard', 'premium']);
export type ShootTier = z.infer<typeof shootTierSchema>;

export const INDIAN_STATES = [
  'Delhi',
  'Maharashtra',
  'Karnataka',
  'Goa',
  'Rajasthan',
  'Tamil Nadu',
  'West Bengal',
] as const;
export const indianStateSchema = z.enum(INDIAN_STATES);
export type IndianState = z.infer<typeof indianStateSchema>;

const moneySchema = z.number().int().nonnegative();
// A tier the talent hasn't priced: null.
const rateSchema = moneySchema.nullable();

// A photo or clip from their portfolio; videos play in the viewer, photos open full size.
const pastWorkSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['photo', 'video']).catch('photo'),
  thumbnailUrl: z.url({ protocol: /^https$/ }),
  mediaUrl: z.url({ protocol: /^https$/ }),
});
export type PastWork = z.infer<typeof pastWorkSchema>;

// One card in the swipe deck (GET /talents). Filtering and sorting happen on the device.
const talentListItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  categories: talentCategoriesSchema,
  // e.g. "Fashion & Lifestyle Videographer".
  specialty: z.string().min(1),
  experienceYears: z.number().int().nonnegative(),
  // Brands they've worked with, most notable first.
  brands: z.array(z.string().min(1)),
  // null until they upload one; the app shows their initials.
  photoUrl: z.url({ protocol: /^https$/ }).nullable(),
  // Any Indian state; INDIAN_STATES are just the ones offered for sorting.
  location: z.object({ state: z.string().min(1) }),
  // Typical time to reply, e.g. "1 hr"; null when unknown (the pill is hidden).
  replyTime: z.string().min(1).nullable(),
  // How seasoned they are, on the same three flames as the tier: rookie, mid-level, high profile.
  // An unknown level counts as mid-level.
  level: shootTierSchema.catch('standard'),
});
export type TalentListItem = z.infer<typeof talentListItemSchema>;

// The full profile (GET /talents/:id).
const talentSchema = talentListItemSchema.extend({
  role: talentRoleSchema,
  bio: z.string().min(1),
  // e.g. { area: "Hauz Khas", state: "Delhi" }.
  location: z.object({ area: z.string().min(1), state: z.string().min(1) }),
  // Rupees per job at each tier; null for a tier they haven't priced.
  rates: z.object({ basic: rateSchema, standard: rateSchema, premium: rateSchema }),
  // What they're best at, e.g. "Color Grading".
  expertise: z.array(z.string().min(1)),
  // Average review out of 5, and how many reviews it's from; the count is null when the server
  // doesn't know it (hidden).
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative().nullable(),
  // When they're next free, e.g. ["Today", "Sat"].
  availability: z.array(z.string().min(1)),
  pastWork: z.array(pastWorkSchema),
});
export type Talent = z.infer<typeof talentSchema>;

const getTalentsResponse = z.object({ talents: z.array(talentListItemSchema) });

export async function getTalents(role: TalentRole): Promise<TalentListItem[]> {
  const safeRole = talentRoleSchema.parse(role);
  const { talents } = await mockApiRequest({
    method: 'GET',
    path: `/talents?role=${safeRole}`,
    response: getTalentsResponse,
    mock: () => mockGetTalents(safeRole),
  });
  return talents;
}

const talentIdSchema = z.string().regex(/^[A-Za-z0-9_-]+$/);
const getTalentResponse = z.object({ talent: talentSchema });

export async function getTalent(id: string): Promise<Talent> {
  // Validated before it's interpolated into the path.
  const safeId = talentIdSchema.parse(id);
  const { talent } = await mockApiRequest({
    method: 'GET',
    path: `/talents/${encodeURIComponent(safeId)}`,
    response: getTalentResponse,
    mock: () => mockGetTalent(safeId),
  });
  return talent;
}

// What the creator asks for when booking a talent: edit requirements for an editor, the shoot's
// when, what and where for a videographer.

export const contentTypeSchema = z.enum(['reel', 'youtube', 'ad']);
export type ContentType = z.infer<typeof contentTypeSchema>;

// Rough runtime of each video: under 30 sec, 30–60 sec, 1–3 min.
export const videoLengthSchema = z.enum(['short', 'medium', 'long']);
export type VideoLength = z.infer<typeof videoLengthSchema>;

export const editingStyleSchema = z.enum(['trendy', 'cinematic', 'minimal', 'storytelling']);
export type EditingStyle = z.infer<typeof editingStyleSchema>;

export const projectTypeSchema = z.enum([
  'brand-campaign',
  'music-video',
  'product-shoot',
  'event-coverage',
]);
export type ProjectType = z.infer<typeof projectTypeSchema>;

// Shoot start times, 24-hour local time.
export const shootSlotSchema = z.enum(['09:00', '11:00', '14:00', '16:00', '18:00'], {
  error: 'Pick a time slot',
});
export type ShootSlot = z.infer<typeof shootSlotSchema>;

// Paid extras on a booking. Prices are estimates shown before confirming; the booking only sends
// the chosen ids.
export const editorAddOnSchema = z.enum(['captions', 'thumbnail', 'grading', 'sound', 'express']);
export type EditorAddOn = z.infer<typeof editorAddOnSchema>;
export const videographerAddOnSchema = z.enum(['drone', 'extra-hour']);
export type VideographerAddOn = z.infer<typeof videographerAddOnSchema>;

export const ADD_ON_PRICES: Record<EditorAddOn | VideographerAddOn, number> = {
  captions: 500,
  thumbnail: 800,
  grading: 1_200,
  sound: 1_000,
  express: 1_500,
  drone: 3_000,
  'extra-hour': 1_500,
};

export const PLATFORM_FEE_RATE = 0.05;
export const GST_RATE = 0.18;

export interface BookingQuote {
  base: number;
  addOns: number;
  platformFee: number;
  gst: number;
  total: number;
}

// The talent's rate for the tier plus the chosen add-ons, then the platform fee and GST on top.
export function quoteBooking(
  base: number,
  addOns: readonly (EditorAddOn | VideographerAddOn)[],
): BookingQuote {
  const extras = addOns.reduce((sum, addOn) => sum + ADD_ON_PRICES[addOn], 0);
  const platformFee = Math.round((base + extras) * PLATFORM_FEE_RATE);
  const gst = Math.round((base + extras + platformFee) * GST_RATE);
  return { base, addOns: extras, platformFee, gst, total: base + extras + platformFee + gst };
}

export const MAX_VIDEOS = 10;
export const MAX_FOOTAGE_FILES = 10;
export const FOOTAGE_FILE_NAME_MAX = 200;
// A shared-drive link to the footage, or empty.
export const footageLinkSchema = z.union([z.literal(''), z.url({ protocol: /^https$/ })], {
  error: 'Enter a valid https:// link for your footage',
});
export const FOOTAGE_NOTES_MAX = 500;
export const SHOOT_LOCATION_MAX = 120;
export const SHOOT_BRIEF_MAX = 500;

const editRequirementsSchema = z.object({
  role: z.literal('editor'),
  contentType: contentTypeSchema,
  videoCount: z.number().int().min(1).max(MAX_VIDEOS),
  videoLength: videoLengthSchema,
  editingStyles: z.array(editingStyleSchema).min(1, 'Pick at least one editing style'),
  // Raw footage: file names picked on the device (TODO: upload once the API takes files) and/or
  // a shared-drive link, plus notes for the editor. All optional.
  footageFiles: z.array(z.string().min(1).max(FOOTAGE_FILE_NAME_MAX)).max(MAX_FOOTAGE_FILES),
  footageLink: footageLinkSchema,
  notes: z.string().trim().max(FOOTAGE_NOTES_MAX),
  addOns: z.array(editorAddOnSchema),
});
export type EditRequirements = z.infer<typeof editRequirementsSchema>;

const shootDetailsSchema = z.object({
  role: z.literal('videographer'),
  // The creator's local calendar day, e.g. "2026-06-20".
  date: z.iso.date({ error: 'Pick a shoot date' }),
  slot: shootSlotSchema,
  projectTypes: z.array(projectTypeSchema).min(1, 'Pick at least one project type'),
  location: z.string().trim().min(1, 'Add the shoot location').max(SHOOT_LOCATION_MAX),
  // Optional; empty when the creator has nothing to add.
  brief: z.string().trim().max(SHOOT_BRIEF_MAX),
  addOns: z.array(videographerAddOnSchema),
});
export type ShootDetails = z.infer<typeof shootDetailsSchema>;

export const bookingDetailsSchema = z.discriminatedUnion('role', [
  editRequirementsSchema,
  shootDetailsSchema,
]);
export type BookingDetails = z.infer<typeof bookingDetailsSchema>;

const bookTalentRequest = z
  .object({
    // What the talent is booked for: a lead's add-on or a campaign's. Exactly one is set; both
    // ids share the talent id format.
    leadId: talentIdSchema.optional(),
    campaignId: talentIdSchema.optional(),
    // The tier picked while browsing; it sets the price.
    tier: shootTierSchema,
    details: bookingDetailsSchema,
  })
  .refine((booking) => (booking.leadId === undefined) !== (booking.campaignId === undefined), {
    message: 'Book for either a lead or a campaign',
  });
export type BookTalentRequest = z.infer<typeof bookTalentRequest>;

const bookingSchema = z.object({
  id: z.string().min(1),
  talentId: z.string().min(1),
  leadId: z.string().min(1).optional(),
  campaignId: z.string().min(1).optional(),
  // Waiting on the talent to accept.
  status: z.literal('requested'),
});
export type Booking = z.infer<typeof bookingSchema>;

const bookTalentResponse = z.object({ booking: bookingSchema });

// `idempotencyKey` is made once per user action and reused if that action is retried.
export async function bookTalent(
  id: string,
  booking: BookTalentRequest,
  idempotencyKey: string,
): Promise<Booking> {
  const safeId = talentIdSchema.parse(id);
  const { booking: created } = await mockApiRequest({
    method: 'POST',
    path: `/talents/${encodeURIComponent(safeId)}/bookings`,
    request: bookTalentRequest,
    body: booking,
    idempotencyKey,
    response: bookTalentResponse,
    mock: (payload) => mockBookTalent(safeId, payload),
  });
  return created;
}
