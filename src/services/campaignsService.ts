import { z } from 'zod';

import {
  mockAddCampaignDeliverables,
  mockCompleteCampaign,
  mockGetCampaign,
  mockGetCampaigns,
  mockRemoveCampaignDeliverable,
  mockSetCampaignAssignees,
  mockSetCampaignRequirements,
  mockUpdateCampaignDeliverable,
} from '@/dummy/campaigns';
import { mockApiRequest } from '@/dummy/mockApi';
import {
  type AddDeliverablesInput,
  addDeliverablesRequest,
  ASSIGNEES_MAX,
  brandRequirementsSchema,
  deliverableTypeSchema,
  type SetRequirementsInput,
  setRequirementsRequest,
  type UpdateDeliverableInput,
  updateDeliverableRequest,
} from '@/services/leadsService';
import { talentRoleSchema } from '@/services/talentService';
import { tolerantEnum } from '@/utils/schema';

// Campaigns the agency is running. Each one comes from a lead marked converted (`leadId`, one
// campaign per lead): the list, one campaign's details, closing it, its assignees and adding to or
// changing its deliverables (the lead's, shared). Its payment summary is in paymentsService.

const idSchema = z.string().regex(/^[A-Za-z0-9_-]+$/);

// As on the web: a converted lead starts as a draft. "UNKNOWN" for anything newer; those only
// show under "All".
export const campaignStatusSchema = tolerantEnum([
  'draft',
  'upcoming',
  'live',
  'in_progress',
  'completed',
  'cancelled',
]);
export type CampaignStatus = z.infer<typeof campaignStatusSchema>;

// "barter": paid in kind (a stay, product), with `budget` as its value.
const dealTypeSchema = z.enum(['paid', 'barter']).catch('paid');

// E.164, e.g. "+919812345678".
const phoneSchema = z.string().regex(/^\+[1-9]\d{7,14}$/);

const personSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  avatarUrl: z.url().nullable(),
});
export type CampaignPerson = z.infer<typeof personSchema>;

const campaignSchema = z.object({
  id: idSchema,
  // The lead it was converted from.
  leadId: idSchema,
  // e.g. "Winter in Manali"; the brand's name when the lead had no campaign name.
  name: z.string().min(1),
  brand: z.string().min(1).nullable(),
  // The brand's contact person.
  contactName: z.string().min(1),
  status: campaignStatusSchema,
  dealType: dealTypeSchema,
  // Rupees; null when the brand hasn't named one.
  budget: z.number().nonnegative().nullable(),
  // 0–100: how far its creators have got. 100 once completed.
  progress: z.number().min(0).max(100),
  creatorCount: z.number().int().nonnegative(),
  // When the lead was converted.
  createdAt: z.iso.datetime(),
  phone: phoneSchema.nullable(),
});
export type Campaign = z.infer<typeof campaignSchema>;

export async function getCampaigns(): Promise<Campaign[]> {
  const { campaigns } = await mockApiRequest({
    method: 'GET',
    path: '/campaigns',
    // Newest first.
    response: z.object({ campaigns: z.array(campaignSchema) }),
    mock: mockGetCampaigns,
  });
  return campaigns;
}

const campaignDeliverableSchema = z.object({
  id: z.string().min(1),
  type: deliverableTypeSchema,
  // e.g. "2 Stories".
  title: z.string().min(1),
  // Where it's at, e.g. "Pending shoot"; null when there's nothing to add.
  note: z.string().min(1).nullable(),
  // Pieces in, of `total`.
  done: z.number().int().nonnegative(),
  total: z.number().int().positive(),
});
export type CampaignDeliverable = z.infer<typeof campaignDeliverableSchema>;

const campaignDetailsSchema = campaignSchema.extend({
  // The teammate who brought the lead in.
  owner: personSchema.extend({ phone: phoneSchema.nullable() }).nullable(),
  // Who's running it; the first is the primary.
  assignees: z.array(personSchema),
  email: z.email().nullable(),
  // Bare host, e.g. "zostel.com".
  website: z
    .string()
    .regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/)
    .nullable(),
  // The brand's brief, in full; null when there's none.
  message: z.string().min(1).nullable(),
  // The lead's, shared.
  requirements: brandRequirementsSchema,
  deliverables: z.array(campaignDeliverableSchema),
  addOns: z.array(talentRoleSchema),
  // Rupees: the brand's budget, every creator's fee added up, and what the agency earns. Each
  // null until it's known.
  payment: z.object({
    brandBudget: z.number().nonnegative().nullable(),
    creatorBudget: z.number().nonnegative().nullable(),
    estimatePayout: z.number().nullable(),
  }),
});
export type CampaignDetails = z.infer<typeof campaignDetailsSchema>;

const campaignPath = (id: string) => `/campaigns/${encodeURIComponent(idSchema.parse(id))}`;
const campaignResponse = z.object({ campaign: campaignDetailsSchema });

export async function getCampaign(id: string): Promise<CampaignDetails> {
  const { campaign } = await mockApiRequest({
    method: 'GET',
    path: campaignPath(id),
    response: campaignResponse,
    mock: () => mockGetCampaign(idSchema.parse(id)),
  });
  return campaign;
}

// "Mark Closed": closes it at 100%. Returns the campaign as it is now.
export async function completeCampaign(
  id: string,
  idempotencyKey: string,
): Promise<CampaignDetails> {
  const { campaign } = await mockApiRequest({
    method: 'POST',
    path: `${campaignPath(id)}/complete`,
    response: campaignResponse,
    idempotencyKey,
    mock: () => mockCompleteCampaign(idSchema.parse(id)),
  });
  return campaign;
}

const setAssigneesRequest = z.object({
  // The first is the primary. Empty unassigns everyone.
  memberIds: z.array(idSchema).max(ASSIGNEES_MAX),
});

export async function setCampaignAssignees(
  id: string,
  memberIds: string[],
): Promise<CampaignDetails> {
  const { campaign } = await mockApiRequest({
    method: 'PUT',
    path: `${campaignPath(id)}/assignees`,
    request: setAssigneesRequest,
    body: { memberIds },
    response: campaignResponse,
    mock: (payload) => mockSetCampaignAssignees(idSchema.parse(id), payload),
  });
  return campaign;
}

// Replaces the brand's requirements, which the campaign shares with its lead. Returns the
// campaign as it is now.
export async function setCampaignRequirements(
  id: string,
  requirements: SetRequirementsInput,
): Promise<CampaignDetails> {
  const { campaign } = await mockApiRequest({
    method: 'PUT',
    path: `${campaignPath(id)}/requirements`,
    request: setRequirementsRequest,
    body: requirements,
    response: campaignResponse,
    mock: (payload) => mockSetCampaignRequirements(idSchema.parse(id), payload),
  });
  return campaign;
}

// Adds to what the campaign is scoped to make. Returns the campaign as it is now.
export async function addCampaignDeliverables(
  id: string,
  input: AddDeliverablesInput,
  // One per tap on Add, reused if that tap is retried.
  idempotencyKey: string,
): Promise<CampaignDetails> {
  const { campaign } = await mockApiRequest({
    method: 'POST',
    path: `${campaignPath(id)}/deliverables`,
    request: addDeliverablesRequest,
    body: input,
    response: campaignResponse,
    idempotencyKey,
    mock: (payload) => mockAddCampaignDeliverables(idSchema.parse(id), payload),
  });
  return campaign;
}

const deliverablePath = (id: string, deliverableId: string) =>
  `${campaignPath(id)}/deliverables/${encodeURIComponent(idSchema.parse(deliverableId))}`;

export async function updateCampaignDeliverable(
  id: string,
  deliverableId: string,
  input: UpdateDeliverableInput,
): Promise<CampaignDetails> {
  const { campaign } = await mockApiRequest({
    method: 'PUT',
    path: deliverablePath(id, deliverableId),
    request: updateDeliverableRequest,
    body: input,
    response: campaignResponse,
    mock: (payload) =>
      mockUpdateCampaignDeliverable(idSchema.parse(id), idSchema.parse(deliverableId), payload),
  });
  return campaign;
}

export async function removeCampaignDeliverable(
  id: string,
  deliverableId: string,
): Promise<CampaignDetails> {
  const { campaign } = await mockApiRequest({
    method: 'DELETE',
    path: deliverablePath(id, deliverableId),
    response: campaignResponse,
    mock: () => mockRemoveCampaignDeliverable(idSchema.parse(id), idSchema.parse(deliverableId)),
  });
  return campaign;
}
