import { z } from 'zod';

import {
  mockApproveLeadPayout,
  mockGetCampaignPayments,
  mockGetLeadPayments,
  mockSetCampaignAgencyFee,
  mockSetLeadAgencyFee,
  mockUpdateLeadPayout,
} from '@/dummy/campaigns';
import { mockApiRequest } from '@/dummy/mockApi';
import { tolerantEnum } from '@/utils/schema';

// The payment summary, as on the web: what the agency earns against the brand's budget, its own
// creators and each external agency's with their fees, the advance and the totals. Creators'
// payouts are agreed on the lead, along with the agency fees; once it's a campaign, only the
// agency fees can change.

const idSchema = z.string().regex(/^[A-Za-z0-9_-]+$/);

// Where the creator's fee stands with the agency managing them. "action_needed": they've
// proposed an amount that needs approving.
export const negotiationSchema = tolerantEnum(['action_needed', 'pending', 'agreed', 'rejected']);
export type Negotiation = z.infer<typeof negotiationSchema>;

const payoutSchema = z.object({
  // The creator's id on the lead.
  id: idSchema,
  name: z.string().min(1),
  // What they're making, e.g. "1 Reel · 2 Stories".
  deliverables: z.string().min(1).nullable(),
  // Rupees; null until agreed.
  amount: z.number().nonnegative().nullable(),
  // What they first asked for, when it was negotiated down.
  originalAmount: z.number().nonnegative().nullable(),
  negotiation: negotiationSchema,
});
export type CreatorPayout = z.infer<typeof payoutSchema>;

const payoutGroupSchema = z.object({
  // "internal" for the agency's own roster, else the managing agency's id.
  key: idSchema,
  // The managing agency; null for the agency's own roster.
  agency: z.string().min(1).nullable(),
  creators: z.array(payoutSchema),
  subtotal: z.number().nonnegative(),
  // The fee charged on the group's payouts; null when none is set.
  feePercent: z.number().min(0).max(100).nullable(),
  feeAmount: z.number().nonnegative().nullable(),
});
export type PayoutGroup = z.infer<typeof payoutGroupSchema>;

const paymentsSchema = z.object({
  invoiceUrl: z.url({ protocol: /^https$/ }).nullable(),
  brandBudget: z.number().nonnegative().nullable(),
  creatorBudget: z.number().nonnegative(),
  // Creator payouts + agency fees + GST.
  estimateSpend: z.number().nonnegative(),
  // Creator margin + agency fees: what the agency earns.
  estimatePayout: z.number(),
  // The agency's own roster first, then each external agency.
  groups: z.array(payoutGroupSchema),
  // Paid in by the brand so far; null when nothing has come in.
  advanceReceived: z.number().nonnegative().nullable(),
  totals: z.object({
    creatorPayouts: z.number().nonnegative(),
    agencyFees: z.number().nonnegative(),
    gst: z.number().nonnegative(),
    grandTotal: z.number().nonnegative(),
  }),
});
export type Payments = z.infer<typeof paymentsSchema>;

const paymentsResponse = z.object({ payments: paymentsSchema });
const leadPath = (id: string) => `/leads/${encodeURIComponent(idSchema.parse(id))}`;
const campaignPath = (id: string) => `/campaigns/${encodeURIComponent(idSchema.parse(id))}`;
const payoutPath = (leadId: string, creatorId: string) =>
  `${leadPath(leadId)}/payouts/${encodeURIComponent(idSchema.parse(creatorId))}`;

// The agency fee on one group's payouts, as a percentage of their subtotal.
const setFeeRequest = z.object({
  percent: z.number().min(0).max(100, 'At most 100%'),
});

// On a lead.

export async function getLeadPayments(id: string): Promise<Payments> {
  const { payments } = await mockApiRequest({
    method: 'GET',
    path: `${leadPath(id)}/payments`,
    response: paymentsResponse,
    mock: () => mockGetLeadPayments(idSchema.parse(id)),
  });
  return payments;
}

// Rupees.
export const PAYOUT_MAX = 99_99_99_999;
const updatePayoutRequest = z.object({
  amount: z.number().int().positive('Enter an amount').max(PAYOUT_MAX),
});

// Sets what the creator is paid. Returns the summary as it is now.
export async function updateLeadPayout(
  leadId: string,
  creatorId: string,
  amount: number,
): Promise<Payments> {
  const { payments } = await mockApiRequest({
    method: 'PUT',
    path: payoutPath(leadId, creatorId),
    request: updatePayoutRequest,
    body: { amount },
    response: paymentsResponse,
    mock: (payload) =>
      mockUpdateLeadPayout(idSchema.parse(leadId), idSchema.parse(creatorId), payload),
  });
  return payments;
}

// Agrees to the amount an external agency proposed. Returns the summary as it is now.
export async function approveLeadPayout(
  leadId: string,
  creatorId: string,
  idempotencyKey: string,
): Promise<Payments> {
  const { payments } = await mockApiRequest({
    method: 'POST',
    path: `${payoutPath(leadId, creatorId)}/approve`,
    response: paymentsResponse,
    idempotencyKey,
    mock: () => mockApproveLeadPayout(idSchema.parse(leadId), idSchema.parse(creatorId)),
  });
  return payments;
}

// Sets the agency fee on one group's payouts (`groupKey`, e.g. "internal"). Returns the summary
// as it is now.
export async function setLeadAgencyFee(
  id: string,
  groupKey: string,
  percent: number,
): Promise<Payments> {
  const { payments } = await mockApiRequest({
    method: 'PUT',
    path: `${leadPath(id)}/fees/${encodeURIComponent(idSchema.parse(groupKey))}`,
    request: setFeeRequest,
    body: { percent },
    response: paymentsResponse,
    mock: (payload) => mockSetLeadAgencyFee(idSchema.parse(id), idSchema.parse(groupKey), payload),
  });
  return payments;
}

// On a campaign.

export async function getCampaignPayments(id: string): Promise<Payments> {
  const { payments } = await mockApiRequest({
    method: 'GET',
    path: `${campaignPath(id)}/payments`,
    response: paymentsResponse,
    mock: () => mockGetCampaignPayments(idSchema.parse(id)),
  });
  return payments;
}

// Sets the agency fee on one group's payouts (`groupKey`, e.g. "internal"). Returns the summary
// as it is now.
export async function setCampaignAgencyFee(
  id: string,
  groupKey: string,
  percent: number,
): Promise<Payments> {
  const { payments } = await mockApiRequest({
    method: 'PUT',
    path: `${campaignPath(id)}/fees/${encodeURIComponent(idSchema.parse(groupKey))}`,
    request: setFeeRequest,
    body: { percent },
    response: paymentsResponse,
    mock: (payload) =>
      mockSetCampaignAgencyFee(idSchema.parse(id), idSchema.parse(groupKey), payload),
  });
  return payments;
}
