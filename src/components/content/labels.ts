import { CONTENT_TYPE_LABELS, CREATOR_PLATFORM_STYLES } from '@/components/creators/labels';
import type { BrandDeal } from '@/services/contentService';
import type { ContentType } from '@/services/creatorCalendarService';
import type { CreatorPlatform } from '@/services/creatorsService';

// The content editor's options and wording, as on the web's ContentEditor.

// The formats each platform takes; picking a platform keeps the type only if it fits.
export const PLATFORM_FORMATS: Record<CreatorPlatform, ContentType[]> = {
  instagram: ['reel', 'post', 'carousel', 'story'],
  youtube: ['short', 'dedicated', 'integrated'],
  facebook: ['post', 'reel', 'story'],
  linkedin: ['post', 'carousel'],
  tiktok: ['short'],
  x: ['post'],
};

export const DEALS: { key: BrandDeal; label: string }[] = [
  { key: 'paid', label: 'Paid' },
  { key: 'barter', label: 'Barter' },
  { key: 'hybrid', label: 'Paid + barter' },
];

export const DISCLOSURES = [
  'Disclosed in-frame',
  '#ad in caption',
  'Paid partnership tag',
] as const;

// The assistant's suggested asks, and the quick chips under the script.
export const PROMPTS = [
  'Improve this hook',
  'Make it more conversational',
  'Give me 3 variations',
  'Make this suitable for an Instagram Reel',
  'Add a stronger CTA',
];
export const CHIPS = [
  'Improve idea',
  'Make more engaging',
  'Generate hook',
  'Expand idea',
  'Make it shorter',
  'Punch up the hook',
  'Cut 20%',
  'Add a CTA',
];

// "Instagram Reel", or "Not set".
export function platformLabel(platform: CreatorPlatform | null, type: ContentType | null): string {
  return (
    [
      platform ? CREATOR_PLATFORM_STYLES[platform].label : null,
      type ? CONTENT_TYPE_LABELS[type] : null,
    ]
      .filter(Boolean)
      .join(' ') || 'Not set'
  );
}

// The badge over the script.
export function scriptKind(type: ContentType | null): string {
  if (type === 'reel' || type === 'short' || type === 'story') return 'Short vertical script';
  if (type === 'carousel') return 'Carousel copy';
  if (type === 'post') return 'Caption';
  return type ? 'Video script' : 'Content script';
}

// Insights' "Script type".
export function scriptType(type: ContentType | null): string {
  if (type === 'reel' || type === 'short') return 'Short vertical';
  return type ? CONTENT_TYPE_LABELS[type] : '—';
}

export const EDITOR_CARD_SHADOW = '0px 1px 2px rgba(0, 0, 0, 0.05)';
