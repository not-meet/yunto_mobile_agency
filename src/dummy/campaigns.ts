import {
  mockAddLeadDeliverables,
  mockCampaignIdFor,
  mockGetLead,
  mockGetLeadCreators,
  mockGetLeads,
  mockLeadConvertedAt,
  mockRemoveLeadDeliverable,
  mockSetLeadRequirements,
  mockUpdateLeadDeliverable,
} from '@/dummy/leads';
import { mockGetMembers } from '@/dummy/team';
import { ApiError } from '@/utils/api';

// TEMPORARY fixtures + handlers for the campaigns screens. Delete with the folder.
//
// A campaign is a lead marked converted, as on the web: its brand, brief, deliverables, add-ons
// and creators are read from the lead fixtures (deliverables are added and changed there too), and
// only what's campaign-only (status, assignees) is kept here, with payout and fee changes by lead. In memory only, like the leads.

const HOUR_MS = 60 * 60_000;
const GST_RATE = 0.18;
// The agency's fee on its own roster, and on another agency's creators.
const INTERNAL_FEE_PERCENT = 15;
const EXTERNAL_FEE_PERCENT = 10;
// A group's key: "internal" for the agency's own creators, else the other agency's name, slugged.
const groupKeyOf = (agency: string | null) =>
  agency === null ? 'internal' : agency.toLowerCase().replace(/[^a-z0-9]+/g, '-');
// What each creator stage counts towards progress, as the web works it out.
const STAGE_PROGRESS = { pending: 25, shortlisted: 50, done: 100 } as const;

type MockStatus = 'draft' | 'upcoming' | 'live' | 'in_progress' | 'completed' | 'cancelled';
type MockDeliverableType = 'reel' | 'post' | 'story' | 'ugc';
type MockNegotiation = 'action_needed' | 'pending' | 'agreed' | 'rejected';

interface MockCampaignState {
  status: MockStatus;
  createdAt: string;
  assigneeIds: string[];
}

// Seeded campaigns take these in turn.
const SEED_STATUSES: MockStatus[] = ['live', 'in_progress', 'upcoming', 'completed'];
const SEED_ASSIGNEES = [['rahul', 'parul'], ['priya'], ['karan', 'neha']];

const states = new Map<string, MockCampaignState>();
// Payouts are agreed on the lead and carry over to its campaign; fees change on the campaign.
// Both by lead id.
const payoutChanges = new Map<
  string,
  Record<string, { amount?: number; negotiation?: MockNegotiation }>
>();
const feeChanges = new Map<string, Record<string, number>>();

const leadIdOf = (campaignId: string) => campaignId.replace(/^cmp_/, '');

function campaignLeads() {
  return mockGetLeads().leads.filter((l) => l.status === 'campaign');
}

function getState(leadId: string): MockCampaignState {
  const existing = states.get(leadId);
  if (existing) return existing;
  const convertedAt = mockLeadConvertedAt(leadId);
  const index = campaignLeads().findIndex((l) => l.id === leadId);
  const receivedAt = mockGetLead(leadId).lead.receivedAt;
  const state: MockCampaignState = {
    ...(convertedAt
      ? // Converted just now: a draft nobody's been put on yet.
        { status: 'draft' as const, createdAt: convertedAt, assigneeIds: [] }
      : {
          status: SEED_STATUSES[index % SEED_STATUSES.length] ?? 'live',
          createdAt: new Date(Date.parse(receivedAt) + 6 * HOUR_MS).toISOString(),
          assigneeIds: SEED_ASSIGNEES[index % SEED_ASSIGNEES.length] ?? [],
        }),
  };
  states.set(leadId, state);
  return state;
}

function findCampaign(campaignId: string) {
  const leadId = leadIdOf(campaignId);
  const lead = campaignLeads().find((l) => l.id === leadId);
  if (!lead) throw new ApiError('Campaign not found', 404, { message: 'Campaign not found' });
  return { lead: mockGetLead(leadId).lead, state: getState(leadId) };
}

function progressOf(leadId: string, state: MockCampaignState) {
  if (state.status === 'completed') return 100;
  const creators = mockGetLeadCreators(leadId).creators;
  if (creators.length === 0) return 0;
  const sum = creators.reduce((total, c) => total + STAGE_PROGRESS[c.status], 0);
  return Math.round(sum / creators.length);
}

function toListItem(campaignId: string) {
  const { lead, state } = findCampaign(campaignId);
  return {
    id: campaignId,
    leadId: lead.id,
    name: lead.campaign ?? lead.brand ?? lead.name,
    brand: lead.brand,
    contactName: lead.name,
    status: state.status,
    dealType: lead.dealType,
    budget: lead.budget,
    progress: progressOf(lead.id, state),
    creatorCount: mockGetLeadCreators(lead.id).creators.length,
    createdAt: state.createdAt,
    phone: lead.phone,
  };
}

function toDetails(campaignId: string) {
  const { lead, state } = findCampaign(campaignId);
  const members = mockGetMembers().members;
  const payments = summarise(leadIdOf(campaignId));
  return {
    ...toListItem(campaignId),
    owner: lead.owner
      ? { id: lead.owner.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), ...lead.owner }
      : null,
    assignees: state.assigneeIds.flatMap((id) => {
      const member = members.find((m) => m.id === id);
      return member ? [{ id: member.id, name: member.name, avatarUrl: member.avatarUrl }] : [];
    }),
    email: lead.email,
    website: lead.website,
    message: lead.message,
    requirements: lead.requirements,
    deliverables: lead.deliverables.map(({ quantity: total, ...d }) => {
      const done = state.status === 'completed' ? total : 0;
      return { ...d, note: done >= total ? 'All in' : d.note, done, total };
    }),
    addOns: lead.addOns,
    payment: {
      brandBudget: payments.brandBudget,
      creatorBudget: payments.creatorBudget,
      estimatePayout: payments.estimatePayout,
    },
  };
}

// GET /campaigns
export function mockGetCampaigns() {
  const campaigns = campaignLeads()
    .map((l) => toListItem(mockCampaignIdFor(l.id)))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return { campaigns };
}

// GET /campaigns/:id
export function mockGetCampaign(id: string) {
  return { campaign: toDetails(id) };
}

// POST /campaigns/:id/complete. Idempotent.
export function mockCompleteCampaign(id: string) {
  findCampaign(id).state.status = 'completed';
  return { campaign: toDetails(id) };
}

// PUT /campaigns/:id/assignees
export function mockSetCampaignAssignees(id: string, payload: { memberIds: string[] } | undefined) {
  findCampaign(id).state.assigneeIds = payload?.memberIds ?? [];
  return { campaign: toDetails(id) };
}

// PUT /campaigns/:id/requirements. Stored on the lead.
export function mockSetCampaignRequirements(
  id: string,
  payload: Parameters<typeof mockSetLeadRequirements>[1],
) {
  mockSetLeadRequirements(findCampaign(id).lead.id, payload);
  return { campaign: toDetails(id) };
}

// POST /campaigns/:id/deliverables. Added to the lead's.
export function mockAddCampaignDeliverables(
  id: string,
  payload:
    | {
        platform: 'instagram';
        items: { type: MockDeliverableType; quantity: number }[];
        title: string | null;
      }
    | undefined,
) {
  mockAddLeadDeliverables(findCampaign(id).lead.id, payload);
  return { campaign: toDetails(id) };
}

// PUT /campaigns/:id/deliverables/:deliverableId
export function mockUpdateCampaignDeliverable(
  id: string,
  deliverableId: string,
  payload: { quantity: number; title: string | null } | undefined,
) {
  mockUpdateLeadDeliverable(findCampaign(id).lead.id, deliverableId, payload);
  return { campaign: toDetails(id) };
}

// DELETE /campaigns/:id/deliverables/:deliverableId
export function mockRemoveCampaignDeliverable(id: string, deliverableId: string) {
  mockRemoveLeadDeliverable(findCampaign(id).lead.id, deliverableId);
  return { campaign: toDetails(id) };
}

// The payment summary, worked out the way the web's summarisePayments does.

function summarise(leadId: string) {
  const { lead } = mockGetLead(leadId);
  const status = campaignLeads().some((l) => l.id === leadId) ? getState(leadId).status : null;
  const changes = payoutChanges.get(leadId) ?? {};
  const fees = feeChanges.get(leadId) ?? {};
  const creators = mockGetLeadCreators(lead.id).creators;
  const deliverables = lead.deliverables.map((d) => d.title).join(' · ') || null;
  // An even share of 60% of the budget each, to the nearest ₹500.
  const share = Math.round(((lead.budget ?? 50_000) * 0.6) / Math.max(creators.length, 1) / 500);

  // Creators another agency manages are paid through that agency.
  const firstExternal = creators.findIndex((c) => c.managedBy !== null);
  const payouts = creators.map((creator, i) => {
    const override = changes[creator.id] ?? {};
    const agency = creator.managedBy;
    const amount = override.amount ?? Math.max(share, 1) * 500;
    // Every other creator was talked down from a higher ask.
    const asked = i % 2 === 1 ? Math.round((amount * 1.15) / 500) * 500 : null;
    return {
      agency,
      payout: {
        id: creator.id,
        name: creator.name,
        deliverables,
        amount,
        originalAmount: override.amount === undefined ? asked : null,
        negotiation: override.negotiation ?? (i === firstExternal ? 'action_needed' : 'agreed'),
      },
    };
  });

  const groupOf = (agency: string | null) => {
    const rows = payouts.filter((p) => p.agency === agency).map((p) => p.payout);
    const subtotal = rows.reduce((total, r) => total + r.amount, 0);
    const key = groupKeyOf(agency);
    const feePercent = fees[key] ?? (agency ? EXTERNAL_FEE_PERCENT : INTERNAL_FEE_PERCENT);
    return {
      key,
      agency,
      creators: rows,
      subtotal,
      feePercent,
      feeAmount: Math.round((subtotal * feePercent) / 100),
    };
  };
  const agencies = [...new Set(payouts.flatMap((p) => (p.agency ? [p.agency] : [])))];
  const groups = [groupOf(null), ...agencies.map(groupOf)].filter((g) => g.creators.length > 0);

  const creatorPayouts = groups.reduce((total, g) => total + g.subtotal, 0);
  const agencyFees = groups.reduce((total, g) => total + g.feeAmount, 0);
  const gst = Math.round((creatorPayouts + agencyFees) * GST_RATE);
  // What the agency keeps on its own creators it talked down.
  const margin = (groups[0]?.agency === null ? groups[0].creators : []).reduce(
    (total, c) => total + (c.originalAmount === null ? 0 : c.originalAmount - c.amount),
    0,
  );
  const started = status !== null && ['live', 'in_progress', 'completed'].includes(status);

  return {
    invoiceUrl: `https://app.yunto.ai/app/invoices/inv_${lead.id}`,
    brandBudget: lead.budget,
    creatorBudget: creatorPayouts,
    estimateSpend: creatorPayouts + agencyFees + gst,
    estimatePayout: agencyFees + margin,
    groups,
    advanceReceived: started && lead.budget !== null ? Math.round(lead.budget * 0.2) : null,
    totals: { creatorPayouts, agencyFees, gst, grandTotal: creatorPayouts + agencyFees + gst },
  };
}

function findPayout(leadId: string, creatorId: string) {
  if (!mockGetLeadCreators(leadId).creators.some((c) => c.id === creatorId)) {
    throw new ApiError('Creator not found', 404, { message: 'Creator not found' });
  }
  const changes = payoutChanges.get(leadId) ?? {};
  payoutChanges.set(leadId, changes);
  changes[creatorId] ??= {};
  return changes[creatorId];
}

// GET /leads/:id/payments
export function mockGetLeadPayments(id: string) {
  return { payments: summarise(id) };
}

// PUT /leads/:id/payouts/:creatorId
export function mockUpdateLeadPayout(
  id: string,
  creatorId: string,
  payload: { amount: number } | undefined,
) {
  if (!payload) throw new ApiError('Bad request', 400, { message: 'Bad request' });
  findPayout(id, creatorId).amount = payload.amount;
  return { payments: summarise(id) };
}

// POST /leads/:id/payouts/:creatorId/approve. Idempotent.
export function mockApproveLeadPayout(id: string, creatorId: string) {
  findPayout(id, creatorId).negotiation = 'agreed';
  return { payments: summarise(id) };
}

// GET /campaigns/:id/payments
export function mockGetCampaignPayments(id: string) {
  return { payments: summarise(findCampaign(id).lead.id) };
}

function setFee(leadId: string, groupKey: string, payload: { percent: number } | undefined) {
  if (!payload) throw new ApiError('Bad request', 400, { message: 'Bad request' });
  if (!summarise(leadId).groups.some((g) => g.key === groupKey)) {
    throw new ApiError('Group not found', 404, { message: 'Group not found' });
  }
  feeChanges.set(leadId, { ...feeChanges.get(leadId), [groupKey]: payload.percent });
  return { payments: summarise(leadId) };
}

// PUT /leads/:id/fees/:groupKey
export function mockSetLeadAgencyFee(
  id: string,
  groupKey: string,
  payload: { percent: number } | undefined,
) {
  return setFee(id, groupKey, payload);
}

// PUT /campaigns/:id/fees/:groupKey
export function mockSetCampaignAgencyFee(
  id: string,
  groupKey: string,
  payload: { percent: number } | undefined,
) {
  return setFee(findCampaign(id).lead.id, groupKey, payload);
}
