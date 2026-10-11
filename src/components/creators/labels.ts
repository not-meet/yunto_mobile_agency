import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TiktokIcon,
  XIcon,
  YoutubeIcon,
} from '@/components/leads/PlatformIcons';
import type { PlatformIcon, TagTone } from '@/components/leads/labels';
import type {
  AgeRange,
  CreatorFilters,
  CreatorGender,
  CreatorPlatform,
  CreatorScope,
  CreatorSort,
  CreatorTier,
  RateSuggestion,
} from '@/services/creatorsService';
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

// The filter sheet's niche chips, as designed. Creators' niches are one of these.
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

// Stops on the follower-range slider; the last one (null) is "any".
export const FOLLOWER_STOPS: (number | null)[] = [
  10_000,
  50_000,
  100_000,
  500_000,
  1_000_000,
  5_000_000,
  null,
];

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
  other: 'Others',
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

// How many filters are on, for the Filter chip.
export function countFilters(filters: CreatorFilters): number {
  return (
    filters.niches.length +
    (filters.maxFollowers === null ? 0 : 1) +
    filters.tags.length +
    (filters.ageRange === null ? 0 : 1) +
    filters.genders.length +
    filters.locations.length
  );
}

export const pluralCreators = (count: number) => `${count} ${count === 1 ? 'Creator' : 'Creators'}`;
