import { ChevronDown, Pencil, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { LinearTransition, useReducedMotion } from 'react-native-reanimated';

import {
  FOLLOWER_TIER_LABELS,
  PLATFORM_STYLES,
  REQUIREMENT_AGE_LABELS,
  REQUIREMENT_GENDER_LABELS,
} from '@/components/leads/labels';
import type { BrandRequirements } from '@/services/leadsService';
import { fromDateKey, mediumDate } from '@/utils/dates';
import { UNKNOWN } from '@/utils/schema';

// "Brand Requirements": what the brand asked for as a list (platforms, niche, location, …), with
// Edit to fill or change them, over the brand's opening message, which is clipped to four lines
// until it's tapped open (the chevron turns as it does). Only the fields that are filled show,
// so a lead from outside lists just what the brand gave. With neither, a "No brief yet" line.

const COLLAPSED_LINES = 4;

const join = (values: string[]) => (values.length > 0 ? values.join(', ') : null);

function listOf<T extends string>(values: (T | typeof UNKNOWN)[], labels: Record<T, string>) {
  return join(values.flatMap((value) => (value === UNKNOWN ? [] : [labels[value]])));
}

// [label, value] for each filled field, in the web's order.
function requirementRows(r: BrandRequirements): [string, string][] {
  const rows: [string, string | null][] = [
    [
      'Platforms',
      join(r.platforms.flatMap((p) => (p === UNKNOWN ? [] : [PLATFORM_STYLES[p].label]))),
    ],
    ['Niche', join(r.niches)],
    ['Location', r.location],
    ['Creators', r.creators === null ? null : String(r.creators)],
    ['Gender', listOf(r.genders, REQUIREMENT_GENDER_LABELS)],
    ['Language', join(r.languages)],
    ['Age range', listOf(r.ageRanges, REQUIREMENT_AGE_LABELS)],
    ['Followers', listOf(r.followerTiers, FOLLOWER_TIER_LABELS)],
    ['Due', r.dueDate ? mediumDate(fromDateKey(r.dueDate)) : null],
  ];
  return rows.filter((row): row is [string, string] => row[1] !== null);
}

interface BrandMessageCardProps {
  message: string | null;
  requirements: BrandRequirements;
  onEdit: () => void;
}

export function BrandMessageCard({ message, requirements, onEdit }: BrandMessageCardProps) {
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const rows = requirementRows(requirements);
  const empty = rows.length === 0;

  return (
    <Animated.View
      layout={reduceMotion ? undefined : LinearTransition.duration(250)}
      className="gap-4 overflow-hidden rounded-[20px] border border-[rgba(232,226,217,0.5)] bg-white px-5 pb-5 pt-8"
    >
      <View className="flex-row items-center justify-between gap-3">
        <Text
          accessibilityRole="header"
          className="font-inter-semibold text-base leading-5 text-[#1D1D1F]"
        >
          Brand Requirements
        </Text>
        <Pressable
          onPress={onEdit}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={empty ? 'Add brand requirements' : 'Edit brand requirements'}
          className="h-[25px] flex-row items-center gap-1 rounded-full bg-cocoa px-3 active:opacity-80"
        >
          {empty ? (
            <Plus size={12} color="#FFFFFF" strokeWidth={2} />
          ) : (
            <Pencil size={11} color="#FFFFFF" strokeWidth={2} />
          )}
          <Text className="font-inter-semibold text-[11px] leading-4 text-white">
            {empty ? 'Add' : 'Edit'}
          </Text>
        </Pressable>
      </View>

      {rows.length > 0 ? (
        <View className="gap-2.5">
          {rows.map(([label, value]) => (
            <View
              key={label}
              accessible
              accessibilityLabel={`${label}: ${value}`}
              className="flex-row gap-3"
            >
              <Text className="w-[84px] font-inter text-[13px] leading-[18px] text-[#8A8A8E]">
                {label}
              </Text>
              <Text className="flex-1 font-inter-medium text-[13px] leading-[18px] text-[#1D1D1F]">
                {value}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {message !== null ? (
        <Pressable
          onPress={() => setExpanded((open) => !open)}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={expanded ? 'Collapse brand message' : 'Show full brand message'}
          className={`gap-2 active:opacity-80 ${empty ? '' : 'border-t border-[#F2F2F7] pt-4'}`}
        >
          <View className="flex-row items-center justify-between">
            <Text className="font-inter-semibold text-[11px] uppercase leading-4 tracking-[1.1px] text-[#888888]">
              Brand message
            </Text>
            <Animated.View
              style={{
                transform: [{ rotate: expanded ? '180deg' : '0deg' }],
                ...(reduceMotion
                  ? null
                  : { transitionProperty: 'transform', transitionDuration: 250 }),
              }}
            >
              <ChevronDown size={20} color="#8A8A8E" strokeWidth={1.67} />
            </Animated.View>
          </View>
          <Text
            numberOfLines={expanded ? undefined : COLLAPSED_LINES}
            className="font-inter text-sm leading-[21px] text-[#6E6E73]"
          >
            {message}
          </Text>
        </Pressable>
      ) : empty ? (
        <Text className="font-inter text-sm leading-[21px] text-[#6E6E73]">No brief yet</Text>
      ) : null}
    </Animated.View>
  );
}
