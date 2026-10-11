import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/common/Avatar';
import { StatusPill } from '@/components/team/StatusPill';
import type { Member } from '@/services/teamService';

// A member as a small card (the agency's members on Create Teams, a team's first few on People):
// photo, name and a line under it, and whether they're in today. Anyone offline is dimmed. Tap it
// to open their details.

interface PersonRowProps {
  member: Member;
  subtitle: string;
  onOpen: () => void;
}

export function PersonRow({ member, subtitle, onOpen }: PersonRowProps) {
  const away = member.status === 'offline';

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`${member.name}, ${subtitle}`}
      accessibilityHint="Opens their details"
      className={`flex-row items-center gap-3 rounded-[18px] border px-4 py-3.5 active:opacity-80 ${
        away ? 'border-white/70 bg-white/35' : 'border-white/85 bg-white/50'
      }`}
      style={{ boxShadow: `0px 2px 8px rgba(0, 0, 0, ${away ? 0.02 : 0.03})` }}
    >
      <View className={away ? 'opacity-75' : undefined}>
        <Avatar name={member.name} url={member.avatarUrl} size={44} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text
          numberOfLines={1}
          className={`font-inter-semibold text-sm leading-[21px] tracking-[-0.35px] ${
            away ? 'text-[#666666]' : 'text-[#111111]'
          }`}
        >
          {member.name}
        </Text>
        <Text
          numberOfLines={1}
          className={`font-inter-medium text-[11px] leading-4 ${away ? 'text-black/30' : 'text-black/40'}`}
        >
          {subtitle}
        </Text>
      </View>
      <StatusPill status={member.status} />
      <ChevronRight size={14} color={away ? '#CCCCCC' : '#BBBBBB'} strokeWidth={2} />
    </Pressable>
  );
}
