import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Calendar, X } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { FieldLabel } from '@/components/leads/FieldLabel';
import {
  FOLLOWER_TIER_LABELS,
  nicheTone,
  REQUIREMENT_AGE_LABELS,
  REQUIREMENT_GENDER_LABELS,
  REQUIREMENT_LANGUAGES,
} from '@/components/leads/labels';
import { NichePicker } from '@/components/leads/NichePicker';
import { PlatformPicker } from '@/components/leads/PlatformPicker';
import { TagChip } from '@/components/leads/TagChip';
import { toggle } from '@/components/talent/BookingChips';
import {
  type BrandRequirements,
  followerTierSchema,
  INFLUENCERS_MAX,
  leadPlatformSchema,
  REQUIREMENT_LANGUAGES_MAX,
  REQUIREMENT_LOCATION_MAX,
  requirementAgeRangeSchema,
  requirementGenderSchema,
  type SetRequirementsInput,
} from '@/services/leadsService';
import { PLACEHOLDER_COLOR } from '@/utils/constants';
import { fromDateKey, mediumDate, todayDate, toDateKey } from '@/utils/dates';
import { sanitizeDigits, sanitizeLeadText } from '@/utils/sanitize';

// Editing the brand's requirements on a lead or its campaign: platforms, niches, location,
// how many creators, gender, language, age, follower tiers and the due date. Every field can be
// left empty. The caller keys it per opening so it starts from what's saved, and closes it once
// the save succeeds.

const CREATOR_DIGITS = String(INFLUENCERS_MAX).length;

// Values the app doesn't know (UNKNOWN) can't be picked, so they're dropped from the draft.
const known =
  <T extends string>(options: readonly T[]) =>
  (values: readonly string[]): T[] =>
    values.filter((value): value is T => (options as readonly string[]).includes(value));

const knownPlatforms = known(leadPlatformSchema.options);
const knownGenders = known(requirementGenderSchema.options);
const knownAges = known(requirementAgeRangeSchema.options);
const knownTiers = known(followerTierSchema.options);

interface Draft extends Omit<SetRequirementsInput, 'location' | 'creators'> {
  location: string;
  // Digits only.
  creators: string;
}

function toDraft(requirements: BrandRequirements): Draft {
  return {
    platforms: knownPlatforms(requirements.platforms),
    niches: requirements.niches,
    location: requirements.location ?? '',
    creators: requirements.creators === null ? '' : String(requirements.creators),
    genders: knownGenders(requirements.genders),
    languages: requirements.languages,
    ageRanges: knownAges(requirements.ageRanges),
    followerTiers: knownTiers(requirements.followerTiers),
    dueDate: requirements.dueDate,
  };
}

function toRequest(draft: Draft): SetRequirementsInput {
  return {
    ...draft,
    location: draft.location.trim() || null,
    creators: draft.creators ? Number(draft.creators) : null,
  };
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </View>
  );
}

// Toggle chips for a multi-select field.
function Chips<T extends string>({
  options,
  labels,
  selected,
  onChange,
}: {
  options: readonly T[];
  labels: Record<T, string> | null;
  selected: T[];
  onChange: (next: T[]) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option, i) => (
        <TagChip
          key={option}
          label={labels ? labels[option] : option}
          tone={nicheTone(i)}
          size="md"
          selected={selected.includes(option)}
          onPress={() => onChange(toggle(selected, option))}
        />
      ))}
    </View>
  );
}

function Input({
  label,
  value,
  onChangeText,
  placeholder,
  numeric = false,
}: {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  placeholder: string;
  numeric?: boolean;
}) {
  return (
    <Section label={label}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={PLACEHOLDER_COLOR}
        keyboardType={numeric ? 'number-pad' : 'default'}
        autoCapitalize={numeric ? 'none' : 'words'}
        returnKeyType="done"
        accessibilityLabel={label}
        className="rounded-[18px] border border-[#EFEFEF] bg-[#F8F9FA] px-4 py-3.5 font-inter-medium text-sm leading-[21px] text-[#222222]"
      />
    </Section>
  );
}

interface RequirementsSheetProps {
  visible: boolean;
  onClose: () => void;
  initial: BrandRequirements;
  onSave: (requirements: SetRequirementsInput) => void;
  busy: boolean;
  error: string | null;
}

export function RequirementsSheet({
  visible,
  onClose,
  initial,
  onSave,
  busy,
  error,
}: RequirementsSheetProps) {
  const { height } = useWindowDimensions();
  const [start] = useState(() => toDraft(initial));
  const [draft, setDraft] = useState(start);
  const close = busy ? () => {} : onClose;
  const unchanged = JSON.stringify(toRequest(draft)) === JSON.stringify(toRequest(start));
  // Any the brand named that aren't offered are listed after the presets.
  const [languages] = useState(() => [
    ...REQUIREMENT_LANGUAGES,
    ...start.languages.filter((language) => !REQUIREMENT_LANGUAGES.includes(language)),
  ]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const pickDue = () => {
    const today = todayDate();
    DateTimePickerAndroid.open({
      value: draft.dueDate ? fromDateKey(draft.dueDate) : today,
      mode: 'date',
      minimumDate: today,
      onValueChange: (_, picked) => set('dueDate', toDateKey(picked)),
    });
  };

  return (
    <BottomSheet visible={visible} onClose={close} title="Brand Requirements">
      <ScrollView
        className="mt-4 grow-0"
        style={{ maxHeight: height * 0.6 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 22, paddingVertical: 4 }}
      >
        <PlatformPicker selected={draft.platforms} onChange={(next) => set('platforms', next)} />
        <NichePicker selected={draft.niches} onChange={(next) => set('niches', next)} />
        <Input
          label="Location"
          value={draft.location}
          onChangeText={(text) => set('location', sanitizeLeadText(text, REQUIREMENT_LOCATION_MAX))}
          placeholder="e.g. Agra"
        />
        <Input
          label="Creators"
          value={draft.creators}
          onChangeText={(text) => set('creators', sanitizeDigits(text, CREATOR_DIGITS))}
          placeholder="How many creators"
          numeric
        />
        <Section label="Gender">
          <Chips
            options={requirementGenderSchema.options}
            labels={REQUIREMENT_GENDER_LABELS}
            selected={draft.genders}
            onChange={(next) => set('genders', next)}
          />
        </Section>
        <Section label="Language">
          <Chips
            options={languages}
            labels={null}
            selected={draft.languages}
            onChange={(next) => set('languages', next.slice(0, REQUIREMENT_LANGUAGES_MAX))}
          />
        </Section>
        <Section label="Age range">
          <Chips
            options={requirementAgeRangeSchema.options}
            labels={REQUIREMENT_AGE_LABELS}
            selected={draft.ageRanges}
            onChange={(next) => set('ageRanges', next)}
          />
        </Section>
        <Section label="Followers">
          <Chips
            options={followerTierSchema.options}
            labels={FOLLOWER_TIER_LABELS}
            selected={draft.followerTiers}
            onChange={(next) => set('followerTiers', next)}
          />
        </Section>
        <Section label="Due">
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={pickDue}
              accessibilityRole="button"
              accessibilityLabel={
                draft.dueDate
                  ? `Due date, ${mediumDate(fromDateKey(draft.dueDate))}`
                  : 'Pick a due date'
              }
              className="flex-1 flex-row items-center justify-between rounded-[18px] border border-[#EFEFEF] bg-[#F8F9FA] px-4 py-3.5 active:opacity-80"
            >
              <Text
                className={`font-inter-medium text-sm leading-[21px] ${
                  draft.dueDate ? 'text-[#222222]' : 'text-[#BDB8C7]'
                }`}
              >
                {draft.dueDate ? mediumDate(fromDateKey(draft.dueDate)) : 'Pick a date'}
              </Text>
              <Calendar size={18} color="#6B7280" strokeWidth={1.5} />
            </Pressable>
            {draft.dueDate ? (
              <Pressable
                onPress={() => set('dueDate', null)}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Clear the due date"
                className="h-9 w-9 items-center justify-center rounded-full bg-[#F8F8F8] active:opacity-70"
              >
                <X size={16} color="#555555" strokeWidth={1.67} />
              </Pressable>
            ) : null}
          </View>
        </Section>
      </ScrollView>

      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-3 pl-1 font-inter-medium text-[13px] leading-4 text-rose-500"
        >
          {error}
        </Text>
      ) : null}
      <View className="mt-4">
        <Button
          label="Save requirements"
          onPress={() => onSave(toRequest(draft))}
          disabled={unchanged}
          disabledReason={unchanged ? 'Change a requirement first' : null}
          loading={busy}
        />
      </View>
    </BottomSheet>
  );
}
