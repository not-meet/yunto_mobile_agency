import { Pressable, Text, View } from 'react-native';

import { ASSIGN_AS_LABELS, memberTint } from '@/components/team/labels';
import type { Assignee } from '@/services/teamService';

// On the unassigned list: who the picked creators go to, with "Change" to pick someone else.

interface AssigningBannerProps {
  member: Assignee;
  onChange: () => void;
}

export function AssigningBanner({ member, onChange }: AssigningBannerProps) {
  const tint = memberTint(member.id);
  const firstName = member.name.split(' ')[0] ?? member.name;

  return (
    <View className="flex-row items-center justify-between gap-4 rounded-2xl border border-[#DDD6FE] bg-[#F2EFFE] px-3.5 py-3">
      <View className="flex-1 flex-row items-center gap-2.5">
        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: tint.background }}
        >
          <Text className="font-inter-bold text-xs leading-4" style={{ color: tint.text }}>
            {firstName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text numberOfLines={1} className="flex-1 font-inter text-[13px] leading-4 text-[#525252]">
          Assigning to <Text className="font-inter-semibold text-[#262626]">{firstName}</Text> ·{' '}
          {ASSIGN_AS_LABELS[member.assignAs]}
        </Text>
      </View>
      <Pressable
        onPress={onChange}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Change who to assign to, now ${member.name}`}
        className="active:opacity-60"
      >
        <Text className="font-inter-semibold text-[13px] leading-4 text-[#6437E7]">Change</Text>
      </Pressable>
    </View>
  );
}
