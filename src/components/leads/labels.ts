import {
  CirclePlay,
  Image as ImageIcon,
  type LucideIcon,
  Megaphone,
  Video,
} from 'lucide-react-native';
import type { ComponentType } from 'react';

import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  type PlatformIconProps,
  XIcon,
  YoutubeIcon,
} from '@/components/leads/PlatformIcons';
import type { CreatorPlatform, CreatorStatus } from '@/services/leadCreatorsService';
import type {
  DealType,
  DeliverableType,
  FollowerTier,
  Lead,
  LeadPlatform,
  LeadStatus,
  ProductShipment,
  RequirementAgeRange,
  RequirementGender,
} from '@/services/leadsService';
import type { UNKNOWN } from '@/utils/schema';

// Display copy, tints and filters for the leads screens.

interface StatusStyle {
  label: string;
  // Card and hero background.
  tint: string;
  border: string;
}

export const STATUS_STYLES: Record<LeadStatus, StatusStyle> = {
  new: { label: 'New', tint: '#E9F6ED', border: 'rgba(232, 229, 223, 0.2)' },
  contacted: { label: 'Contacted', tint: '#F2EDFF', border: '#E8E2D9' },
  campaign: { label: 'Campaign', tint: '#FFECF3', border: 'rgba(232, 229, 223, 0.2)' },
  UNKNOWN: { label: 'Other', tint: '#F4F1EC', border: '#E8E2D9' },
};

export const DEAL_LABELS: Record<DealType, string> = { paid: 'Paid', barter: 'Barter' };

export const PRODUCT_SHIPMENT_LABELS: Record<ProductShipment, string> = {
  creator_buys: 'Creator will buy',
  brand_ships: 'Brand will ship',
};

// Icon, plus the hue and tile tint the deliverables card uses.
export const CONTENT_STYLES: Record<
  DeliverableType,
  { label: string; icon: LucideIcon; color: string; background: string }
> = {
  reel: { label: 'Reel', icon: Video, color: '#C13FBA', background: '#FFF0F5' },
  story: { label: 'Story', icon: CirclePlay, color: '#8A5AFE', background: '#F3EBFF' },
  post: { label: 'Post', icon: ImageIcon, color: '#3776F2', background: '#EBF1FE' },
  ugc: { label: 'UGC Ads', icon: Megaphone, color: '#D97706', background: '#FEF2E6' },
};

// "needs-response" isn't a chip: "Review now" on the banner turns it on.
export type LeadFilter = 'all' | 'contacted' | 'new' | 'campaign' | 'needs-response';

// Chip order, as designed.
export const FILTER_CHIPS: { key: Exclude<LeadFilter, 'needs-response'>; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'new', label: 'New' },
  { key: 'campaign', label: 'Campaign' },
];

const FILTERS: readonly string[] = ['all', 'contacted', 'new', 'campaign', 'needs-response'];

// The filter lives in the route's `filter` param; anything unrecognised shows everything.
export function parseLeadFilter(raw: unknown): LeadFilter {
  return typeof raw === 'string' && FILTERS.includes(raw) ? (raw as LeadFilter) : 'all';
}

export function leadMatches(lead: Lead, filter: LeadFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'needs-response') return lead.needsResponse;
  return lead.status === filter;
}

// Pastel chip tones for platforms, niches and the added-lead summary.
export const TAG_TONES = {
  blue: { background: '#EDF2F6', border: '#C8DCEE', text: '#3A5C7E' },
  purple: { background: '#F5F0FA', border: '#DDD4EF', text: '#6A3A7E' },
  amber: { background: '#FEF9EE', border: '#F4E4BC', text: '#7E5C2A' },
  green: { background: '#F0F5F1', border: '#C5DEC5', text: '#3E5C45' },
  red: { background: '#FFF1F1', border: '#F4BCBC', text: '#9B3232' },
} as const;
export type TagTone = keyof typeof TAG_TONES;

// Niches take these in turn, in the order they're listed.
const NICHE_TONES: TagTone[] = ['amber', 'green', 'purple', 'blue', 'red'];
export const nicheTone = (index: number): TagTone =>
  NICHE_TONES[index % NICHE_TONES.length] ?? 'amber';

// Offered on the Add Lead screen before any are typed in.
export const PRESET_NICHES = ['Lifestyle', 'Travel', 'Fashion'];

export type PlatformIcon = ComponentType<PlatformIconProps>;

export const PLATFORM_STYLES: Record<
  LeadPlatform | typeof UNKNOWN,
  { label: string; icon: PlatformIcon | null; tone: TagTone }
> = {
  instagram: { label: 'Instagram', icon: InstagramIcon, tone: 'blue' },
  youtube: { label: 'YouTube', icon: YoutubeIcon, tone: 'purple' },
  facebook: { label: 'Facebook', icon: FacebookIcon, tone: 'amber' },
  linkedin: { label: 'LinkedIn', icon: LinkedinIcon, tone: 'green' },
  x: { label: 'X', icon: XIcon, tone: 'red' },
  UNKNOWN: { label: 'Other', icon: null, tone: 'blue' },
};

// Shown on the Add Lead screen up front; the rest are behind "Add".
export const DEFAULT_PLATFORMS: LeadPlatform[] = ['instagram', 'youtube'];

// A lead's creators.

export const CREATOR_STATUS_LABELS: Record<CreatorStatus, string> = {
  pending: 'Pending',
  shortlisted: 'Shortlisted',
  done: 'Done',
  UNKNOWN: 'Other',
};

// Creator cards take these in turn, down the list.
const CREATOR_TINTS = ['#F2EDFF', '#FFECF3', '#E8F3FF', '#E9F6ED', '#F7F3EA'];
export const creatorTint = (index: number): string =>
  CREATOR_TINTS[index % CREATOR_TINTS.length] ?? '#F2EDFF';

// A lead's creators board groups them by reach, in these bands, as on the web's.
export type ReachTier = 'mega' | 'macro' | 'micro' | 'nano';

export const REACH_TIERS: { key: ReachTier; label: string; heading: string; min: number }[] = [
  { key: 'mega', label: 'Mega', heading: 'Mega / Celebrity Creators (1M+)', min: 1_000_000 },
  { key: 'macro', label: 'Macro', heading: 'Macro Creators (250K – 1M)', min: 250_000 },
  { key: 'micro', label: 'Micro', heading: 'Micro Creators (50K – 250K)', min: 50_000 },
  { key: 'nano', label: 'Nano', heading: 'Nano Creators (Under 50K)', min: 0 },
];

export const reachTierOf = (followers: number): ReachTier =>
  REACH_TIERS.find((t) => followers >= t.min)?.key ?? 'nano';

export const CREATOR_PLATFORM_ICONS: Record<CreatorPlatform, PlatformIcon | null> = {
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  UNKNOWN: null,
};

// Gains in green, drops in red.
export const trendColor = (change: number): string => (change < 0 ? '#E74C3C' : '#23C16B');
export const signed = (change: number): string => `${change > 0 ? '+' : ''}${change}%`;

// The brand's requirements.

export const REQUIREMENT_GENDER_LABELS: Record<RequirementGender, string> = {
  female: 'Female',
  male: 'Male',
  other: 'Other',
};

export const REQUIREMENT_AGE_LABELS: Record<RequirementAgeRange, string> = {
  '18-24': '18 – 24',
  '25-34': '25 – 34',
  '35-44': '35 – 44',
  '45+': '45+',
};

export const FOLLOWER_TIER_LABELS: Record<FollowerTier, string> = {
  nano: 'Nano (10K – 50K)',
  micro: 'Micro (50K – 250K)',
  macro: 'Macro (250K – 1M)',
  mega: 'Mega (1M+)',
};

// Offered in the requirements sheet, plus any the brand already named.
export const REQUIREMENT_LANGUAGES = [
  'English',
  'Hindi',
  'Marathi',
  'Tamil',
  'Telugu',
  'Bengali',
  'Kannada',
];
