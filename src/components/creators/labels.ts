import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TiktokIcon,
  XIcon,
  YoutubeIcon,
} from '@/components/leads/PlatformIcons';
import type { PlatformIcon, TagTone } from '@/components/leads/labels';
import type { ContentStatus, ContentType } from '@/services/creatorCalendarService';
import {
  type AgeRange,
  type AvgViewsBand,
  type CampaignStatus,
  type CreatorDeliverable,
  type CreatorFilters,
  type CreatorGender,
  type CreatorPlatform,
  type CreatorService,
  FOLLOWERS_MAX,
  type CreatorScope,
  type CreatorSort,
  type CreatorTier,
  type RateSuggestion,
} from '@/services/creatorsService';
import { formatCount } from '@/utils/format';
import type { UNKNOWN } from '@/utils/schema';

// Display copy and option lists for the creators screens.

export const SCOPE_OPTIONS: { key: CreatorScope; label: string }[] = [
  { key: 'ours', label: 'Our Creators' },
  { key: 'all', label: 'All Creators' },
];

export const SORT_OPTIONS: { key: CreatorSort; label: string }[] = [
  { key: 'newest', label: 'Newest Added' },
  { key: 'engagement', label: 'Engagement Rate – High to Low' },
  { key: 'views', label: 'Avg. Views – High to Low' },
  { key: 'followers', label: 'Followers – High to Low' },
];

// The invite sheet's niches, as designed. Creators' niches are one of these.
export const NICHE_OPTIONS = [
  'Travel',
  'Artists & Films',
  'Fashion & Lifestyle',
  'Health & Fitness',
  'Beauty & Wellness',
  'Finance',
  'Crafts & DIY',
  'Other',
];

// The Filter sheet's options and copy, as on yunto-private.

export const SERVICE_LABELS: Record<CreatorService, string> = { paid: 'Paid', barter: 'Barter' };

export const DELIVERABLE_LABELS: Record<CreatorDeliverable, string> = {
  reel: '+ Reel',
  story: '+ Story',
  post: '+ Post',
  short: '+ Short',
  long_video: '+ Long Video',
  community_post: '+ Community Post',
};

// With a platform picked, only its deliverables are offered.
export const DELIVERABLES_BY_PLATFORM: Partial<Record<CreatorPlatform, CreatorDeliverable[]>> = {
  instagram: ['reel', 'story', 'post'],
  youtube: ['short', 'long_video', 'community_post'],
};

export const AVG_VIEWS_LABELS: Record<AvgViewsBand, string> = {
  '0-50k': '0 – 50K',
  '50k-100k': '50K – 100K',
  '100k-250k': '100K – 250K',
  '250k-500k': '250K – 500K',
  '500k-1m': '500K – 1M',
};

// Offered when no creator has a language set yet.
export const FALLBACK_LANGUAGES = ['English', 'Hindi', 'Tamil'];

// "1 – 1M" at the bottom, "1M+" at the top.
export function followersRangeLabel(min: number): string {
  if (min >= FOLLOWERS_MAX) return '1M+';
  return `${min <= 0 ? '1' : formatCount(min)} – 1M`;
}

export const AGE_RANGE_LABELS: Record<AgeRange, string> = {
  '13-18': '13 - 18',
  '19-25': '19 - 25',
  '26-35': '26 - 35',
  '36-50': '36 - 50',
  '50+': '50+',
};

export const GENDER_LABELS: Record<CreatorGender, string> = {
  female: 'Female',
  male: 'Male',
  lgbtq: 'LGBTQ+',
  other: 'Other',
};

export const TIER_LABELS: Record<CreatorTier, string> = {
  nano: 'Nano (1K–10K)',
  micro: 'Micro (10K–100K)',
  mid: 'Mid (100K–500K)',
  macro: 'Macro (500K–1M)',
  mega: 'Mega (1M+)',
};

export const SUGGESTION_LABELS: Record<RateSuggestion, string> = {
  increase: 'Increase',
  hold: 'Hold',
  decrease: 'Decrease',
  UNKNOWN: 'None',
};

// A recent campaign's pill on the creator's profile.
export const CAMPAIGN_STATUS_STYLES: Record<
  CampaignStatus,
  { label: string; color: string; background: string }
> = {
  active: { label: 'Active', color: '#3A5C7E', background: 'rgba(58, 92, 126, 0.1)' },
  upcoming: { label: 'Upcoming', color: '#3A5C7E', background: 'rgba(58, 92, 126, 0.1)' },
  completed: { label: 'Completed', color: '#3E7D52', background: 'rgba(62, 125, 82, 0.1)' },
  cancelled: { label: 'Cancelled', color: '#B7791F', background: 'rgba(214, 158, 46, 0.12)' },
  draft: { label: 'Draft', color: '#64748B', background: 'rgba(100, 116, 139, 0.1)' },
  UNKNOWN: { label: 'In progress', color: '#64748B', background: 'rgba(100, 116, 139, 0.1)' },
};

export const CREATOR_PLATFORM_STYLES: Record<
  CreatorPlatform | typeof UNKNOWN,
  { label: string; icon: PlatformIcon | null; tone: TagTone; tint: string; color: string }
> = {
  instagram: {
    label: 'Instagram',
    icon: InstagramIcon,
    tone: 'blue',
    tint: 'rgba(205, 215, 245, 0.35)',
    color: '#6A3A7E',
  },
  youtube: {
    label: 'YouTube',
    icon: YoutubeIcon,
    tone: 'purple',
    tint: 'rgba(255, 210, 210, 0.35)',
    color: '#CC3A3A',
  },
  facebook: {
    label: 'Facebook',
    icon: FacebookIcon,
    tone: 'amber',
    tint: 'rgba(205, 220, 255, 0.38)',
    color: '#3A5C7E',
  },
  linkedin: {
    label: 'LinkedIn',
    icon: LinkedinIcon,
    tone: 'green',
    tint: 'rgba(205, 220, 255, 0.38)',
    color: '#3A5C7E',
  },
  tiktok: {
    label: 'TikTok',
    icon: TiktokIcon,
    tone: 'red',
    tint: 'rgba(255, 205, 225, 0.35)',
    color: '#141311',
  },
  x: { label: 'X', icon: XIcon, tone: 'red', tint: 'rgba(230, 230, 230, 0.4)', color: '#141311' },
  UNKNOWN: {
    label: 'Other',
    icon: null,
    tone: 'blue',
    tint: 'rgba(230, 230, 230, 0.4)',
    color: '#555555',
  },
};

// The creator calendar's day tags, as in yunto_mobile_app: a gradient and 2-letter platform.
export const CALENDAR_TAGS: Record<
  CreatorPlatform | typeof UNKNOWN,
  { short: string; gradient: string }
> = {
  instagram: { short: 'IG', gradient: 'linear-gradient(111.25deg, #EC4899 0%, #D946EF 100%)' },
  youtube: { short: 'YT', gradient: 'linear-gradient(110.93deg, #EF4444 0%, #DC2626 100%)' },
  facebook: { short: 'FB', gradient: 'linear-gradient(108.68deg, #60A5FA 0%, #3A5C7E 100%)' },
  linkedin: { short: 'IN', gradient: 'linear-gradient(108.68deg, #3B82F6 0%, #2563EB 100%)' },
  tiktok: { short: 'TT', gradient: 'linear-gradient(108deg, #333333 0%, #141311 100%)' },
  x: { short: 'X', gradient: 'linear-gradient(108deg, #555555 0%, #1A1A1A 100%)' },
  UNKNOWN: { short: '··', gradient: 'linear-gradient(108deg, #A0A0A5 0%, #787486 100%)' },
};

// Brand collabs are tagged green on the calendar, whatever the platform.
export const BRAND_TAG = {
  color: '#059669',
  gradient: 'linear-gradient(107.81deg, #10B981 0%, #059669 100%)',
};

// The calendar's platform filter; "all" shows everything.
export type CalendarPlatformFilter = 'all' | CreatorPlatform;

export const CALENDAR_FILTERS: { key: CalendarPlatformFilter; label: string }[] = [
  { key: 'all', label: 'All Platforms' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'x', label: 'X' },
  { key: 'facebook', label: 'Facebook' },
];

export const CONTENT_TYPE_LABELS: Record<ContentType | typeof UNKNOWN, string> = {
  reel: 'Reel',
  post: 'Post',
  story: 'Story',
  carousel: 'Carousel',
  short: 'Short',
  integrated: 'Integrated',
  dedicated: 'Dedicated',
  ugc: 'UGC',
  UNKNOWN: 'Content',
};

export const CONTENT_STATUS_STYLES: Record<
  ContentStatus,
  { label: string; color: string; background: string }
> = {
  scheduled: { label: 'Scheduled', color: '#3E7D52', background: 'rgba(62, 125, 82, 0.1)' },
  draft: { label: 'Draft', color: '#B7791F', background: 'rgba(214, 158, 46, 0.12)' },
  posted: { label: 'Posted', color: '#5560CC', background: 'rgba(85, 96, 204, 0.1)' },
  UNKNOWN: { label: 'Planned', color: '#64748B', background: 'rgba(100, 116, 139, 0.1)' },
};

// How many filters are on, for the Filter chip.
export function countFilters(filters: CreatorFilters): number {
  const set = (value: unknown) => (value === null ? 0 : 1);
  return (
    set(filters.service) +
    set(filters.barterBudget) +
    set(filters.platform) +
    filters.deliverables.length +
    set(filters.niche) +
    (filters.minFollowers > 0 ? 1 : 0) +
    set(filters.location) +
    filters.genders.length +
    set(filters.avgViews) +
    set(filters.ageRange) +
    set(filters.language) +
    set(filters.budgetMax)
  );
}

export const pluralCreators = (count: number) => `${count} ${count === 1 ? 'Creator' : 'Creators'}`;
