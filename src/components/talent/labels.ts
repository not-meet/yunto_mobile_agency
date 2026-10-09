import {
  type ContentType,
  type EditingStyle,
  type EditorAddOn,
  type ProjectType,
  type ShootSlot,
  type ShootTier,
  type TalentCategory,
  type TalentRole,
  talentRoleSchema,
  type VideoLength,
  type VideographerAddOn,
} from '@/services/talentService';

// Display copy for the talent screens.

// What talent is being browsed and booked for: a lead's add-on or a campaign's. Carried through
// the talent screens as a `leadId` or `campaignId` route param; `id` also keys the selection in
// the talent store.
export type BookingTarget = { kind: 'lead' | 'campaign'; id: string };

export function parseBookingTarget(params: {
  leadId?: string;
  campaignId?: string;
}): BookingTarget | null {
  if (params.leadId) return { kind: 'lead', id: params.leadId };
  if (params.campaignId) return { kind: 'campaign', id: params.campaignId };
  return null;
}

export function bookingTargetParams(
  target: BookingTarget | null,
): { leadId: string } | { campaignId: string } | Record<string, never> {
  if (!target) return {};
  return target.kind === 'lead' ? { leadId: target.id } : { campaignId: target.id };
}

export const ROLE_LABELS: Record<
  TalentRole,
  { singular: string; plural: string; tierHeading: string }
> = {
  videographer: {
    singular: 'Videographer',
    plural: 'Videographers',
    tierHeading: 'Select your shoot type',
  },
  editor: { singular: 'Editor', plural: 'Editors', tierHeading: 'Select your edit type' },
};

export const CATEGORY_LABELS: Record<TalentCategory, string> = {
  fashion: 'Fashion',
  travel: 'Travel',
  event: 'Event',
  makeup: 'Makeup',
  cinematic: 'Cinematic',
};

// Booking choices.
export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  reel: 'Instagram Reel',
  youtube: 'YouTube Video',
  ad: 'Brand Ad',
};

export const VIDEO_LENGTH_LABELS: Record<VideoLength, string> = {
  short: '< 30 sec',
  medium: '30–60 sec',
  long: '1–3 min',
};

export const EDITING_STYLE_LABELS: Record<EditingStyle, string> = {
  trendy: 'Trendy',
  cinematic: 'Cinematic',
  minimal: 'Minimal',
  storytelling: 'Storytelling',
};

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  'brand-campaign': 'Brand Campaign',
  'music-video': 'Music Video',
  'product-shoot': 'Product Shoot',
  'event-coverage': 'Event Coverage',
};

export const SHOOT_SLOT_LABELS: Record<ShootSlot, string> = {
  '09:00': '09:00 AM',
  '11:00': '11:00 AM',
  '14:00': '02:00 PM',
  '16:00': '04:00 PM',
  '18:00': '06:00 PM',
};

// What each tier buys, shown next to its price on a profile.
export const TIER_LABELS: Record<TalentRole, Record<ShootTier, string>> = {
  videographer: { basic: '2 hrs shoot', standard: '4 hrs shoot', premium: '8 hrs shoot' },
  editor: { basic: '1 reel edit', standard: '3 reels edit', premium: '5 reels edit' },
};

// The talent level each flame filters the deck to.
export const LEVEL_LABELS: Record<ShootTier, string> = {
  basic: 'Rookie',
  standard: 'Mid-level',
  premium: 'High profile',
};

export const EDITOR_ADD_ON_LABELS: Record<EditorAddOn, string> = {
  captions: 'Subtitles & Captions',
  thumbnail: 'Custom Thumbnail',
  grading: 'Color Grading',
  sound: 'Sound Design',
  express: 'Express Delivery',
};

export const VIDEOGRAPHER_ADD_ON_LABELS: Record<VideographerAddOn, string> = {
  drone: 'Drone Footage',
  'extra-hour': 'Extra Shoot Hour',
};

// "5 yrs exp. • Works with Nykaa, H&M".
export function experienceLine(years: number, brands: string[]): string {
  const exp = `${years} ${years === 1 ? 'yr' : 'yrs'} exp.`;
  return brands.length > 0 ? `${exp} • Works with ${brands.join(', ')}` : exp;
}

// The frosted pill look shared by the header and footer controls.
export const GLASS_SHADOW =
  '0px 4px 12px rgba(0, 0, 0, 0.03), inset 0px 2px 4px 1px rgba(255, 255, 255, 0.7)';

// The frosted cards on the booking screen.
export const SECTION_SHADOW = '0px 4px 16px rgba(0, 0, 0, 0.03)';

// The role lives in the route's `role` param; anything unrecognised means videographers.
export function parseTalentRole(raw: unknown): TalentRole {
  const role = talentRoleSchema.safeParse(raw);
  return role.success ? role.data : 'videographer';
}
