import { z } from 'zod';

import {
  mockAddDeliverableLink,
  mockConvertLead,
  mockCreateLead,
  mockDeleteLead,
  mockGetLead,
  mockGetLeads,
} from '@/dummy/leads';
import { mockApiRequest } from '@/dummy/mockApi';
import { talentRoleSchema } from '@/services/talentService';
import { tolerantEnum } from '@/utils/schema';

// Brand enquiries the agency is working: the leads list, one lead's details, adding a lead by
// hand, and what can be done to a lead (convert it into a campaign, delete it, attach
// deliverable links).

const idSchema = z.string().regex(/^[A-Za-z0-9_-]+$/);

// "campaign": converted into a running campaign. "UNKNOWN" for anything newer; those only show
// under "All".
export const leadStatusSchema = tolerantEnum(['new', 'contacted', 'campaign']);
export type LeadStatus = z.infer<typeof leadStatusSchema>;

// A type the app doesn't know is shown as a post.
export const deliverableTypeSchema = z.enum(['reel', 'story', 'post']).catch('post');
export type DeliverableType = z.infer<typeof deliverableTypeSchema>;

// "barter": paid in kind (a stay, product), with `budget` as its value.
const dealTypeSchema = z.enum(['paid', 'barter']).catch('paid');
export type DealType = z.infer<typeof dealTypeSchema>;

// E.164, e.g. "+919812345678".
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
const phoneSchema = z.string().regex(PHONE_PATTERN);

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
  // e.g. "1 Reel".
  title: z.string().min(1),
  // Where it's at, e.g. "Needs script"; null when there's nothing to add.
  note: z.string().min(1).nullable(),
});
export type Deliverable = z.infer<typeof deliverableSchema>;

export const DELIVERABLE_LINK_MAX = 500;

// https only (see normalizeLink, which shapes links before they're sent).
const deliverableLinkUrlSchema = z.url({ protocol: /^https$/ }).max(DELIVERABLE_LINK_MAX);

const deliverableLinkSchema = z.object({
  id: z.string().min(1),
  url: deliverableLinkUrlSchema,
  addedAt: z.iso.datetime(),
});
export type DeliverableLink = z.infer<typeof deliverableLinkSchema>;

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

const leadDetailsSchema = leadSchema.extend({
  // The brand's campaign, e.g. "Winter in Manali"; null until it has one.
  campaign: z.string().min(1).nullable(),
  // null until someone is assigned.
  owner: ownerSchema.nullable(),
  email: z.email().nullable(),
  website: websiteHostSchema.nullable(),
  // The brand's opening message, in full; null when they sent none.
  message: z.string().min(1).nullable(),
  deliverables: z.array(deliverableSchema),
  // Newest first.
  links: z.array(deliverableLinkSchema),
  // Extra talent the brand wants booked with the deal.
  addOns: z.array(talentRoleSchema),
  payment: paymentSchema,
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

export async function deleteLead(id: string): Promise<void> {
  await mockApiRequest({
    method: 'DELETE',
    path: leadPath(id),
    response: z.object({ ok: z.literal(true) }),
    mock: () => mockDeleteLead(idSchema.parse(id)),
  });
}

const addLinkRequest = z.object({ url: deliverableLinkUrlSchema });
const addLinkResponse = z.object({ link: deliverableLinkSchema });

export async function addDeliverableLink(
  id: string,
  url: string,
  // One per tap on Submit, reused if that tap is retried.
  idempotencyKey: string,
): Promise<DeliverableLink> {
  const { link } = await mockApiRequest({
    method: 'POST',
    path: `${leadPath(id)}/links`,
    request: addLinkRequest,
    body: { url },
    response: addLinkResponse,
    idempotencyKey,
    mock: (payload) => mockAddDeliverableLink(idSchema.parse(id), payload),
  });
  return link;
}

// Adding a lead by hand, from the Add Lead screen. Request messages are what the screen shows
// when the Add Lead button is tapped too early, so they read as instructions.

export const leadPlatformSchema = z.enum(['instagram', 'youtube', 'facebook', 'linkedin', 'x']);
export type LeadPlatform = z.infer<typeof leadPlatformSchema>;

export const BRAND_NAME_MAX = 80;
export const CONTACT_NAME_MAX = 80;
export const EMAIL_MAX = 254;
export const NICHE_MAX = 30;
export const NICHES_MAX = 20;
export const DELIVERABLES_MAX = 120;
export const INFLUENCERS_MAX = 999;
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
    .max(DELIVERABLE_LINK_MAX)
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
