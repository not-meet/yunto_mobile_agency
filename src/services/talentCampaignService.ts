import { z } from 'zod';

import {
  mockConfirmCampaignRequest,
  mockGetCampaignChat,
  mockGetCampaignRequests,
  mockGetTalentCampaigns,
  mockSendChatMessage,
} from '@/dummy/talent';
import { mockApiRequest } from '@/dummy/mockApi';
import { indianStateSchema, talentRoleSchema } from '@/services/talentService';
import { tolerantEnum } from '@/utils/schema';

// Campaigns the creator is hiring talent for, and the talents they've swiped on for each.

const countSchema = z.number().int().nonnegative();

// Which list a campaign sits in on the talent requests screen.
export const campaignStageSchema = z.enum(['live', 'pending-delivery', 'shortlisted']);
export type CampaignStage = z.infer<typeof campaignStageSchema>;

// The badge on a campaign card. "UNKNOWN" (only pending requests so far) shows no badge.
export const campaignHireStatusSchema = tolerantEnum(['attention', 'accepted', 'pending-delivery']);
export type CampaignHireStatus = z.infer<typeof campaignHireStatusSchema>;

const talentCampaignSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    // The brand campaign it's for, e.g. "Urban Tech SS26".
    campaign: z.string().min(1),
    role: talentRoleSchema,
    stage: campaignStageSchema,
    status: campaignHireStatusSchema,
    // "YYYY-MM-DD", local calendar day; null when none is set (the chip is hidden).
    deadline: z.iso.date().nullable(),
    // Talents matching the brief, how many the creator swiped through, and of those, how many
    // accepted from both ends or were only shortlisted by the creator.
    pool: z.number().int().positive(),
    swiped: countSchema,
    accepted: countSchema,
    shortlisted: countSchema,
  })
  .refine((c) => c.swiped <= c.pool && c.accepted + c.shortlisted <= c.swiped, {
    message: 'Campaign counts don’t add up',
  });
export type TalentCampaign = z.infer<typeof talentCampaignSchema>;

const getTalentCampaignsResponse = z.object({ campaigns: z.array(talentCampaignSchema) });

export async function getTalentCampaigns(): Promise<TalentCampaign[]> {
  const { campaigns } = await mockApiRequest({
    method: 'GET',
    path: '/talent-campaigns',
    response: getTalentCampaignsResponse,
    mock: mockGetTalentCampaigns,
  });
  return campaigns;
}

// accepted: both ends said yes. pending: shortlisted by the creator, waiting on the talent.
// declined and completed make up the history.
export const campaignRequestStatusSchema = z.enum(['accepted', 'pending', 'declined', 'completed']);
export type CampaignRequestStatus = z.infer<typeof campaignRequestStatusSchema>;

// The talent on a request, as shown on its card. Nullable fields match GET /talents/{id}.
export const requestTalentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  specialty: z.string().min(1).nullable(),
  // null until they upload one; the app shows a placeholder.
  photoUrl: z.url({ protocol: /^https$/ }).nullable(),
  location: z.object({ area: z.string().min(1).nullable(), state: indianStateSchema }),
});
export type RequestTalent = z.infer<typeof requestTalentSchema>;

// Quoted rate in rupees.
export const rateSchema = countSchema;

const campaignRequestSchema = z.object({
  id: z.string().min(1),
  status: campaignRequestStatusSchema,
  talent: requestTalentSchema,
  // null when the talent hasn't quoted one (the price is hidden).
  rate: rateSchema.nullable(),
  // Short server-written line, e.g. "Accepted 2h ago".
  note: z.string().min(1),
});
export type CampaignRequest = z.infer<typeof campaignRequestSchema>;

const campaignIdSchema = z.string().regex(/^[A-Za-z0-9_-]+$/);
// The requests screen only gets these campaign fields, not the list-card ones.
const requestsCampaignSchema = z.object({
  title: z.string().min(1),
  role: talentRoleSchema,
  // The accepted request the creator confirmed for the campaign, null until they do.
  confirmedRequestId: z.string().min(1).nullable(),
});
const getCampaignRequestsResponse = z.object({
  campaign: requestsCampaignSchema,
  requests: z.array(campaignRequestSchema),
});
export type CampaignRequests = z.infer<typeof getCampaignRequestsResponse>;

// Confirm also returns the brand campaign's id, used to refresh that campaign.
const confirmCampaignRequestResponse = z.object({
  campaign: requestsCampaignSchema.extend({ campaignId: z.string().min(1) }),
  requests: z.array(campaignRequestSchema),
});
export type ConfirmedCampaignRequests = z.infer<typeof confirmCampaignRequestResponse>;

export function getCampaignRequests(id: string): Promise<CampaignRequests> {
  // Validated before it's interpolated into the path.
  const safeId = campaignIdSchema.parse(id);
  return mockApiRequest({
    method: 'GET',
    path: `/talent-campaigns/${encodeURIComponent(safeId)}/requests`,
    response: getCampaignRequestsResponse,
    mock: () => mockGetCampaignRequests(safeId),
  });
}

// Locks an accepted talent in for the campaign. Returns the campaign and its requests with the
// confirmation in place. 409 (`conflict`) when the request isn't accepted, or another talent is
// already confirmed; the error's message says which.
export function confirmCampaignRequest(
  campaignId: string,
  requestId: string,
): Promise<ConfirmedCampaignRequests> {
  const safeId = campaignIdSchema.parse(campaignId);
  const safeRequestId = campaignIdSchema.parse(requestId);
  return mockApiRequest({
    method: 'POST',
    path: `/talent-campaigns/${encodeURIComponent(safeId)}/requests/${encodeURIComponent(safeRequestId)}/confirm`,
    response: confirmCampaignRequestResponse,
    mock: () => mockConfirmCampaignRequest(safeId, safeRequestId),
  });
}

// The chat with an accepted talent, opened with the campaign's brief pinned on top.

export const CHAT_MESSAGE_MAX = 1000;

const briefSchema = z.object({
  // null when the campaign has no message, or the lead it came from no audience details.
  keyMessage: z.string().min(1).nullable(),
  targetAudience: z.string().min(1).nullable(),
  guidelines: z.array(z.string().min(1)),
  deliverables: z.array(z.string().min(1)),
  notes: z.array(z.string().min(1)),
});
export type CampaignBrief = z.infer<typeof briefSchema>;

const chatMessageSchema = z.object({
  id: z.string().min(1),
  // Who sent it: the creator or the talent.
  from: z.enum(['me', 'talent']),
  text: z.string().trim().min(1).max(CHAT_MESSAGE_MAX),
  sentAt: z.iso.datetime(),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

const campaignChatSchema = z.object({
  campaign: z.object({ title: z.string().min(1) }),
  talent: z.object({
    name: z.string().min(1),
    role: talentRoleSchema,
    // null until they upload one; the app shows a placeholder.
    photoUrl: z.url({ protocol: /^https$/ }).nullable(),
  }),
  // Everyone else in the chat (brand, manager...): a few photos, plus how many there are.
  participants: z.object({
    photoUrls: z.array(z.url({ protocol: /^https$/ })).max(2),
    total: countSchema,
  }),
  brief: briefSchema,
  // Oldest first.
  messages: z.array(chatMessageSchema),
});
export type CampaignChat = z.infer<typeof campaignChatSchema>;

const chatPath = (campaignId: string, requestId: string) =>
  `/talent-campaigns/${encodeURIComponent(campaignIdSchema.parse(campaignId))}/requests/${encodeURIComponent(campaignIdSchema.parse(requestId))}/chat`;

export function getCampaignChat(campaignId: string, requestId: string): Promise<CampaignChat> {
  return mockApiRequest({
    method: 'GET',
    path: chatPath(campaignId, requestId),
    response: campaignChatSchema,
    mock: () => mockGetCampaignChat(campaignId, requestId),
  });
}

const sendMessageRequest = z.object({ text: z.string().trim().min(1).max(CHAT_MESSAGE_MAX) });
// The sent message, plus any replies that came in meanwhile. 409 on a declined request.
const sendMessageResponse = z.object({ messages: z.array(chatMessageSchema).min(1) });

// `idempotencyKey`: one per user action (a tap on send), reused if that action is retried.
export async function sendChatMessage(
  campaignId: string,
  requestId: string,
  text: string,
  idempotencyKey: string,
): Promise<ChatMessage[]> {
  const { messages } = await mockApiRequest({
    method: 'POST',
    path: `${chatPath(campaignId, requestId)}/messages`,
    request: sendMessageRequest,
    body: { text },
    response: sendMessageResponse,
    idempotencyKey,
    mock: (payload) => mockSendChatMessage(campaignId, requestId, payload),
  });
  return messages;
}
