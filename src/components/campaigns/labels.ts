import type { Campaign, CampaignStatus } from '@/services/campaignsService';
import type { Negotiation } from '@/services/paymentsService';
import { groupDigits } from '@/utils/format';

// Display copy, tints and filters for the campaigns screens.

interface StatusStyle {
  label: string;
  // Card and hero background.
  tint: string;
  border: string;
}

export const STATUS_STYLES: Record<CampaignStatus, StatusStyle> = {
  draft: { label: 'Draft', tint: '#F7F3EA', border: '#E8E2D9' },
  upcoming: { label: 'Upcoming', tint: '#E8F3FF', border: 'rgba(232, 229, 223, 0.2)' },
  live: { label: 'Live', tint: '#F2EDFF', border: '#E8E2D9' },
  in_progress: { label: 'In Progress', tint: '#FFECF3', border: 'rgba(232, 229, 223, 0.2)' },
  completed: { label: 'Completed', tint: '#E9F6ED', border: 'rgba(232, 229, 223, 0.2)' },
  cancelled: { label: 'Cancelled', tint: '#F4F1EC', border: '#E8E2D9' },
  UNKNOWN: { label: 'Other', tint: '#F4F1EC', border: '#E8E2D9' },
};

// Done with: nothing left to complete or cancel.
export const isClosed = (status: CampaignStatus) =>
  status === 'completed' || status === 'cancelled';

// The web's legacy tabs: drafts count as upcoming, and in progress as live.
export type CampaignFilter = 'all' | 'live' | 'upcoming' | 'completed';

export const FILTER_CHIPS: { key: CampaignFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
];

const FILTER_STATUSES: Record<Exclude<CampaignFilter, 'all'>, CampaignStatus[]> = {
  live: ['live', 'in_progress'],
  upcoming: ['draft', 'upcoming'],
  completed: ['completed'],
};

// The filter lives in the route's `filter` param; anything unrecognised shows everything.
export function parseCampaignFilter(raw: unknown): CampaignFilter {
  return FILTER_CHIPS.some((chip) => chip.key === raw) ? (raw as CampaignFilter) : 'all';
}

export function campaignMatches(campaign: Campaign, filter: CampaignFilter): boolean {
  return filter === 'all' || FILTER_STATUSES[filter].includes(campaign.status);
}

// Full rupees, e.g. "₹2,50,000"; a dash until it's known.
export function rupees(amount: number | null): string {
  return amount === null ? '—' : `₹${groupDigits(Math.round(amount))}`;
}

export const NEGOTIATION_STYLES: Record<
  Negotiation,
  { label: string; background: string; border: string; text: string }
> = {
  action_needed: {
    label: 'Approval needed',
    background: '#FEF2E6',
    border: '#FFEDD5',
    text: '#D97706',
  },
  pending: { label: 'Negotiating', background: '#F4F4F6', border: '#E7E5E4', text: '#57534E' },
  agreed: { label: 'Agreed', background: '#EAF7EE', border: '#D1FAE5', text: '#1B8341' },
  rejected: { label: 'Rejected', background: '#FFF1F1', border: '#F4BCBC', text: '#9B3232' },
  UNKNOWN: { label: 'Other', background: '#F4F4F6', border: '#E7E5E4', text: '#57534E' },
};

// Initials avatars down the payout list take these in turn.
const PAYOUT_TONES = [
  { background: '#E8D8F7', text: '#6941C6' },
  { background: '#EADCF8', text: '#7B4ECA' },
  { background: '#E5D7FA', text: '#6941C6' },
  { background: '#F3D7EC', text: '#9E3E8C' },
  { background: '#E4DDFB', text: '#6941C6' },
  { background: '#E8DAF7', text: '#7A45C3' },
];
export const payoutTone = (index: number) =>
  PAYOUT_TONES[index % PAYOUT_TONES.length] ?? { background: '#E8D8F7', text: '#6941C6' };

// Overlapping assignee initials take these in turn.
const ASSIGNEE_TONES = [
  { background: '#FEF3C7', text: '#92400E' },
  { background: '#FFE4E6', text: '#9F1239' },
  { background: '#E0F2FE', text: '#075985' },
];
export const assigneeTone = (index: number) =>
  ASSIGNEE_TONES[index % ASSIGNEE_TONES.length] ?? { background: '#FEF3C7', text: '#92400E' };

export const initialOf = (name: string) => name.trim().charAt(0).toUpperCase();
export const firstName = (name: string) => name.split(/\s+/)[0] ?? name;
