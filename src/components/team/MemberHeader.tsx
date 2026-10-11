import { CalendarCheck, ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { CARD_SHADOW } from '@/components/home/shared';
import { ASSIGN_AS_LABELS, pluralMembers } from '@/components/team/labels';
import { MemberRow } from '@/components/team/MemberRow';
import { StatusPill } from '@/components/team/StatusPill';
import { TeamIcon } from '@/components/team/TeamIcon';
import type { MemberDetails } from '@/services/teamService';

// Top of a member's details: the team they're in, the member themselves, and their attendance
// and leaves.

interface MemberHeaderProps {
  member: MemberDetails;
  onOpenTeam: (id: string) => void;
  onAttendance: () => void;
}

export function MemberHeader({ member, onOpenTeam, onAttendance }: MemberHeaderProps) {
  const { team } = member;

  return (
    <View
      className="gap-4 rounded-3xl border border-white/75 bg-white/55 px-4 pb-4"
      style={{ boxShadow: CARD_SHADOW }}
    >
      {team ? (
        <Pressable
          onPress={() => onOpenTeam(team.id)}
          accessibilityRole="button"
          accessibilityLabel={`${team.name}, ${pluralMembers(team.members)}, ${team.active} active`}
          accessibilityHint="Opens the team"
          className="flex-row items-center gap-3 border-b border-[rgba(226,232,240,0.3)] px-1 pb-4 pt-5 active:opacity-80"
        >
          <TeamIcon focus={team.focus} size={44} />
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="font-inter-semibold text-sm leading-5 text-[#111111]"
            >
              {team.name} Team
            </Text>
            <Text className="font-inter text-xs leading-4 text-slate">
              {pluralMembers(team.members)}
            </Text>
          </View>
          <StatusPill status="active" label={`${team.active} Active`} large />
        </Pressable>
      ) : (
        <View className="pt-4" />
      )}

      <MemberRow member={member} subtitle={ASSIGN_AS_LABELS[member.assignAs]} size={48} />

      <Pressable
        onPress={onAttendance}
        accessibilityRole="button"
        accessibilityLabel="Attendance & Leaves"
        className="flex-row items-center gap-3 rounded-[40px] border border-white/60 bg-white/50 p-4 active:opacity-80"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-[#E0E7FF]">
          <CalendarCheck size={16} color="#615FFF" strokeWidth={1.5} />
        </View>
        <Text className="flex-1 font-inter-medium text-sm leading-5 text-[#111111]">
          Attendance & Leaves
        </Text>
        <ChevronRight size={18} color="#64748B" strokeWidth={2} />
      </Pressable>
    </View>
  );
}
