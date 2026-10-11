import { ChevronRight, LayoutGrid } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { ASSIGN_AS_LABELS, pluralMembers } from '@/components/team/labels';
import { PeopleSection } from '@/components/team/PeopleSection';
import { PersonRow } from '@/components/team/PersonRow';
import { StatusPill } from '@/components/team/StatusPill';
import { TeamIcon } from '@/components/team/TeamIcon';
import type { People } from '@/services/teamService';

// Each team with its first few members and what they are in it; "View all" opens the team.

interface TeamsAndRolesProps {
  teams: People['teams'];
  onOpenTeam: (id: string) => void;
  onOpenMember: (id: string) => void;
}

export function TeamsAndRoles({ teams, onOpenTeam, onOpenMember }: TeamsAndRolesProps) {
  return (
    <PeopleSection
      title="Teams & Roles"
      icon={LayoutGrid}
      tone={{ color: '#3E5C45', background: '#F0F5F1' }}
      glow="205, 220, 255"
    >
      <View className="gap-5 px-4 pb-4">
        {teams.map(({ team, members }) => (
          <View key={team.id} className="gap-3">
            <View className="flex-row items-center gap-3 rounded-[20px] border border-white/90 bg-white/60 p-4">
              <TeamIcon focus={team.focus} size={44} />
              <View className="flex-1">
                <Text
                  numberOfLines={1}
                  className="font-inter-semibold text-[15px] leading-[22px] tracking-[-0.375px] text-[#111111]"
                >
                  {team.name}
                </Text>
                <Text className="font-inter-medium text-xs leading-[18px] text-black/40">
                  {pluralMembers(team.members)}
                </Text>
              </View>
              <StatusPill status="active" label={`${team.active} Active`} />
            </View>

            {members.map((member) => (
              <PersonRow
                key={member.id}
                member={member}
                subtitle={ASSIGN_AS_LABELS[member.assignAs]}
                onOpen={() => onOpenMember(member.id)}
              />
            ))}

            <Pressable
              onPress={() => onOpenTeam(team.id)}
              accessibilityRole="button"
              accessibilityLabel={`View all ${team.members} members of ${team.name}`}
              className="h-[45px] flex-row items-center justify-center gap-2 rounded-[18px] border border-black/[0.07] bg-white/40 active:opacity-70"
            >
              <Text className="font-inter-semibold text-[13px] leading-5 text-black/50">
                View all {pluralMembers(team.members).toLowerCase()}
              </Text>
              <ChevronRight size={14} color="#AAAAAA" strokeWidth={2} />
            </Pressable>
          </View>
        ))}
      </View>
    </PeopleSection>
  );
}
