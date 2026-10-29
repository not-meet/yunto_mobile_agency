import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import { toggle } from '@/components/talent/BookingChips';
import { FieldLabel } from '@/components/leads/FieldLabel';
import { DEFAULT_PLATFORMS, PLATFORM_STYLES, TAG_TONES } from '@/components/leads/labels';
import { AddChip, TagChip } from '@/components/leads/TagChip';
import { type LeadPlatform, leadPlatformSchema } from '@/services/leadsService';

// Where the campaign runs (pick any number). Instagram and YouTube are up front; "Add" offers
// the rest in a sheet, and one picked there joins the row already selected.

interface PlatformPickerProps {
  selected: LeadPlatform[];
  onChange: (next: LeadPlatform[]) => void;
}

export function PlatformPicker({ selected, onChange }: PlatformPickerProps) {
  // Any picked already (editing requirements) are shown up front too.
  const [shown, setShown] = useState<LeadPlatform[]>(() => [
    ...DEFAULT_PLATFORMS,
    ...selected.filter((platform) => !DEFAULT_PLATFORMS.includes(platform)),
  ]);
  const [adding, setAdding] = useState(false);
  const more = leadPlatformSchema.options.filter((platform) => !shown.includes(platform));

  const add = (platform: LeadPlatform) => {
    setShown([...shown, platform]);
    onChange([...selected, platform]);
    setAdding(false);
  };

  return (
    <View className="gap-3">
      <FieldLabel>Platforms</FieldLabel>
      <View className="flex-row flex-wrap gap-2">
        {shown.map((platform) => {
          const { label, icon, tone } = PLATFORM_STYLES[platform];
          return (
            <TagChip
              key={platform}
              label={label}
              icon={icon}
              tone={tone}
              size="lg"
              selected={selected.includes(platform)}
              onPress={() => onChange(toggle(selected, platform))}
            />
          );
        })}
        {more.length > 0 ? (
          <AddChip size="lg" onPress={() => setAdding(true)} accessibilityLabel="Add a platform" />
        ) : null}
      </View>

      <BottomSheet visible={adding} onClose={() => setAdding(false)} title="Add Platform">
        <View className="mt-5 gap-2">
          {more.map((platform) => {
            const { label, icon: Icon, tone } = PLATFORM_STYLES[platform];
            const colors = TAG_TONES[tone];
            return (
              <Pressable
                key={platform}
                onPress={() => add(platform)}
                accessibilityRole="button"
                accessibilityLabel={`Add ${label}`}
                className="h-14 flex-row items-center gap-3 rounded-[18px] border border-[#EFEFEF] bg-[#F8F9FA] px-4 active:opacity-70"
              >
                <View
                  className="h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.background }}
                >
                  {Icon ? <Icon size={16} color={colors.text} /> : null}
                </View>
                <Text className="font-inter-semibold text-sm leading-[21px] text-[#222222]">
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
}
