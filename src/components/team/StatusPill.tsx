import { Text, View } from 'react-native';

import { MEMBER_STATUS_STYLES } from '@/components/team/labels';
import type { MemberStatus } from '@/services/teamService';

// Whether a member is in today, still invited or away: a dot and a word in a tinted pill.
// `label` overrides the word, e.g. "5 Active" on a team.

export function StatusPill({
  status,
  label,
  large = false,
}: {
  status: MemberStatus;
  label?: string;
  // The 12px text the team and member headers use; 10px otherwise.
  large?: boolean;
}) {
  const style = MEMBER_STATUS_STYLES[status];

  return (
    <View
      className={`flex-row items-center rounded-full border py-1 ${
        large ? 'gap-1.5 px-3' : 'gap-1 pl-[9px] pr-3'
      }`}
      style={{ backgroundColor: style.background, borderColor: style.border }}
    >
      <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.dot }} />
      <Text
        className={`font-inter-medium ${large ? 'text-xs' : 'text-[10px]'} leading-4`}
        style={{ color: style.text }}
      >
        {label ?? style.label}
      </Text>
    </View>
  );
}
