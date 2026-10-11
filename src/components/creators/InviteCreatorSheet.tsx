import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import {
  SectionTitle,
  SelectField,
  SheetField,
  ToggleChip,
} from '@/components/creators/InviteFields';
import {
  AGE_RANGE_LABELS,
  CREATOR_PLATFORM_STYLES,
  GENDER_LABELS,
  NICHE_OPTIONS,
  TIER_LABELS,
} from '@/components/creators/labels';
import { toggle } from '@/components/talent/BookingChips';
import { useCreateCreator } from '@/hooks/useCreators';
import {
  ageRangeSchema,
  type AgeRange,
  CREATOR_BIO_MAX,
  CREATOR_LOCATION_MAX,
  CREATOR_NAME_MAX,
  CREATOR_TEXT_MAX,
  type CreateCreatorRequest,
  createCreatorRequest,
  type CreatorDetails,
  type CreatorGender,
  creatorGenderSchema,
  type CreatorPlatform,
  creatorPlatformSchema,
  type CreatorTier,
  creatorTierSchema,
} from '@/services/creatorsService';
import { newIdempotencyKey } from '@/utils/api';
import {
  normalizePhone,
  sanitizeDecimal,
  sanitizeDigits,
  sanitizeEmailInput,
  sanitizeHandleInput,
  sanitizeLeadText,
  sanitizePhoneInput,
  splitNiches,
} from '@/utils/sanitize';

// "Add Creator" sheet on the roster: the creator's details, platforms, numbers and rates, niche
// and (optionally) home address. Send Invite adds them to the roster as invited.

// Every field as typed; toRequest shapes it for the API.
interface CreatorDraft {
  name: string;
  handle: string;
  email: string;
  phone: string;
  location: string;
  tier: CreatorTier | null;
  gender: CreatorGender | null;
  language: string;
  ageRange: AgeRange | null;
  bio: string;
  platforms: CreatorPlatform[];
  followers: string;
  avgViews: string;
  engagementRate: string;
  cpv: string;
  rating: string;
  ratePerPost: string;
  managedBy: string;
  niche: string | null;
  // Comma-separated.
  categories: string;
  line1: string;
  line2: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
}

// The plain text fields, which `text` below can fill.
type TextKey = {
  [K in keyof CreatorDraft]: CreatorDraft[K] extends string ? K : never;
}[keyof CreatorDraft];

const EMPTY: CreatorDraft = {
  name: '',
  handle: '',
  email: '',
  phone: '',
  location: '',
  tier: null,
  gender: null,
  language: '',
  ageRange: null,
  bio: '',
  platforms: [],
  followers: '',
  avgViews: '',
  engagementRate: '',
  cpv: '',
  rating: '',
  ratePerPost: '',
  managedBy: '',
  niche: null,
  categories: '',
  line1: '',
  line2: '',
  area: '',
  city: '',
  state: '',
  pincode: '',
};

const optional = (value: string) => value.trim() || null;
const optionalNumber = (value: string) => (value ? Number(value) : null);

// The draft as the API takes it, for the sheet to validate. A phone number that can't be
// normalized is passed as typed, so validation says what's wrong with it.
function toRequest(draft: CreatorDraft): CreateCreatorRequest {
  const phone = optional(draft.phone);
  const address = [draft.line1, draft.line2, draft.area, draft.city, draft.state, draft.pincode];
  return {
    name: draft.name.trim(),
    handle: draft.handle,
    email: draft.email,
    phone: phone && (normalizePhone(phone) ?? phone),
    location: optional(draft.location),
    tier: draft.tier,
    gender: draft.gender,
    language: optional(draft.language),
    ageRange: draft.ageRange,
    bio: optional(draft.bio),
    platforms: draft.platforms,
    followers: optionalNumber(draft.followers),
    avgViews: optionalNumber(draft.avgViews),
    engagementRate: optionalNumber(draft.engagementRate),
    cpv: optionalNumber(draft.cpv),
    rating: optionalNumber(draft.rating),
    ratePerPost: optionalNumber(draft.ratePerPost),
    managedBy: optional(draft.managedBy),
    niche: draft.niche,
    categories: splitNiches(draft.categories),
    // Left out entirely unless something's typed in it.
    address: address.some((part) => part.trim())
      ? {
          line1: draft.line1.trim(),
          line2: optional(draft.line2),
          area: optional(draft.area),
          city: draft.city.trim(),
          state: draft.state.trim(),
          pincode: draft.pincode,
        }
      : null,
  };
}

const options = <T extends string>(labels: Record<T, string>, values: readonly T[]) =>
  values.map((value) => ({ value, label: labels[value] }));

const TIER_OPTIONS = options(TIER_LABELS, creatorTierSchema.options);
const GENDER_OPTIONS = options(GENDER_LABELS, creatorGenderSchema.options);
const AGE_OPTIONS = options(AGE_RANGE_LABELS, ageRangeSchema.options);
const NICHE_SELECT = NICHE_OPTIONS.map((niche) => ({ value: niche, label: niche }));

const COUNT_DIGITS = 10;
const RATE_DIGITS = 8;

interface InviteCreatorSheetProps {
  visible: boolean;
  onClose: () => void;
  onInvited: (creator: CreatorDetails) => void;
}

export function InviteCreatorSheet({ visible, onClose, onInvited }: InviteCreatorSheetProps) {
  const create = useCreateCreator();
  const [draft, setDraft] = useState<CreatorDraft>(EMPTY);
  const request = createCreatorRequest.safeParse(toRequest(draft));

  const set = <K extends keyof CreatorDraft>(key: K, next: CreatorDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: next }));
    // Any change clears a failed attempt's error.
    if (create.isError) create.reset();
  };
  const text =
    (key: TextKey, max = CREATOR_TEXT_MAX) =>
    (next: string) =>
      set(key, sanitizeLeadText(next, max));

  const submit = () => {
    if (!request.success) return;
    create.mutate(
      { creator: request.data, idempotencyKey: newIdempotencyKey() },
      {
        onSuccess: (created) => {
          setDraft(EMPTY);
          onInvited(created);
        },
      },
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Add Creator">
      <ScrollView
        className="mt-5 shrink grow-0"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 16, paddingBottom: 4 }}
      >
        <SheetField
          label="Enter creator’s name"
          value={draft.name}
          onChangeText={text('name', CREATOR_NAME_MAX)}
          placeholder="Full Name"
          autoCapitalize="words"
          autoComplete="name"
        />
        <SheetField
          label="Handle"
          value={draft.handle}
          onChangeText={(next) => set('handle', sanitizeHandleInput(next))}
          placeholder="@leenabliss"
          autoCapitalize="none"
        />
        <SheetField
          label="Enter creator’s email address"
          value={draft.email}
          onChangeText={(next) => set('email', sanitizeEmailInput(next))}
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <SheetField
          label="Phone / WhatsApp"
          value={draft.phone}
          onChangeText={(next) => set('phone', sanitizePhoneInput(next))}
          placeholder="+91 98765 43210"
          keyboardType="phone-pad"
          autoComplete="tel"
        />
        <SheetField
          label="Location"
          value={draft.location}
          onChangeText={text('location', CREATOR_LOCATION_MAX)}
          placeholder="e.g. Mumbai, MH"
          autoCapitalize="words"
        />
        <View className="flex-row gap-3">
          <SelectField
            label="Tier"
            value={draft.tier}
            options={TIER_OPTIONS}
            onChange={(next) => set('tier', next)}
          />
          <SelectField
            label="Gender"
            value={draft.gender}
            options={GENDER_OPTIONS}
            onChange={(next) => set('gender', next)}
          />
        </View>
        <View className="flex-row gap-3">
          <SheetField
            label="Language"
            value={draft.language}
            onChangeText={text('language')}
            placeholder="e.g. Hindi"
            autoCapitalize="words"
          />
          <SelectField
            label="Age range"
            value={draft.ageRange}
            options={AGE_OPTIONS}
            onChange={(next) => set('ageRange', next)}
          />
        </View>
        <SheetField
          label="Bio"
          value={draft.bio}
          onChangeText={(next) =>
            set(
              'bio',
              next.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '').slice(0, CREATOR_BIO_MAX),
            )
          }
          placeholder="A line or two about the creator"
          multiline
        />

        <SectionTitle>Platforms</SectionTitle>
        <View className="flex-row flex-wrap gap-2">
          {creatorPlatformSchema.options.map((platform) => (
            <ToggleChip
              key={platform}
              label={CREATOR_PLATFORM_STYLES[platform].label}
              selected={draft.platforms.includes(platform)}
              onPress={() => set('platforms', toggle(draft.platforms, platform))}
            />
          ))}
        </View>

        <SectionTitle>Metrics & rate</SectionTitle>
        <View className="flex-row gap-3">
          <SheetField
            label="Followers"
            value={draft.followers}
            onChangeText={(next) => set('followers', sanitizeDigits(next, COUNT_DIGITS))}
            placeholder="0"
            keyboardType="number-pad"
          />
          <SheetField
            label="Avg. views"
            value={draft.avgViews}
            onChangeText={(next) => set('avgViews', sanitizeDigits(next, COUNT_DIGITS))}
            placeholder="0"
            keyboardType="number-pad"
          />
        </View>
        <View className="flex-row gap-3">
          <SheetField
            label="Engagement rate (%)"
            value={draft.engagementRate}
            onChangeText={(next) => set('engagementRate', sanitizeDecimal(next, 3))}
            placeholder="0.0"
            keyboardType="decimal-pad"
          />
          <SheetField
            label="CPV (₹)"
            value={draft.cpv}
            onChangeText={(next) => set('cpv', sanitizeDecimal(next, RATE_DIGITS))}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>
        <View className="flex-row gap-3">
          <SheetField
            label="Rating (0-5)"
            value={draft.rating}
            onChangeText={(next) => set('rating', sanitizeDecimal(next, 1, 1))}
            placeholder="0.0"
            keyboardType="decimal-pad"
          />
          <SheetField
            label="Rate / post (₹)"
            value={draft.ratePerPost}
            onChangeText={(next) => set('ratePerPost', sanitizeDigits(next, RATE_DIGITS))}
            placeholder="0"
            keyboardType="number-pad"
          />
        </View>
        <SheetField
          label="Managed by"
          value={draft.managedBy}
          onChangeText={text('managedBy')}
          placeholder="Teammate’s name"
          autoCapitalize="words"
        />

        <SectionTitle>Niche & categories</SectionTitle>
        <SelectField
          label="Niche"
          value={draft.niche}
          options={NICHE_SELECT}
          onChange={(next) => set('niche', next)}
        />
        <SheetField
          label="Categories"
          value={draft.categories}
          onChangeText={(next) =>
            set('categories', next.replace(/[\u0000-\u001F\u007F]/g, '').slice(0, 300))
          }
          placeholder="e.g. Skincare, Makeup"
          autoCapitalize="words"
        />

        <SectionTitle>Home address (optional)</SectionTitle>
        <SheetField
          label="Address line 1"
          value={draft.line1}
          onChangeText={text('line1')}
          placeholder="House no., building"
          autoCapitalize="words"
        />
        <SheetField
          label="Address line 2"
          value={draft.line2}
          onChangeText={text('line2')}
          placeholder="Street, landmark"
          autoCapitalize="words"
        />
        <View className="flex-row gap-3">
          <SheetField
            label="Area"
            value={draft.area}
            onChangeText={text('area')}
            placeholder="Area"
            autoCapitalize="words"
          />
          <SheetField
            label="City"
            value={draft.city}
            onChangeText={text('city')}
            placeholder="City"
            autoCapitalize="words"
          />
        </View>
        <View className="flex-row gap-3">
          <SheetField
            label="State"
            value={draft.state}
            onChangeText={text('state')}
            placeholder="State"
            autoCapitalize="words"
          />
          <SheetField
            label="Pincode"
            value={draft.pincode}
            onChangeText={(next) => set('pincode', sanitizeDigits(next, 6))}
            placeholder="400001"
            keyboardType="number-pad"
          />
        </View>
      </ScrollView>

      {create.isError ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-3 pl-1 font-inter-medium text-[13px] leading-4 text-rose-500"
        >
          We couldn’t send the invite. Please try again.
        </Text>
      ) : null}
      <View className="mt-4 px-[13px]">
        <Button
          label="Send Invite"
          onPress={submit}
          disabled={!request.success}
          disabledReason={request.error?.issues[0]?.message ?? null}
          loading={create.isPending}
        />
      </View>
    </BottomSheet>
  );
}
