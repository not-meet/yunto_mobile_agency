import {
  Check,
  ChevronDown,
  MapPin,
  Plus,
  Square,
  SquareCheck,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, useReducedMotion } from 'react-native-reanimated';

import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { FollowerRangeSlider } from '@/components/creators/FollowerRangeSlider';
import { AGE_RANGE_LABELS, GENDER_LABELS, NICHE_OPTIONS } from '@/components/creators/labels';
import { toggle } from '@/components/talent/BookingChips';
import {
  ageRangeSchema,
  CREATOR_LOCATION_MAX,
  CREATOR_TAG_MAX,
  type CreatorFilters,
  creatorGenderSchema,
  NO_CREATOR_FILTERS,
} from '@/services/creatorsService';
import { PLACEHOLDER_COLOR } from '@/utils/constants';
import { sanitizeLeadText } from '@/utils/sanitize';

// "Filter" sheet over the Creators list: niche, follower range, tags, age, gender and city.
// Changes are a draft until Apply; Reset clears them all.

const AGE_RANGES = ageRangeSchema.options;
const GENDERS = creatorGenderSchema.options;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-1">
      <Text className="font-inter-medium text-xs leading-6 text-black">{title}</Text>
      {children}
    </View>
  );
}

// A pill to add free text (a tag, a city): tap it and it turns into a field; Done adds what's
// typed.
function AddPill({
  label,
  icon: Icon,
  maxLength,
  onAdd,
}: {
  label: string;
  icon: LucideIcon;
  maxLength: number;
  onAdd: (text: string) => void;
}) {
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState('');

  const submit = () => {
    const value = text.trim();
    if (value) onAdd(value);
    setText('');
    setTyping(false);
  };

  if (typing) {
    return (
      <View className="h-[34px] min-w-[140px] flex-row items-center gap-1 rounded-[20px] border-[1.5px] border-black bg-[#FEFCFF] px-3">
        <TextInput
          value={text}
          onChangeText={(next) => setText(sanitizeLeadText(next, maxLength))}
          onSubmitEditing={submit}
          onBlur={submit}
          autoFocus
          autoCapitalize="words"
          returnKeyType="done"
          placeholder={label}
          placeholderTextColor={PLACEHOLDER_COLOR}
          accessibilityLabel={label}
          className="min-w-[100px] py-0 font-inter-medium text-xs leading-4 text-black"
        />
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => setTyping(true)}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-[34px] flex-row items-center gap-1 rounded-[20px] border-[1.5px] border-black bg-[#FEFCFF] px-2.5 active:opacity-70"
    >
      <Icon size={16} color="#1C1B1B" strokeWidth={1.75} />
      <Text className="font-inter-medium text-xs leading-6 text-black">{label}</Text>
    </Pressable>
  );
}

// A picked tag or city; tap to drop it.
function RemovableChip({
  label,
  tone,
  onRemove,
}: {
  label: string;
  tone: 'tag' | 'location';
  onRemove: () => void;
}) {
  return (
    <Pressable
      onPress={onRemove}
      accessibilityRole="button"
      accessibilityLabel={`Remove ${label}`}
      className={`h-[34px] flex-row items-center gap-0.5 rounded-[20px] px-3 active:opacity-70 ${
        tone === 'tag' ? 'border-[1.5px] border-[#5683F5]' : 'border border-black bg-[#F5F5F5]'
      }`}
    >
      <Text className="font-inter-medium text-xs leading-4 text-black/70">{label}</Text>
      <X size={14} color="#000000" strokeWidth={1.5} />
    </Pressable>
  );
}

// Adds `value` unless it's already there in any case.
const addUnique = (list: string[], value: string) =>
  list.some((item) => item.toLowerCase() === value.toLowerCase()) ? list : [...list, value];

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  value: CreatorFilters;
  onApply: (next: CreatorFilters) => void;
}

export function FilterSheet({ visible, onClose, value, onApply }: FilterSheetProps) {
  const reduceMotion = useReducedMotion();
  const [draft, setDraft] = useState(value);
  const [agesOpen, setAgesOpen] = useState(false);
  // Each opening starts from what's applied.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setDraft(value);
      setAgesOpen(false);
    }
  }

  const set = <K extends keyof CreatorFilters>(key: K, next: CreatorFilters[K]) =>
    setDraft((current) => ({ ...current, [key]: next }));

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filter">
      <ScrollView
        className="mt-5 shrink grow-0"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
      >
        <Section title="Niche">
          <View className="flex-row flex-wrap gap-x-3 gap-y-2.5 pt-1">
            {NICHE_OPTIONS.map((niche) => {
              const selected = draft.niches.includes(niche);
              return (
                <Pressable
                  key={niche}
                  onPress={() => set('niches', toggle(draft.niches, niche))}
                  accessibilityRole="checkbox"
                  accessibilityLabel={niche}
                  accessibilityState={{ checked: selected }}
                  className={`h-[34px] justify-center rounded-[20px] border-[1.5px] px-3.5 active:opacity-70 ${
                    selected ? 'border-black/90' : 'border-[#E4E9EF]'
                  }`}
                >
                  <Text
                    className={`text-xs capitalize leading-[15px] text-[#212121] ${
                      selected ? 'font-inter-medium' : 'font-inter'
                    }`}
                  >
                    {niche}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="Follower Range">
          <FollowerRangeSlider
            value={draft.maxFollowers}
            onChange={(next) => set('maxFollowers', next)}
          />
        </Section>

        <Section title="By Tag">
          <View className="flex-row flex-wrap gap-2">
            <AddPill
              label="Add Tag"
              icon={Plus}
              maxLength={CREATOR_TAG_MAX}
              onAdd={(tag) => set('tags', addUnique(draft.tags, tag))}
            />
            {draft.tags.map((tag) => (
              <RemovableChip
                key={tag}
                label={tag}
                tone="tag"
                onRemove={() =>
                  set(
                    'tags',
                    draft.tags.filter((t) => t !== tag),
                  )
                }
              />
            ))}
          </View>
        </Section>

        <Section title="By Age">
          <Pressable
            onPress={() => setAgesOpen((open) => !open)}
            accessibilityRole="button"
            accessibilityLabel={`Age, ${draft.ageRange ? AGE_RANGE_LABELS[draft.ageRange] : 'any'}`}
            accessibilityState={{ expanded: agesOpen }}
            className="h-[34px] flex-row items-center justify-between rounded-3xl border border-[#F0EFF1] bg-[#FAFAFA] px-3 active:opacity-80"
          >
            <Text className="font-inter text-xs leading-4 text-[#7F7F7F]">
              {draft.ageRange ? AGE_RANGE_LABELS[draft.ageRange] : 'Any age'}
            </Text>
            <ChevronDown size={18} color="#7F7F7F" strokeWidth={1.75} />
          </Pressable>
          {agesOpen ? (
            <Animated.View
              entering={reduceMotion ? undefined : FadeInDown.duration(180)}
              exiting={reduceMotion ? undefined : FadeOut.duration(120)}
              className="mt-1 overflow-hidden rounded-[20px] border border-[#F0EFF1] bg-white"
            >
              {[null, ...AGE_RANGES].map((range) => {
                const selected = range === draft.ageRange;
                return (
                  <Pressable
                    key={range ?? 'any'}
                    onPress={() => {
                      set('ageRange', range);
                      setAgesOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className="h-10 flex-row items-center px-4 active:bg-[#F8F8F8]"
                  >
                    <Text className="flex-1 font-inter-medium text-xs leading-4 text-[#111827]">
                      {range ? AGE_RANGE_LABELS[range] : 'Any age'}
                    </Text>
                    {selected ? <Check size={14} color="#312B28" strokeWidth={2} /> : null}
                  </Pressable>
                );
              })}
            </Animated.View>
          ) : null}
        </Section>

        <Section title="Gender">
          <View className="flex-row gap-[15px]">
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
                  className="flex-row items-center gap-0.5 active:opacity-70"
                >
                  <Box size={16} color="#000000" strokeWidth={1.5} />
                  <Text
                    className={`text-xs leading-4 ${
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

        <Section title="Location">
          <View className="flex-row flex-wrap gap-2">
            <AddPill
              label="Add location"
              icon={MapPin}
              maxLength={CREATOR_LOCATION_MAX}
              onAdd={(city) => set('locations', addUnique(draft.locations, city))}
            />
            {draft.locations.map((city) => (
              <RemovableChip
                key={city}
                label={city}
                tone="location"
                onRemove={() =>
                  set(
                    'locations',
                    draft.locations.filter((c) => c !== city),
                  )
                }
              />
            ))}
          </View>
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
