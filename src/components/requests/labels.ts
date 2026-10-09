import {
  type CampaignHireStatus,
  type CampaignStage,
  campaignStageSchema,
} from '@/services/talentCampaignService';

// Display copy and colours for the talent requests screen.

export const STAGE_LABELS: Record<CampaignStage, string> = {
  live: 'Live',
  'pending-delivery': 'Pending Delivery',
  shortlisted: 'Shortlisted',
};

interface StatusStyle {
  label: string;
  // Washed over the card from the top-left.
  tint: string;
  badgeBackground: string;
  badgeText: string;
}

// "UNKNOWN" has no badge (see NO_STATUS_TINT).
export const STATUS_STYLES: Record<Exclude<CampaignHireStatus, 'UNKNOWN'>, StatusStyle> = {
  attention: {
    label: 'Attention',
    tint: '#FFF3E0',
    badgeBackground: '#FDEBD8',
    badgeText: '#D9480F',
  },
  accepted: {
    label: 'Accepted',
    tint: '#E8F5E9',
    badgeBackground: '#E8F5EE',
    badgeText: '#2D8A55',
  },
  'pending-delivery': {
    label: 'Pending delivery',
    tint: '#E3EEFC',
    badgeBackground: '#E3EEFC',
    badgeText: '#2E60D1',
  },
};

// Card tint when the campaign has no status badge.
export const NO_STATUS_TINT = '#F3F3F3';

// The stage lives in the route's `stage` param; anything unrecognised shows live campaigns.
export function parseCampaignStage(raw: unknown): CampaignStage {
  const stage = campaignStageSchema.safeParse(raw);
  return stage.success ? stage.data : 'live';
}
