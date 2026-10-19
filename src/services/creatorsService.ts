import { z } from 'zod';

import { mockCreateCreator, mockGetCreator, mockSearchCreators } from '@/dummy/creators';
import { mockApiRequest } from '@/dummy/mockApi';
import { EMAIL_MAX, NICHE_MAX } from '@/services/leadsService';
import { tolerantEnum } from '@/utils/schema';

// The agency's creators: searching its own roster (or every creator on Yunto), one creator's
// profile, and inviting a new creator onto the roster.

const idSchema = z.string().regex(/^[A-Za-z0-9_-]+$/);

// E.164, e.g. "+919812345678".
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
// Indian PIN code.
const PINCODE_PATTERN = /^[1-9]\d{5}$/;
// "@leenabliss": Instagram-style, 1–30 letters, digits, dots or underscores.
const HANDLE_PATTERN = /^@[A-Za-z0-9._]{1,30}$/;

export const creatorPlatformSchema = z.enum([
  'instagram',
  'youtube',
  'facebook',
  'linkedin',
  'tiktok',
  'x',
]);
export type CreatorPlatform = z.infer<typeof creatorPlatformSchema>;

export const creatorGenderSchema = z.enum(['female', 'male', 'other']);
export type CreatorGender = z.infer<typeof creatorGenderSchema>;

export const creatorTierSchema = z.enum(['nano', 'micro', 'mid', 'macro', 'mega']);
export type CreatorTier = z.infer<typeof creatorTierSchema>;

export const ageRangeSchema = z.enum(['13-18', '19-25', '26-35', '36-50', '50+']);
export type AgeRange = z.infer<typeof ageRangeSchema>;

// "ours": the agency's roster. "all": every creator on Yunto.
export const creatorScopeSchema = z.enum(['ours', 'all']);
export type CreatorScope = z.infer<typeof creatorScopeSchema>;

export const creatorSortSchema = z.enum(['newest', 'engagement', 'views', 'followers']);
export type CreatorSort = z.infer<typeof creatorSortSchema>;

// On the roster: "active" once they've accepted the invite. "UNKNOWN" for anything newer.
const rosterStatusSchema = tolerantEnum(['active', 'invited']);
export type RosterStatus = z.infer<typeof rosterStatusSchema>;

// Whether the agency should move the creator's rate, going by how they perform.
const rateSuggestionSchema = tolerantEnum(['increase', 'hold', 'decrease']);
export type RateSuggestion = z.infer<typeof rateSuggestionSchema>;

const creatorSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  // e.g. "@leenabliss".
  handle: z.string().min(1),
  avatarUrl: z.url().nullable(),
  // Where they're biggest; badged on their photo. "UNKNOWN" shows without a badge.
  platform: tolerantEnum(creatorPlatformSchema.options),
  // e.g. "Travel".
  niche: z.string().min(1),
  followers: z.number().int().nonnegative(),
  avgViews: z.number().int().nonnegative(),
  // Percent, e.g. 4.2.
  engagementRate: z.number().nonnegative(),
  // Leads they've been pitched on.
  leads: z.number().int().nonnegative(),
  // e.g. "Mumbai, MH".
  location: z.string().min(1).nullable(),
  // Out of 5; null until they've been rated.
  rating: z.number().min(0).max(5).nullable(),
  // Paise per view, e.g. 12 for "12p CPV"; null until known.
  cpv: z.number().nonnegative().nullable(),
  // Percent fit for the agency's briefs, e.g. 84.
  matchPct: z.number().int().min(0).max(100),
  // The agency (or teammate) handling them, e.g. "Stellar Talent"; shown on All Creators.
  managedBy: z.string().min(1).nullable(),
  // Percent against the average creator of their tier, e.g. 35 for "+35% Above Average".
  vsAverage: z.number(),
  rateSuggestion: rateSuggestionSchema,
  phone: z.string().regex(PHONE_PATTERN).nullable(),
  // Their public profile page, shared with brands.
  profileUrl: z.url({ protocol: /^https$/ }),
  // null when they're not on the agency's roster.
  rosterStatus: rosterStatusSchema.nullable(),
});
export type Creator = z.infer<typeof creatorSchema>;

export const CREATOR_QUERY_MAX = 60;
export const CREATOR_TAG_MAX = 30;
export const CREATOR_LOCATION_MAX = 60;

// An empty list means no limit on that field.
export const creatorFiltersSchema = z.object({
  niches: z.array(z.string().min(1).max(NICHE_MAX)).max(20),
  // null for any number of followers.
  maxFollowers: z.number().int().positive().nullable(),
  tags: z.array(z.string().trim().min(1).max(CREATOR_TAG_MAX)).max(20),
  ageRange: ageRangeSchema.nullable(),
  genders: z.array(creatorGenderSchema),
  // Cities, e.g. "Delhi".
  locations: z.array(z.string().trim().min(1).max(CREATOR_LOCATION_MAX)).max(20),
});
export type CreatorFilters = z.infer<typeof creatorFiltersSchema>;

export const NO_CREATOR_FILTERS: CreatorFilters = {
  niches: [],
  maxFollowers: null,
  tags: [],
  ageRange: null,
  genders: [],
  locations: [],
};

const searchCreatorsRequest = z.object({
  scope: creatorScopeSchema,
  // Matches name, handle or niche; empty for everyone.
  query: z.string().trim().max(CREATOR_QUERY_MAX),
  sort: creatorSortSchema,
  filters: creatorFiltersSchema,
});
export type SearchCreatorsRequest = z.infer<typeof searchCreatorsRequest>;

const searchCreatorsResponse = z.object({
  creators: z.array(creatorSchema),
  // Everyone in the scope, before the search and filters.
  total: z.number().int().nonnegative(),
});
export type CreatorsPage = z.infer<typeof searchCreatorsResponse>;

export async function searchCreators(search: SearchCreatorsRequest): Promise<CreatorsPage> {
  return mockApiRequest({
    method: 'POST',
    path: '/creators/search',
    request: searchCreatorsRequest,
    body: search,
    response: searchCreatorsResponse,
    mock: mockSearchCreators,
  });
}

const platformStatsSchema = z.object({
  platform: tolerantEnum(creatorPlatformSchema.options),
  followers: z.number().int().nonnegative(),
  // Percent.
  engagementRate: z.number().nonnegative(),
  avgLikes: z.number().int().nonnegative(),
  avgComments: z.number().int().nonnegative(),
});
export type PlatformStats = z.infer<typeof platformStatsSchema>;

// Rupees (tax inc.) for one piece of content: what the creator charges against the going rate
// for their tier, and what to do about the gap.
const contentRateSchema = z.object({
  creatorRate: z.number().nonnegative(),
  // null until there's enough market data.
  marketRate: z.number().nonnegative().nullable(),
  suggestion: rateSuggestionSchema,
});
export type ContentRate = z.infer<typeof contentRateSchema>;

// A creator's rates on one platform; null where they don't offer that content.
const commercialsSchema = z.object({
  platform: tolerantEnum(creatorPlatformSchema.options),
  // Percent against the average creator of their tier on this platform, e.g. 21 for "+21% above
  // avg"; null when unknown.
  vsAverage: z.number().nullable(),
  reel: contentRateSchema.nullable(),
  story: contentRateSchema.nullable(),
  post: contentRateSchema.nullable(),
});
export type Commercials = z.infer<typeof commercialsSchema>;

// What the creator has done (or is doing) with the agency, newest first.
const campaignStatusSchema = tolerantEnum([
  'active',
  'upcoming',
  'completed',
  'cancelled',
  'draft',
]);
export type CampaignStatus = z.infer<typeof campaignStatusSchema>;

const recentCampaignSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  // "YYYY-MM-DD".
  date: z.iso.date(),
  // e.g. "2 Reels, 1 Story".
  deliverables: z.string().min(1),
  status: campaignStatusSchema,
});
export type RecentCampaign = z.infer<typeof recentCampaignSchema>;

const creatorDetailsSchema = creatorSchema.extend({
  email: z.email().nullable(),
  // Their home address on one line, for shoots and barter deliveries.
  address: z.string().min(1).nullable(),
  // Niche first, then any other categories, e.g. ["Lifestyle", "Beauty"].
  categories: z.array(z.string().min(1)),
  platforms: z.array(platformStatsSchema),
  commercials: z.array(commercialsSchema),
  recentCampaigns: z.array(recentCampaignSchema),
});
export type CreatorDetails = z.infer<typeof creatorDetailsSchema>;

const creatorResponse = z.object({ creator: creatorDetailsSchema });

export async function getCreator(id: string): Promise<CreatorDetails> {
  const { creator } = await mockApiRequest({
    method: 'GET',
    path: `/creators/${encodeURIComponent(idSchema.parse(id))}`,
    response: creatorResponse,
    mock: () => mockGetCreator(idSchema.parse(id)),
  });
  return creator;
}

// Inviting a creator onto the roster, from the Add Creator sheet. Request messages are what the
// sheet shows when Send Invite is tapped too early, so they read as instructions.

export const CREATOR_NAME_MAX = 80;
export const CREATOR_TEXT_MAX = 80;
export const CREATOR_BIO_MAX = 300;
export const CATEGORIES_MAX = 10;
// Rupees.
export const RATE_MAX = 9_99_99_999;
export const COUNT_MAX = 9_999_999_999;

const optionalText = z.string().trim().min(1).max(CREATOR_TEXT_MAX).nullable();
const countSchema = z.number().int().nonnegative().max(COUNT_MAX).nullable();

const addressSchema = z.object({
  line1: z.string().trim().min(1, 'Add the first line of the address').max(CREATOR_TEXT_MAX),
  line2: optionalText,
  area: optionalText,
  city: z.string().trim().min(1, 'Add the city in the address').max(CREATOR_TEXT_MAX),
  state: z.string().trim().min(1, 'Add the state in the address').max(CREATOR_TEXT_MAX),
  pincode: z.string().regex(PINCODE_PATTERN, 'Enter a valid 6-digit pincode'),
});

export const createCreatorRequest = z.object({
  name: z.string().trim().min(1, 'Add the creator’s name').max(CREATOR_NAME_MAX),
  handle: z.string().regex(HANDLE_PATTERN, 'Enter a valid handle, e.g. @leenabliss'),
  // The invite goes here.
  email: z.email('Enter a valid email address').max(EMAIL_MAX),
  phone: z.string().regex(PHONE_PATTERN, 'Enter a valid phone number').nullable(),
  location: z.string().trim().min(1).max(CREATOR_LOCATION_MAX).nullable(),
  tier: creatorTierSchema.nullable(),
  gender: creatorGenderSchema.nullable(),
  language: optionalText,
  ageRange: ageRangeSchema.nullable(),
  bio: z.string().trim().min(1).max(CREATOR_BIO_MAX).nullable(),
  platforms: z.array(creatorPlatformSchema).min(1, 'Pick at least one platform'),
  followers: countSchema,
  avgViews: countSchema,
  engagementRate: z.number().min(0).max(100, 'Engagement rate can’t be over 100%').nullable(),
  // Rupees per view.
  cpv: z.number().nonnegative().max(RATE_MAX).nullable(),
  rating: z.number().min(0).max(5, 'Rating goes from 0 to 5').nullable(),
  ratePerPost: z.number().int().nonnegative().max(RATE_MAX).nullable(),
  // The teammate who handles them, e.g. "Leena Sharma".
  managedBy: optionalText,
  niche: z.string().min(1).max(NICHE_MAX).nullable(),
  categories: z.array(z.string().trim().min(1).max(NICHE_MAX)).max(CATEGORIES_MAX),
  address: addressSchema.nullable(),
});
export type CreateCreatorRequest = z.infer<typeof createCreatorRequest>;

export async function createCreator(
  creator: CreateCreatorRequest,
  // One per tap on Send Invite, reused if that tap is retried.
  idempotencyKey: string,
): Promise<CreatorDetails> {
  const { creator: created } = await mockApiRequest({
    method: 'POST',
    path: '/creators',
    request: createCreatorRequest,
    body: creator,
    response: creatorResponse,
    idempotencyKey,
    mock: mockCreateCreator,
  });
  return created;
}
