import { z } from 'zod';

import {
  mockAddLeadDeliverables,
  mockConvertLead,
  mockCreateLead,
  mockDeleteLead,
  mockGetLead,
  mockGetLeads,
  mockRemoveLeadDeliverable,
  mockSetLeadAssignees,
  mockSetLeadIntent,
  mockSetLeadRequirements,
  mockUpdateLeadDeliverable,
} from '@/dummy/leads';
import { mockApiRequest } from '@/dummy/mockApi';
import { talentRoleSchema } from '@/services/talentService';
import { tolerantEnum } from '@/utils/schema';

// Brand enquiries the agency is working: the leads list, one lead's details, adding a lead by
// hand, and what can be done to a lead (convert it into a campaign, delete it, set its intent,
// assign teammates, add to or change its deliverables).

const idSchema = z.string().regex(/^[A-Za-z0-9_-]+$/);

// "campaign": converted into a running campaign. "UNKNOWN" for anything newer; those only show
// under "All".
export const leadStatusSchema = tolerantEnum(['new', 'contacted', 'campaign']);
export type LeadStatus = z.infer<typeof leadStatusSchema>;

export const DELIVERABLE_TYPES = ['reel', 'post', 'story', 'ugc'] as const;
// A type the app doesn't know is shown as a post.
export const deliverableTypeSchema = z.enum(DELIVERABLE_TYPES).catch('post');
export type DeliverableType = z.infer<typeof deliverableTypeSchema>;

// "barter": paid in kind (a stay, product), with `budget` as its value.
const dealTypeSchema = z.enum(['paid', 'barter']).catch('paid');
export type DealType = z.infer<typeof dealTypeSchema>;

// How a barter's product reaches the creator: bought by the creator, or shipped by the brand.
export const productShipmentSchema = z.enum(['creator_buys', 'brand_ships']);
export type ProductShipment = z.infer<typeof productShipmentSchema>;

// E.164, e.g. "+919812345678".
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
const phoneSchema = z.string().regex(PHONE_PATTERN);

// How likely the brand is to close, as judged by the agency.
export const leadIntentSchema = z.enum(['low', 'medium', 'high']);
export type LeadIntent = z.infer<typeof leadIntentSchema>;

const leadSchema = z.object({
  id: idSchema,
  // The brand's contact person, e.g. "Priya Sharma".
  name: z.string().min(1),
  avatarUrl: z.url().nullable(),
  status: leadStatusSchema,
  // Nobody at the agency has replied yet.
  needsResponse: z.boolean(),
  // What the brand is asking for; one icon each on the card.
  contentTypes: z.array(deliverableTypeSchema),
  receivedAt: z.iso.datetime(),
  dealType: dealTypeSchema,
  // Rupees; null when the brand hasn't named one.
  budget: z.number().nonnegative().nullable(),
  // e.g. "Zostel Trip"; null when the enquiry didn't say.
  brand: z.string().min(1).nullable(),
  phone: phoneSchema.nullable(),
});
export type Lead = z.infer<typeof leadSchema>;

const getLeadsResponse = z.object({
  // Newest first.
  leads: z.array(leadSchema),
});

export async function getLeads(): Promise<Lead[]> {
  const { leads } = await mockApiRequest({
    method: 'GET',
    path: '/leads',
    response: getLeadsResponse,
    mock: mockGetLeads,
  });
  return leads;
}

const deliverableSchema = z.object({
  id: z.string().min(1),
  type: deliverableTypeSchema,
  // e.g. "2 Reels".
  title: z.string().min(1),
  // Its title or where it's at, e.g. "Launch week"; null when there's nothing to add.
  note: z.string().min(1).nullable(),
  // How many pieces, e.g. 2.
  quantity: z.number().int().positive(),
});
export type Deliverable = z.infer<typeof deliverableSchema>;

export const WEBSITE_MAX = 500;

// A teammate working the lead (or its campaign).
const assigneeSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  avatarUrl: z.url().nullable(),
});
export type Assignee = z.infer<typeof assigneeSchema>;

// Rupees: the deal amount, minus the agency's cut, is the creator's payout. Each null until
// it's agreed.
const paymentSchema = z.object({
  amount: z.number().nonnegative().nullable(),
  agencyFee: z.number().nonnegative().nullable(),
  payout: z.number().nonnegative().nullable(),
});
export type Payment = z.infer<typeof paymentSchema>;

// The agency teammate who brought the lead in and handles it.
const ownerSchema = z.object({
  name: z.string().min(1),
  avatarUrl: z.url().nullable(),
  phone: phoneSchema.nullable(),
});
export type LeadOwner = z.infer<typeof ownerSchema>;

// Bare host, e.g. "zostel.com".
const websiteHostSchema = z.string().regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/);

export const leadPlatformSchema = z.enum(['instagram', 'youtube', 'facebook', 'linkedin', 'x']);
export type LeadPlatform = z.infer<typeof leadPlatformSchema>;

// The brand's requirements, as a list alongside its brief (`message`): who and what it wants.
// Filled in when the lead is added by hand, and editable after; a lead from outside comes with
// whatever the brand gave, often nothing. Empty lists and nulls are "not given". A campaign
// shares its lead's.

export const requirementGenderSchema = z.enum(['female', 'male', 'other']);
export type RequirementGender = z.infer<typeof requirementGenderSchema>;

export const requirementAgeRangeSchema = z.enum(['18-24', '25-34', '35-44', '45+']);
export type RequirementAgeRange = z.infer<typeof requirementAgeRangeSchema>;

export const followerTierSchema = z.enum(['nano', 'micro', 'macro', 'mega']);
export type FollowerTier = z.infer<typeof followerTierSchema>;

export const NICHE_MAX = 30;
export const NICHES_MAX = 20;
export const INFLUENCERS_MAX = 999;
export const REQUIREMENT_LOCATION_MAX = 80;
export const REQUIREMENT_LANGUAGES_MAX = 10;
export const LANGUAGE_MAX = 30;

// Values the app doesn't know yet parse as "UNKNOWN" and aren't shown.
export const brandRequirementsSchema = z.object({
  platforms: z.array(tolerantEnum(leadPlatformSchema.options)),
  niches: z.array(z.string().min(1)),
  // e.g. "Agra".
  location: z.string().min(1).nullable(),
  // How many creators the brand wants.
  creators: z.number().int().positive().nullable(),
  genders: z.array(tolerantEnum(requirementGenderSchema.options)),
  languages: z.array(z.string().min(1)),
  ageRanges: z.array(tolerantEnum(requirementAgeRangeSchema.options)),
  followerTiers: z.array(tolerantEnum(followerTierSchema.options)),
  // "YYYY-MM-DD": when the content is due.
  dueDate: z.iso.date().nullable(),
});
export type BrandRequirements = z.infer<typeof brandRequirementsSchema>;

// Replaces them whole; clearing a field is sending it empty.
export const setRequirementsRequest = z.object({
  platforms: z.array(leadPlatformSchema).max(leadPlatformSchema.options.length),
  niches: z.array(z.string().trim().min(1).max(NICHE_MAX)).max(NICHES_MAX),
  location: z.string().trim().min(1).max(REQUIREMENT_LOCATION_MAX).nullable(),
  creators: z.number().int().min(1).max(INFLUENCERS_MAX).nullable(),
  genders: z.array(requirementGenderSchema).max(requirementGenderSchema.options.length),
  languages: z.array(z.string().trim().min(1).max(LANGUAGE_MAX)).max(REQUIREMENT_LANGUAGES_MAX),
  ageRanges: z.array(requirementAgeRangeSchema).max(requirementAgeRangeSchema.options.length),
  followerTiers: z.array(followerTierSchema).max(followerTierSchema.options.length),
  dueDate: z.iso.date().nullable(),
});
export type SetRequirementsInput = z.infer<typeof setRequirementsRequest>;

const leadDetailsSchema = leadSchema.extend({
  // The brand's campaign, e.g. "Winter in Manali"; null until it has one.
  campaign: z.string().min(1).nullable(),
  // null until someone is assigned.
  owner: ownerSchema.nullable(),
  // Teammates working it; the first is the primary.
  assignees: z.array(assigneeSchema),
  email: z.email().nullable(),
  website: websiteHostSchema.nullable(),
  // The brand's opening message, in full; null when they sent none.
  message: z.string().min(1).nullable(),
  requirements: brandRequirementsSchema,
  deliverables: z.array(deliverableSchema),
  // Extra talent the brand wants booked with the deal.
  addOns: z.array(talentRoleSchema),
  payment: paymentSchema,
  // null until someone has judged it. One the app doesn't know reads as not set.
  intent: leadIntentSchema.nullable().catch(null),
  // The campaign it was converted into; null until it's converted.
  campaignId: idSchema.nullable(),
});
export type LeadDetails = z.infer<typeof leadDetailsSchema>;

const leadPath = (id: string) => `/leads/${encodeURIComponent(idSchema.parse(id))}`;
const leadResponse = z.object({ lead: leadDetailsSchema });

export async function getLead(id: string): Promise<LeadDetails> {
  const { lead } = await mockApiRequest({
    method: 'GET',
    path: leadPath(id),
    response: leadResponse,
    mock: () => mockGetLead(idSchema.parse(id)),
  });
  return lead;
}

// Turns the lead into a campaign. Returns the lead as it is now.
export async function convertLead(id: string, idempotencyKey: string): Promise<LeadDetails> {
  const { lead } = await mockApiRequest({
    method: 'POST',
    path: `${leadPath(id)}/convert`,
    response: leadResponse,
    idempotencyKey,
    mock: () => mockConvertLead(idSchema.parse(id)),
  });
  return lead;
}

// Marks the lead deleted: it drops out of the list, with its notes and activity kept.
export async function deleteLead(id: string): Promise<void> {
  await mockApiRequest({
    method: 'DELETE',
    path: leadPath(id),
    response: z.object({ ok: z.literal(true) }),
    mock: () => mockDeleteLead(idSchema.parse(id)),
  });
}

const setIntentRequest = z.object({ intent: leadIntentSchema });

// Also moves a new lead to contacted. Returns the lead as it is now.
export async function setLeadIntent(id: string, intent: LeadIntent): Promise<LeadDetails> {
  const { lead } = await mockApiRequest({
    method: 'PUT',
    path: `${leadPath(id)}/intent`,
    request: setIntentRequest,
    body: { intent },
    response: leadResponse,
    mock: (payload) => mockSetLeadIntent(idSchema.parse(id), payload),
  });
  return lead;
}

export const ASSIGNEES_MAX = 20;
const setAssigneesRequest = z.object({
  // The first is the primary. Empty unassigns everyone.
  memberIds: z.array(idSchema).max(ASSIGNEES_MAX),
});
export type SetAssigneesRequest = z.infer<typeof setAssigneesRequest>;

export async function setLeadAssignees(id: string, memberIds: string[]): Promise<LeadDetails> {
  const { lead } = await mockApiRequest({
    method: 'PUT',
    path: `${leadPath(id)}/assignees`,
    request: setAssigneesRequest,
    body: { memberIds },
    response: leadResponse,
    mock: (payload) => mockSetLeadAssignees(idSchema.parse(id), payload),
  });
  return lead;
}

// Replaces the brand's requirements. A lead's campaign shares them. Returns the lead as it is now.
export async function setLeadRequirements(
  id: string,
  requirements: SetRequirementsInput,
): Promise<LeadDetails> {
  const { lead } = await mockApiRequest({
    method: 'PUT',
    path: `${leadPath(id)}/requirements`,
    request: setRequirementsRequest,
    body: requirements,
    response: leadResponse,
    mock: (payload) => mockSetLeadRequirements(idSchema.parse(id), payload),
  });
  return lead;
}

// Adding to and changing deliverables. A lead's campaign shares them, so campaignsService sends
// the same requests.

// Platforms deliverables can be added for.
export const deliverablePlatformSchema = z.enum(['instagram']);
export type DeliverablePlatform = z.infer<typeof deliverablePlatformSchema>;

export const DELIVERABLE_QUANTITY_MAX = 20;
export const DELIVERABLE_TITLE_MAX = 80;

const deliverableQuantitySchema = z.number().int().min(1).max(DELIVERABLE_QUANTITY_MAX);
// e.g. "Launch week"; null when none is given.
const deliverableTitleSchema = z.string().trim().min(1).max(DELIVERABLE_TITLE_MAX).nullable();

export const addDeliverablesRequest = z.object({
  platform: deliverablePlatformSchema,
  // One entry per type, each with how many pieces.
  items: z
    .array(z.object({ type: z.enum(DELIVERABLE_TYPES), quantity: deliverableQuantitySchema }))
    .min(1)
    .max(DELIVERABLE_TYPES.length),
  title: deliverableTitleSchema,
});
export type AddDeliverablesInput = z.infer<typeof addDeliverablesRequest>;

export const updateDeliverableRequest = z.object({
  quantity: deliverableQuantitySchema,
  title: deliverableTitleSchema,
});
export type UpdateDeliverableInput = z.infer<typeof updateDeliverableRequest>;

const deliverablePath = (id: string, deliverableId: string) =>
  `${leadPath(id)}/deliverables/${encodeURIComponent(idSchema.parse(deliverableId))}`;

// Returns the lead as it is now.
export async function addLeadDeliverables(
  id: string,
  input: AddDeliverablesInput,
  // One per tap on Add, reused if that tap is retried.
  idempotencyKey: string,
): Promise<LeadDetails> {
  const { lead } = await mockApiRequest({
    method: 'POST',
    path: `${leadPath(id)}/deliverables`,
    request: addDeliverablesRequest,
    body: input,
    response: leadResponse,
    idempotencyKey,
    mock: (payload) => mockAddLeadDeliverables(idSchema.parse(id), payload),
  });
  return lead;
}

export async function updateLeadDeliverable(
  id: string,
  deliverableId: string,
  input: UpdateDeliverableInput,
): Promise<LeadDetails> {
  const { lead } = await mockApiRequest({
    method: 'PUT',
    path: deliverablePath(id, deliverableId),
    request: updateDeliverableRequest,
    body: input,
    response: leadResponse,
    mock: (payload) =>
      mockUpdateLeadDeliverable(idSchema.parse(id), idSchema.parse(deliverableId), payload),
  });
  return lead;
}

export async function removeLeadDeliverable(
  id: string,
  deliverableId: string,
): Promise<LeadDetails> {
  const { lead } = await mockApiRequest({
    method: 'DELETE',
    path: deliverablePath(id, deliverableId),
    response: leadResponse,
    mock: () => mockRemoveLeadDeliverable(idSchema.parse(id), idSchema.parse(deliverableId)),
  });
  return lead;
}

// Adding a lead by hand, from the Add Lead screen. Request messages are what the screen shows
// when the Add Lead button is tapped too early, so they read as instructions.

export const BRAND_NAME_MAX = 80;
export const CONTACT_NAME_MAX = 80;
export const EMAIL_MAX = 254;
export const DELIVERABLES_MAX = 120;
// Rupees.
export const AMOUNT_MAX = 99_99_99_999;

const nicheSchema = z.string().trim().min(1).max(NICHE_MAX);
const amountSchema = z.number().int().nonnegative().max(AMOUNT_MAX);

// Everything but the brand and contact person is optional; what is given must be valid.
const newLeadFields = {
  platforms: z.array(leadPlatformSchema).min(1, 'Pick at least one platform'),
  niches: z.array(nicheSchema).min(1, 'Pick at least one niche').max(NICHES_MAX),
  brand: z.string().trim().min(1, 'Add the brand name').max(BRAND_NAME_MAX),
  website: z
    .url({ protocol: /^https$/, error: 'Enter a valid brand website' })
    .max(WEBSITE_MAX)
    .nullable(),
  email: z.email('Enter a valid email address').max(EMAIL_MAX).nullable(),
  contactName: z.string().trim().min(1, 'Add the contact person').max(CONTACT_NAME_MAX),
  phone: z.string().regex(PHONE_PATTERN, 'Enter a valid phone number').nullable(),
  // The paid budget, or what a barter is worth.
  budget: amountSchema.nullable(),
  influencers: z
    .number()
    .int()
    .min(1, 'Add at least one influencer')
    .max(INFLUENCERS_MAX)
    .nullable(),
  // e.g. "2 Reels + 1 Story".
  deliverables: z.string().trim().min(1).max(DELIVERABLES_MAX).nullable(),
};

export const createLeadRequest = z.discriminatedUnion('campaignType', [
  z.object({
    campaignType: z.literal('barter'),
    ...newLeadFields,
    // The agency's cut of a barter, paid in cash.
    agencyFee: amountSchema.nullable(),
    productShipment: productShipmentSchema.nullable(),
  }),
  z.object({ campaignType: z.literal('paid'), ...newLeadFields }),
]);
export type CreateLeadRequest = z.infer<typeof createLeadRequest>;

// The lead as it was added, for the confirmation screen.
const createdLeadSchema = z.object({
  id: idSchema,
  createdAt: z.iso.datetime(),
  campaignType: dealTypeSchema,
  // "UNKNOWN" for a platform the app doesn't know yet.
  platforms: z.array(tolerantEnum(leadPlatformSchema.options)),
  niches: z.array(z.string().min(1)),
  brand: z.string().min(1),
  website: websiteHostSchema.nullable(),
  email: z.email().nullable(),
  contactName: z.string().min(1),
  phone: phoneSchema.nullable(),
  budget: z.number().nonnegative().nullable(),
  // Barter only; null on a paid lead.
  agencyFee: z.number().nonnegative().nullable(),
  // Barter only; null on a paid lead or when not given. "UNKNOWN" for a newer option.
  productShipment: tolerantEnum(productShipmentSchema.options).nullable(),
  influencers: z.number().int().positive().nullable(),
  deliverables: z.string().min(1).nullable(),
});
export type CreatedLead = z.infer<typeof createdLeadSchema>;

export async function createLead(
  lead: CreateLeadRequest,
  // One per tap on Add Lead, reused if that tap is retried.
  idempotencyKey: string,
): Promise<CreatedLead> {
  const { lead: created } = await mockApiRequest({
    method: 'POST',
    path: '/leads',
    request: createLeadRequest,
    body: lead,
    response: z.object({ lead: createdLeadSchema }),
    idempotencyKey,
    mock: mockCreateLead,
  });
  return created;
}
