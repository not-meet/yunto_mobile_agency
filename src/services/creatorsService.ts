import { z } from 'zod';

import {
  mockAcceptCreatorRequest,
  mockCreateCreator,
  mockDeclineCreatorRequest,
  mockGetCreator,
  mockGetCreatorRequests,
  mockSearchCreators,
  mockSetCreatorListed,
} from '@/dummy/creators';
import { mockApiRequest } from '@/dummy/mockApi';
import { EMAIL_MAX, NICHE_MAX } from '@/services/leadsService';
import { tolerantEnum } from '@/utils/schema';

// The agency's creators: searching its own roster (or every creator on Yunto), one creator's
// profile, inviting a new creator onto the roster, listing them in the global pool, and the
// creators asking to join.

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

export const creatorGenderSchema = z.enum(['female', 'male', 'lgbtq', 'other']);
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

// Paid in cash, or in kind (a stay, product).
export const creatorServiceSchema = z.enum(['paid', 'barter']);
export type CreatorService = z.infer<typeof creatorServiceSchema>;

export const creatorDeliverableSchema = z.enum([
  'reel',
  'story',
  'post',
  'short',
  'long_video',
  'community_post',
]);
export type CreatorDeliverable = z.infer<typeof creatorDeliverableSchema>;

// Average views bands, e.g. "50k-100k".
export const avgViewsBandSchema = z.enum([
  '0-50k',
  '50k-100k',
  '100k-250k',
  '250k-500k',
  '500k-1m',
]);
export type AvgViewsBand = z.infer<typeof avgViewsBandSchema>;

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
  // Shown to other agencies in the global pool.
  listed: z.boolean(),
});
export type Creator = z.infer<typeof creatorSchema>;

export const CREATOR_QUERY_MAX = 60;
export const CREATOR_LOCATION_MAX = 60;
export const CREATOR_LANGUAGE_MAX = 30;
// The followers slider's top end; at it, "1M+".
export const FOLLOWERS_MAX = 1_000_000;
// Rupees.
export const FILTER_BUDGET_MAX = 9_99_99_999;

// Every Indian state, then the union territories: the Filter sheet's Location options.
export const INDIA_REGIONS = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;
export const indiaRegionSchema = z.enum(INDIA_REGIONS);
export type IndiaRegion = z.infer<typeof indiaRegionSchema>;

const filterBudgetSchema = z.number().int().nonnegative().max(FILTER_BUDGET_MAX).nullable();

// The Filter sheet, as on yunto-private. null (or an empty list) means no limit on that field.
export const creatorFiltersSchema = z.object({
  service: creatorServiceSchema.nullable(),
  // Barter only: what the brand gives per creator. Hides creators whose agency won't work for
  // this much.
  barterBudget: filterBudgetSchema,
  platform: creatorPlatformSchema.nullable(),
  // What the brand wants made. Doesn't narrow the list.
  deliverables: z.array(creatorDeliverableSchema),
  // null for all categories.
  niche: z.string().min(1).max(NICHE_MAX).nullable(),
  // At least this many; 0 for any.
  minFollowers: z.number().int().nonnegative().max(FOLLOWERS_MAX),
  // A state or union territory, e.g. "Maharashtra".
  state: indiaRegionSchema.nullable(),
  // A city, e.g. "Delhi".
  location: z.string().trim().min(1).max(CREATOR_LOCATION_MAX).nullable(),
  genders: z.array(creatorGenderSchema),
  avgViews: avgViewsBandSchema.nullable(),
  ageRange: ageRangeSchema.nullable(),
  language: z.string().trim().min(1).max(CREATOR_LANGUAGE_MAX).nullable(),
  // Most rupees per post.
  budgetMax: filterBudgetSchema,
});
export type CreatorFilters = z.infer<typeof creatorFiltersSchema>;

export const NO_CREATOR_FILTERS: CreatorFilters = {
  service: null,
  barterBudget: null,
  platform: null,
  deliverables: [],
  niche: null,
  minFollowers: 0,
  state: null,
  location: null,
  genders: [],
  avgViews: null,
  ageRange: null,
  language: null,
  budgetMax: null,
};

const searchCreatorsRequest = z.object({
  scope: creatorScopeSchema,
  // Matches name, handle or niche; empty for everyone.
  query: z.string().trim().max(CREATOR_QUERY_MAX),
  sort: creatorSortSchema,
  filters: creatorFiltersSchema,
  // Our Creators only: just those listed in the global pool.
  listedOnly: z.boolean(),
  // All Creators only: just those the agency has hidden, who are otherwise left out.
  hiddenOnly: z.boolean(),
});
export type SearchCreatorsRequest = z.infer<typeof searchCreatorsRequest>;

const searchCreatorsResponse = z.object({
  creators: z.array(creatorSchema),
  // Everyone in the scope, before the search and filters.
  total: z.number().int().nonnegative(),
  // What the Filter sheet offers, from everyone in the scope.
  facets: z.object({
    niches: z.array(z.string().min(1)),
    locations: z.array(z.string().min(1)),
    platforms: z.array(creatorPlatformSchema),
    languages: z.array(z.string().min(1)),
    ageRanges: z.array(ageRangeSchema),
  }),
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
  // Their page on the platform, e.g. "https://instagram.com/leenabliss"; null when unknown.
  url: z.url({ protocol: /^https$/ }).nullable(),
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

// Creators asking to join the agency, from the Creator Request sheet. Confirming puts them on the
// roster; deleting turns them down.

const creatorRequestSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  handle: z.string().min(1),
  avatarUrl: z.url().nullable(),
  email: z.email().nullable(),
  listed: z.boolean(),
});
export type CreatorRequest = z.infer<typeof creatorRequestSchema>;

const creatorRequestsResponse = z.object({
  // Newest first.
  requests: z.array(creatorRequestSchema),
});

export async function getCreatorRequests(): Promise<CreatorRequest[]> {
  const { requests } = await mockApiRequest({
    method: 'GET',
    path: '/creators/requests',
    response: creatorRequestsResponse,
    mock: mockGetCreatorRequests,
  });
  return requests;
}

const requestPath = (id: string) => `/creators/requests/${encodeURIComponent(idSchema.parse(id))}`;
const okResponse = z.object({ ok: z.literal(true) });

export async function acceptCreatorRequest(id: string): Promise<void> {
  await mockApiRequest({
    method: 'POST',
    path: `${requestPath(id)}/accept`,
    response: okResponse,
    mock: () => mockAcceptCreatorRequest(idSchema.parse(id)),
  });
}

export async function declineCreatorRequest(id: string): Promise<void> {
  await mockApiRequest({
    method: 'POST',
    path: `${requestPath(id)}/decline`,
    response: okResponse,
    mock: () => mockDeclineCreatorRequest(idSchema.parse(id)),
  });
}

const setListedRequest = z.object({ listed: z.boolean() });

// Lists (or unlists) a roster creator, or one asking to join, in the global pool.
export async function setCreatorListed(id: string, listed: boolean): Promise<void> {
  await mockApiRequest({
    method: 'PUT',
    path: `/creators/${encodeURIComponent(idSchema.parse(id))}/listed`,
    request: setListedRequest,
    body: { listed },
    response: okResponse,
    mock: (payload) => mockSetCreatorListed(idSchema.parse(id), payload),
  });
}
