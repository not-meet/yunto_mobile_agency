import { z } from 'zod';

import {
  mockAddLeadCreators,
  mockGetLeadCreator,
  mockGetLeadCreators,
  mockRemoveLeadCreators,
  mockSetLeadCreatorStatus,
} from '@/dummy/leads';
import { mockApiRequest } from '@/dummy/mockApi';
import { talentRoleSchema } from '@/services/talentService';
import { tolerantEnum } from '@/utils/schema';

// The creators pitched for a lead: the list, one creator's details, adding roster creators,
// and moving them along (shortlisted, done) or dropping them from the lead.

const idSchema = z.string().regex(/^[A-Za-z0-9_-]+$/);

// "UNKNOWN" for a platform the app doesn't know yet; shown without a badge.
export const creatorPlatformSchema = tolerantEnum(['instagram', 'youtube']);
export type CreatorPlatform = z.infer<typeof creatorPlatformSchema>;

// "pending": pitched, not decided on yet. "UNKNOWN" for anything newer; those only show under
// "All Creators".
export const creatorStatusSchema = tolerantEnum(['pending', 'shortlisted', 'done']);
export type CreatorStatus = z.infer<typeof creatorStatusSchema>;

const leadCreatorSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  // e.g. "@aarav.travels".
  handle: z.string().min(1),
  avatarUrl: z.url().nullable(),
  platform: creatorPlatformSchema,
  // e.g. "Travel".
  niche: z.string().min(1),
  status: creatorStatusSchema,
  followers: z.number().int().nonnegative(),
  avgViews: z.number().int().nonnegative(),
  // Percent, e.g. 4.2.
  engagementRate: z.number().nonnegative(),
  // The other agency handling them, e.g. "Bloom Collective"; null for the agency's own creators.
  managedBy: z.string().min(1).nullable(),
  // E.164, e.g. "+919812345678"; null when unknown.
  phone: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/)
    .nullable(),
});
export type LeadCreator = z.infer<typeof leadCreatorSchema>;

const creatorDeliverableSchema = z.object({
  id: z.string().min(1),
  // e.g. "1x Instagram Reel".
  title: z.string().min(1),
  // The IST day it went live, or is due when not done yet.
  date: z.iso.date(),
  done: z.boolean(),
});
export type CreatorDeliverable = z.infer<typeof creatorDeliverableSchema>;

const creatorAddOnSchema = z.object({
  id: z.string().min(1),
  role: talentRoleSchema,
  // e.g. "Videographer On-Site Shoot".
  title: z.string().min(1),
  // Rupees.
  price: z.number().nonnegative(),
});
export type CreatorAddOn = z.infer<typeof creatorAddOnSchema>;

// "UNKNOWN" for anything else; shown with a neutral icon.
export const creatorActivityTypeSchema = tolerantEnum(['added', 'brief', 'message', 'shortlisted']);
export type CreatorActivityType = z.infer<typeof creatorActivityTypeSchema>;

const creatorActivitySchema = z.object({
  id: z.string().min(1),
  type: creatorActivityTypeSchema,
  // e.g. "Shortlisted".
  title: z.string().min(1),
  // e.g. "Leena moved them to the shortlist".
  detail: z.string().min(1).nullable(),
  at: z.iso.datetime(),
});
export type CreatorActivity = z.infer<typeof creatorActivitySchema>;

const leadCreatorDetailsSchema = leadCreatorSchema.extend({
  // e.g. "Mumbai, MH"; null when unknown.
  location: z.string().min(1).nullable(),
  // The lead's campaign, e.g. "Zostel Trip"; null until it has one.
  campaign: z.string().min(1).nullable(),
  // The IST day the content is due; null until agreed.
  deadline: z.iso.date().nullable(),
  // Rupees, the creator's fee; null until agreed.
  budget: z.number().nonnegative().nullable(),
  analytics: z.object({
    // Percent change in followers this month.
    followersGrowth: z.number().nullable(),
    // Percentage points against the creator's previous campaign.
    engagementChange: z.number().nullable(),
    // Views across this campaign's content so far.
    campaignReach: z.number().int().nonnegative().nullable(),
  }),
  deliverables: z.array(creatorDeliverableSchema),
  addOns: z.array(creatorAddOnSchema),
  // Newest first.
  activity: z.array(creatorActivitySchema),
});
export type LeadCreatorDetails = z.infer<typeof leadCreatorDetailsSchema>;

const creatorsPath = (leadId: string) =>
  `/leads/${encodeURIComponent(idSchema.parse(leadId))}/creators`;

export async function getLeadCreators(leadId: string): Promise<LeadCreator[]> {
  const { creators } = await mockApiRequest({
    method: 'GET',
    path: creatorsPath(leadId),
    response: z.object({ creators: z.array(leadCreatorSchema) }),
    mock: () => mockGetLeadCreators(idSchema.parse(leadId)),
  });
  return creators;
}

export async function getLeadCreator(
  leadId: string,
  creatorId: string,
): Promise<LeadCreatorDetails> {
  const { creator } = await mockApiRequest({
    method: 'GET',
    path: `${creatorsPath(leadId)}/${encodeURIComponent(idSchema.parse(creatorId))}`,
    response: z.object({ creator: leadCreatorDetailsSchema }),
    mock: () => mockGetLeadCreator(idSchema.parse(leadId), idSchema.parse(creatorId)),
  });
  return creator;
}

const creatorIdsSchema = z.array(idSchema).min(1);

const addRequest = z.object({ creatorIds: creatorIdsSchema });

// Adds roster creators as pending. Returns the lead's creators as they are now.
export async function addLeadCreators(
  leadId: string,
  creatorIds: string[],
  idempotencyKey: string,
): Promise<LeadCreator[]> {
  const { creators } = await mockApiRequest({
    method: 'POST',
    path: creatorsPath(leadId),
    request: addRequest,
    body: { creatorIds },
    response: z.object({ creators: z.array(leadCreatorSchema) }),
    idempotencyKey,
    mock: (payload) => mockAddLeadCreators(idSchema.parse(leadId), payload),
  });
  return creators;
}

const setStatusRequest = z.object({
  creatorIds: creatorIdsSchema,
  status: z.enum(['pending', 'shortlisted', 'done']),
});
export type SetCreatorStatusRequest = z.infer<typeof setStatusRequest>;

// Returns the creators as they are now.
export async function setLeadCreatorStatus(
  leadId: string,
  update: SetCreatorStatusRequest,
  idempotencyKey: string,
): Promise<LeadCreator[]> {
  const { creators } = await mockApiRequest({
    method: 'POST',
    path: `${creatorsPath(leadId)}/status`,
    request: setStatusRequest,
    body: update,
    response: z.object({ creators: z.array(leadCreatorSchema) }),
    idempotencyKey,
    mock: (payload) => mockSetLeadCreatorStatus(idSchema.parse(leadId), payload),
  });
  return creators;
}

const removeRequest = z.object({ creatorIds: creatorIdsSchema });

export async function removeLeadCreators(
  leadId: string,
  creatorIds: string[],
  idempotencyKey: string,
): Promise<void> {
  await mockApiRequest({
    method: 'POST',
    path: `${creatorsPath(leadId)}/remove`,
    request: removeRequest,
    body: { creatorIds },
    response: z.object({ ok: z.literal(true) }),
    idempotencyKey,
    mock: (payload) => mockRemoveLeadCreators(idSchema.parse(leadId), payload),
  });
}
