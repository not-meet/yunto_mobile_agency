import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Calendar, ChevronDown, CircleX, MapPin } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { Reveal } from '@/components/common/Reveal';
import { ChipGroup, toggle } from '@/components/talent/BookingChips';
import { PROJECT_TYPE_LABELS, SHOOT_SLOT_LABELS } from '@/components/talent/labels';
import {
  type ProjectType,
  projectTypeSchema,
  type ShootSlot,
  shootSlotSchema,
  type VideographerAddOn,
} from '@/services/talentService';
import { fromDateKey, istHour, longDate, todayDate, todayKey, toDateKey } from '@/utils/dates';
import { sanitizeShootBrief, sanitizeShootLocation } from '@/utils/sanitize';
import { PLACEHOLDER_COLOR } from '@/utils/constants';

// The shoot a videographer is booked for: day and start time, project type (pick any number),
// where it happens and an optional brief.

export interface ShootDraft {
  // "YYYY-MM-DD", null until picked.
  date: string | null;
  slot: ShootSlot | null;
  projectTypes: ProjectType[];
  location: string;
  brief: string;
  addOns: VideographerAddOn[];
}

export const EMPTY_SHOOT: ShootDraft = {
  date: null,
  slot: null,
  projectTypes: [],
  location: '',
  brief: '',
  addOns: [],
};

const FIELD_SHADOW = '0px 2px 6px rgba(0, 0, 0, 0.02)';

// A slot on today's date that has already started.
function isPastSlot(date: string | null, slot: ShootSlot): boolean {
  return date === todayKey() && Number(slot.slice(0, 2)) <= istHour();
}

function Heading({ children }: { children: ReactNode }) {
  return (
    <Text
      accessibilityRole="header"
      className="font-inter-bold text-[15px] leading-[18px] text-[#1A1A1A]"
    >
      {children}
    </Text>
  );
}

// A frosted input box whose border tints blue while focused.
function FocusField({
  focused,
  className,
  children,
}: {
  focused: boolean;
  className: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <Animated.View
      className={`border bg-white/60 ${className}`}
      style={{
        borderColor: focused ? '#BBDEFB' : 'rgba(255, 255, 255, 0.9)',
        boxShadow: FIELD_SHADOW,
        transitionProperty: 'borderColor',
        transitionDuration: reduceMotion ? 0 : 180,
      }}
    >
      {children}
    </Animated.View>
  );
}

interface ShootDetailsProps {
  value: ShootDraft;
  onChange: (next: ShootDraft) => void;
  // Reveal order of the first section, so these follow on from the sections above.
  revealFrom: number;
}

export function ShootDetails({ value, onChange, revealFrom }: ShootDetailsProps) {
  const [focus, setFocus] = useState<'location' | 'brief' | null>(null);
  const set = <K extends keyof ShootDraft>(key: K, next: ShootDraft[K]) =>
    onChange({ ...value, [key]: next });

  const openCalendar = () => {
    const today = todayDate();
    DateTimePickerAndroid.open({
      value: value.date ? fromDateKey(value.date) : today,
      mode: 'date',
      minimumDate: today,
      onValueChange: (_, picked) => {
        const date = toDateKey(picked);
        // Moving the shoot to today drops a start time that's already gone.
        const slot = value.slot && isPastSlot(date, value.slot) ? null : value.slot;
        onChange({ ...value, date, slot });
      },
    });
  };

  return (
    <>
      <Reveal order={revealFrom}>
        <View className="gap-3">
          <Heading>Date & Time</Heading>
          <Pressable
            onPress={openCalendar}
            accessibilityRole="button"
            accessibilityLabel={
              value.date ? `Shoot date, ${longDate(fromDateKey(value.date))}` : 'Pick a shoot date'
            }
            className="flex-row items-center gap-2.5 rounded-[20px] border border-white/90 bg-white/60 px-4 py-2.5 active:opacity-80"
            style={{ boxShadow: FIELD_SHADOW }}
          >
            <Calendar size={16} color="#1A1A1A" strokeWidth={1.33} />
            <Text
              className={`flex-1 font-inter-semibold text-[13px] leading-4 ${
                value.date ? 'text-[#1A1A1A]' : 'text-[#888888]'
              }`}
            >
              {value.date ? longDate(fromDateKey(value.date)) : 'Select a date'}
            </Text>
            <ChevronDown size={16} color="#888888" strokeWidth={1.33} />
          </Pressable>
          <ChipGroup
            options={shootSlotSchema.options}
            labels={SHOOT_SLOT_LABELS}
            selected={value.slot ? [value.slot] : []}
            onPress={(slot) => set('slot', slot)}
            tone="green"
            isDisabled={(slot) => isPastSlot(value.date, slot)}
          />
        </View>
      </Reveal>

      <Reveal order={revealFrom + 1}>
        <View className="gap-3">
          <Heading>Project Type</Heading>
          <ChipGroup
            options={projectTypeSchema.options}
            labels={PROJECT_TYPE_LABELS}
            selected={value.projectTypes}
            onPress={(type) => set('projectTypes', toggle(value.projectTypes, type))}
          />
        </View>
      </Reveal>

      <Reveal order={revealFrom + 2}>
        <View className="gap-3">
          <Heading>Shoot Location</Heading>
          {/* TODO: suggest places from the Google Places API as the creator types. */}
          <FocusField
            focused={focus === 'location'}
            className="flex-row items-center gap-2.5 rounded-[20px] px-4 py-2.5"
          >
            <MapPin size={16} color="#1A1A1A" strokeWidth={1.33} />
            <TextInput
              value={value.location}
              onChangeText={(next) => set('location', sanitizeShootLocation(next))}
              onFocus={() => setFocus('location')}
              onBlur={() => setFocus(null)}
              placeholder="Add shoot location"
              placeholderTextColor={PLACEHOLDER_COLOR}
              returnKeyType="done"
              accessibilityLabel="Shoot location"
              className="flex-1 py-0 font-inter-semibold text-[13px] leading-4 text-[#1A1A1A]"
            />
            {value.location ? (
              <Pressable
                onPress={() => set('location', '')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Clear location"
                className="active:opacity-60"
              >
                <CircleX size={14} color="#888888" strokeWidth={1.17} />
              </Pressable>
            ) : null}
          </FocusField>
        </View>
      </Reveal>

      <Reveal order={revealFrom + 3}>
        <View className="gap-3">
          <Heading>Brief / Description</Heading>
          <FocusField focused={focus === 'brief'} className="min-h-20 rounded-2xl px-4 pb-4 pt-3.5">
            <TextInput
              value={value.brief}
              onChangeText={(next) => set('brief', sanitizeShootBrief(next))}
              onFocus={() => setFocus('brief')}
              onBlur={() => setFocus(null)}
              placeholder="Share the vibe, references or anything the videographer should know..."
              placeholderTextColor={PLACEHOLDER_COLOR}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Brief or description"
              className="min-h-[34px] p-0 font-inter-regular text-sm leading-[17px] text-[#1A1A1A]"
            />
          </FocusField>
        </View>
      </Reveal>
    </>
  );
}
