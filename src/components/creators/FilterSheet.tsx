import { Check, ChevronDown, MapPin, Sparkles, Square, SquareCheck, X } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, useReducedMotion } from 'react-native-reanimated';

import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { Switch } from '@/components/common/Switch';
import { FollowerRangeSlider } from '@/components/creators/FollowerRangeSlider';
import {
  AGE_RANGE_LABELS,
  AVG_VIEWS_LABELS,
  CREATOR_PLATFORM_STYLES,
  DELIVERABLE_LABELS,
  DELIVERABLES_BY_PLATFORM,
  FALLBACK_LANGUAGES,
  GENDER_LABELS,
  SERVICE_LABELS,
} from '@/components/creators/labels';
import { toggle } from '@/components/talent/BookingChips';
import {
  ageRangeSchema,
  avgViewsBandSchema,
  type CreatorFilters,
  type CreatorPlatform,
  creatorDeliverableSchema,
  creatorGenderSchema,
  type CreatorsPage,
  creatorServiceSchema,
  FILTER_BUDGET_MAX,
  NO_CREATOR_FILTERS,
} from '@/services/creatorsService';
import { PLACEHOLDER_COLOR } from '@/utils/constants';
import { groupDigits } from '@/utils/format';

// "Filters" sheet over the creators list, as on yunto-private: Creator AI, service (with the
// barter value), platform, deliverables, niche, followers, location, gender, average views, age,
// language, city and per-creator budget. Niche, location, platform, language and age options
// come from the creators in scope. Changes are a draft until Apply; Reset clears them all.

const GENDERS = creatorGenderSchema.options;
const BUDGET_DIGITS = String(FILTER_BUDGET_MAX).length;

type Dropdown = 'niche' | 'views' | 'age' | 'language' | 'city';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-2.5">
      <Text className="font-inter-medium text-[13px] leading-4 text-[#374151]">{title}</Text>
      {children}
    </View>
  );
}

// Black when on; a dashed outline for an unpicked deliverable. Without `onPress`, a placeholder.
function Pill({
  label,
  active,
  dashed = false,
  icon,
  onPress,
}: {
  label: string;
  active: boolean;
  dashed?: boolean;
  icon?: ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: active }}
      className={`h-[34px] flex-row items-center gap-1.5 rounded-full px-3.5 active:opacity-70 ${
        active
          ? 'bg-black'
          : `border bg-white ${dashed ? 'border-dashed border-[#D1D5DB]' : 'border-[#E5E7EB]'}`
      }`}
    >
      {icon}
      <Text
        className={`font-inter-medium text-[13px] leading-4 ${active ? 'text-white' : 'text-[#4B5563]'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// A field that opens an inline list underneath; picking one closes it.
function Select<T extends string>({
  label,
  summary,
  open,
  onToggle,
  options,
  selected,
  onPick,
  radio = false,
}: {
  label: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  options: { value: T; label: string }[];
  selected: T | null;
  onPick: (value: T) => void;
  // Radio circles (Average Views) instead of a check on the picked row.
  radio?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <View>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${summary}`}
        accessibilityState={{ expanded: open }}
        className="h-11 flex-row items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-3.5 active:opacity-80"
      >
        <Text className="font-inter text-sm leading-5 text-[#374151]">{summary}</Text>
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <ChevronDown size={16} color="#374151" strokeWidth={1.75} />
        </View>
      </Pressable>
      {open ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(180)}
          exiting={reduceMotion ? undefined : FadeOut.duration(120)}
          className={`mt-2 rounded-2xl border border-[#E5E7EB] bg-white p-2 ${radio ? 'gap-1.5' : ''}`}
          style={{ boxShadow: '0px 6px 20px rgba(16, 24, 40, 0.08)' }}
        >
          {options.map((option) => {
            const picked = option.value === selected;
            return (
              <Pressable
                key={option.value}
                onPress={() => onPick(option.value)}
                accessibilityRole={radio ? 'radio' : 'button'}
                accessibilityState={radio ? { checked: picked } : { selected: picked }}
                className={`h-10 flex-row items-center gap-2.5 rounded-xl px-3 active:bg-[#F3F4F6] ${
                  radio ? 'border border-[#E5E7EB]' : picked ? 'bg-[#F3F4F6]' : ''
                }`}
              >
                {radio ? (
                  <View className="h-[15px] w-[15px] items-center justify-center rounded-full border border-black">
                    {picked ? <View className="h-[7px] w-[7px] rounded-full bg-black" /> : null}
                  </View>
                ) : picked ? (
                  <Check size={14} color="#111827" strokeWidth={2} />
                ) : (
                  <View className="mx-[4.5px] h-[5px] w-[5px] rounded-full bg-[#D1D5DB]" />
                )}
                <Text
                  className={`flex-1 text-sm leading-5 text-[#111827] ${
                    picked ? 'font-inter-semibold' : 'font-inter'
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>
      ) : null}
    </View>
  );
}

// Rupees with Indian grouping behind a ₹; digits only.
function AmountField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: number | null;
  onChange: (next: number | null) => void;
}) {
  return (
    <View className="h-11 flex-row items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5">
      <Text className="font-inter text-sm leading-5 text-[#6B7280]">₹</Text>
      <TextInput
        value={value === null ? '' : groupDigits(value)}
        onChangeText={(text) => {
          const digits = text.replace(/\D/g, '').slice(0, BUDGET_DIGITS);
          onChange(digits ? Math.min(Number(digits), FILTER_BUDGET_MAX) : null);
        }}
        keyboardType="number-pad"
        placeholder={placeholder}
        placeholderTextColor={PLACEHOLDER_COLOR}
        accessibilityLabel={label}
        className="flex-1 py-0 font-inter text-sm leading-5 text-[#111827]"
      />
    </View>
  );
}

// Not wired to the list yet, as on yunto-private.
function CreatorAiCard() {
  const [on, setOn] = useState(true);
  const [website, setWebsite] = useState('');
  const [product, setProduct] = useState('');
  const field = (value: string, set: (next: string) => void, placeholder: string) => (
    <View className="h-10 flex-row items-center gap-2 rounded-xl border border-[#ECE6FF] bg-white px-3">
      <Sparkles size={13} color="#7A5AF8" strokeWidth={1.75} />
      <TextInput
        value={value}
        onChangeText={set}
        placeholder={placeholder}
        placeholderTextColor={PLACEHOLDER_COLOR}
        accessibilityLabel={placeholder}
        autoCapitalize="none"
        keyboardType="url"
        className="flex-1 py-0 font-inter text-[13px] leading-4 text-[#111827]"
      />
    </View>
  );

  return (
    <View className="gap-2.5 rounded-2xl border border-[#ECE6FF] bg-[#F6F4FF] p-3">
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#EEE9FF]">
          <Sparkles size={18} color="#7A5AF8" strokeWidth={1.75} />
        </View>
        <View className="flex-1">
          <Text className="font-inter-semibold text-sm leading-5 text-[#111827]">Creator AI</Text>
          <Text className="font-inter text-[10.5px] leading-[14px] text-[#6B7280]">
            Powered by AI, curated from 100k creator profiles
          </Text>
        </View>
        <Switch value={on} onValueChange={setOn} label="Creator AI" />
      </View>
      {field(website, setWebsite, 'Enter website')}
      {field(product, setProduct, 'Enter product page')}
    </View>
  );
}

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  value: CreatorFilters;
  onApply: (next: CreatorFilters) => void;
  // From the latest search; until it's in, only the fixed options show.
  facets: CreatorsPage['facets'] | undefined;
}

export function FilterSheet({ visible, onClose, value, onApply, facets }: FilterSheetProps) {
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState<Dropdown | null>(null);
  // Each opening starts from what's applied.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setDraft(value);
      setOpen(null);
    }
  }

  const set = <K extends keyof CreatorFilters>(key: K, next: CreatorFilters[K]) =>
    setDraft((current) => ({ ...current, [key]: next }));
  const pickFrom = (apply: () => void) => {
    apply();
    setOpen(null);
  };
  const toggleOpen = (dropdown: Dropdown) =>
    setOpen((current) => (current === dropdown ? null : dropdown));

  const niches = facets?.niches ?? [];
  const locations = facets?.locations ?? [];
  const platforms = facets?.platforms ?? [];
  const languages = facets?.languages.length ? facets.languages : FALLBACK_LANGUAGES;
  const ageRanges = facets?.ageRanges.length ? facets.ageRanges : ageRangeSchema.options;
  const deliverables = draft.platform
    ? (DELIVERABLES_BY_PLATFORM[draft.platform] ?? [])
    : creatorDeliverableSchema.options;

  const pickPlatform = (platform: CreatorPlatform) => {
    const next = draft.platform === platform ? null : platform;
    const offered = next ? (DELIVERABLES_BY_PLATFORM[next] ?? []) : null;
    setDraft((current) => ({
      ...current,
      platform: next,
      // Deliverables the new platform doesn't make are dropped.
      deliverables: offered
        ? current.deliverables.filter((d) => offered.includes(d))
        : current.deliverables,
    }));
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filters">
      <ScrollView
        className="mt-5 shrink grow-0"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 16, paddingBottom: 4 }}
      >
        <CreatorAiCard />

        <Section title="Choose Service">
          <View className="flex-row flex-wrap gap-2">
            {creatorServiceSchema.options.map((service) => (
              <Pill
                key={service}
                label={SERVICE_LABELS[service]}
                active={draft.service === service}
                onPress={() =>
                  setDraft((current) => ({
                    ...current,
                    service: current.service === service ? null : service,
                    // Only meaningful for barter.
                    barterBudget: null,
                  }))
                }
              />
            ))}
          </View>
        </Section>

        {draft.service === 'barter' ? (
          <Section title="Barter value · per creator">
            <AmountField
              label="Barter value per creator"
              placeholder="e.g. 4,000"
              value={draft.barterBudget}
              onChange={(next) => set('barterBudget', next)}
            />
            <Text className="font-inter text-[11px] leading-4 text-[#6B7280]">
              Hides creators whose agency will not work for this much.
            </Text>
          </Section>
        ) : null}

        <Section title="Platform">
          <View className="flex-row flex-wrap gap-2">
            {platforms.length > 0 ? (
              platforms.map((platform) => {
                const style = CREATOR_PLATFORM_STYLES[platform];
                const Icon = style.icon;
                const active = draft.platform === platform;
                return (
                  <Pill
                    key={platform}
                    label={style.label}
                    active={active}
                    icon={Icon ? <Icon size={14} color={active ? '#FFFFFF' : style.color} /> : null}
                    onPress={() => pickPlatform(platform)}
                  />
                );
              })
            ) : (
              <Pill label="No platforms" active={false} dashed />
            )}
          </View>
        </Section>

        <Section title="Deliverables">
          <View className="flex-row flex-wrap gap-2">
            {deliverables.map((deliverable) => (
              <Pill
                key={deliverable}
                label={DELIVERABLE_LABELS[deliverable]}
                active={draft.deliverables.includes(deliverable)}
                dashed
                onPress={() => set('deliverables', toggle(draft.deliverables, deliverable))}
              />
            ))}
          </View>
        </Section>

        <Section title="Niche">
          <Select
            label="Niche"
            summary={draft.niche ?? 'All Categories'}
            open={open === 'niche'}
            onToggle={() => toggleOpen('niche')}
            options={[
              { value: 'All', label: 'All Categories' },
              ...niches.map((niche) => ({ value: niche, label: niche })),
            ]}
            selected={draft.niche ?? 'All'}
            onPick={(niche) => pickFrom(() => set('niche', niche === 'All' ? null : niche))}
          />
        </Section>

        <Section title="Followers Range">
          <FollowerRangeSlider
            value={draft.minFollowers}
            onChange={(next) => set('minFollowers', next)}
          />
        </Section>

        <Section title="Location">
          <View className="flex-row flex-wrap gap-2">
            {locations.length > 0 ? (
              locations.map((city) => {
                const active = draft.location === city;
                return (
                  <Pill
                    key={city}
                    label={city}
                    active={active}
                    icon={active ? <X size={12} color="#FFFFFF" strokeWidth={2} /> : null}
                    onPress={() => set('location', active ? null : city)}
                  />
                );
              })
            ) : (
              <Pill
                label="location"
                active={false}
                dashed
                icon={<MapPin size={14} color="#4B5563" strokeWidth={1.75} />}
              />
            )}
          </View>
        </Section>

        <Section title="Gender">
          <View className="flex-row flex-wrap gap-4">
            {GENDERS.map((gender) => {
              const checked = draft.genders.includes(gender);
              const Box = checked ? SquareCheck : Square;
              return (
                <Pressable
                  key={gender}
                  onPress={() => set('genders', toggle(draft.genders, gender))}
                  hitSlop={6}
                  accessibilityRole="checkbox"
                  accessibilityLabel={GENDER_LABELS[gender]}
                  accessibilityState={{ checked }}
                  className="flex-row items-center gap-1 active:opacity-70"
                >
                  <Box size={16} color="#000000" strokeWidth={1.5} />
                  <Text
                    className={`text-[13px] leading-4 ${
                      checked ? 'font-inter-medium text-black' : 'font-inter text-black/70'
                    }`}
                  >
                    {GENDER_LABELS[gender]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="Average Views">
          <Select
            label="Average views"
            summary={draft.avgViews ? AVG_VIEWS_LABELS[draft.avgViews] : 'Select Views'}
            open={open === 'views'}
            onToggle={() => toggleOpen('views')}
            options={avgViewsBandSchema.options.map((band) => ({
              value: band,
              label: AVG_VIEWS_LABELS[band],
            }))}
            selected={draft.avgViews}
            // Picking the current band again clears it.
            onPick={(band) =>
              pickFrom(() => set('avgViews', band === draft.avgViews ? null : band))
            }
            radio
          />
        </Section>

        <Section title="By Age">
          <Select
            label="Age"
            summary={draft.ageRange ? AGE_RANGE_LABELS[draft.ageRange] : 'All'}
            open={open === 'age'}
            onToggle={() => toggleOpen('age')}
            options={[
              { value: 'all', label: 'All' },
              ...ageRanges.map((range) => ({ value: range, label: AGE_RANGE_LABELS[range] })),
            ]}
            selected={draft.ageRange ?? 'all'}
            onPick={(range) => pickFrom(() => set('ageRange', range === 'all' ? null : range))}
          />
        </Section>

        <Section title="Language">
          <Select
            label="Language"
            summary={draft.language ?? 'All'}
            open={open === 'language'}
            onToggle={() => toggleOpen('language')}
            options={[
              { value: '', label: 'All' },
              ...languages.map((language) => ({ value: language, label: language })),
            ]}
            selected={draft.language ?? ''}
            onPick={(language) => pickFrom(() => set('language', language || null))}
          />
        </Section>

        {/* The same city as the Location pills, picked from a list. */}
        <Section title="City">
          <Select
            label="City"
            summary={draft.location ?? 'All'}
            open={open === 'city'}
            onToggle={() => toggleOpen('city')}
            options={[
              { value: '', label: 'All' },
              ...locations.map((city) => ({ value: city, label: city })),
            ]}
            selected={draft.location ?? ''}
            onPick={(city) => pickFrom(() => set('location', city || null))}
          />
        </Section>

        <Section title="Per creator budget">
          <AmountField
            label="Per creator budget"
            placeholder="20,000"
            value={draft.budgetMax}
            onChange={(next) => set('budgetMax', next)}
          />
        </Section>
      </ScrollView>

      <View className="mt-5 flex-row gap-3">
        <View className="flex-1">
          <Button label="Reset" variant="secondary" onPress={() => setDraft(NO_CREATOR_FILTERS)} />
        </View>
        <View className="flex-1">
          <Button
            label="Apply"
            onPress={() => {
              onApply(draft);
              onClose();
            }}
          />
        </View>
      </View>
    </BottomSheet>
  );
}
