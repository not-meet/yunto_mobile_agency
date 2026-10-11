import { Text, View } from 'react-native';

import { CARD_SHADOW } from '@/components/home/shared';
import { FOCUS_STYLES, pluralMembers } from '@/components/team/labels';
import { PillToggle } from '@/components/team/PillToggle';
import { TeamIcon } from '@/components/team/TeamIcon';
import type { TeamDetails } from '@/services/teamService';

// Top of a team's screen: its badge, name and size, whether new leads are handed out to it
// automatically, and where its leads stand. Washed in the team's hue.

interface TeamOverviewProps {
  team: TeamDetails;
  onAutoAssign: (next: boolean) => void;
  // While a switch is saving; the toggle shows where it's going.
  pendingAutoAssign?: boolean;
}

export function TeamOverview({ team, onAutoAssign, pendingAutoAssign }: TeamOverviewProps) {
  const autoAssign = pendingAutoAssign ?? team.autoAssign;
  const stats = [
    { label: 'Leads', value: team.stats.leads, color: '#111111' },
    { label: 'Unattended', value: team.stats.unattended, color: '#FF7E67' },
    { label: 'Contacted', value: team.stats.contacted, color: '#3A7DE8' },
    { label: 'Converted', value: team.stats.converted, color: '#3E7D52' },
  ];

  return (
    <View
      className="overflow-hidden rounded-3xl border border-white/80"
      style={{ backgroundColor: FOCUS_STYLES[team.focus].wash, boxShadow: CARD_SHADOW }}
    >
      <View className="flex-row items-center gap-4 px-5 py-4">
        <TeamIcon focus={team.focus} size={44} />
        <View className="flex-1 gap-0.5">
          <Text
            accessibilityRole="header"
            numberOfLines={1}
            className="font-inter-semibold text-base leading-6 tracking-[-0.4px] text-[#111111]"
          >
            {team.name}
          </Text>
          <Text className="font-inter-medium text-xs leading-[18px] text-black/40">
            {pluralMembers(team.members.length)}
          </Text>
        </View>
        <View className="items-end gap-1">
          <PillToggle
            value={autoAssign}
            onChange={onAutoAssign}
            disabled={pendingAutoAssign !== undefined}
            label="Auto-assign new leads"
            tone="violet"
          />
          <Text className="font-inter-medium text-[10px] leading-[15px] text-black/40">
            Auto-assign
          </Text>
        </View>
      </View>

      <View className="mt-[26px] flex-row border-y border-black/5">
        {stats.map((stat, i) => (
          <View
            key={stat.label}
            accessible
            accessibilityLabel={`${stat.label}, ${stat.value}`}
            className={`flex-1 items-center gap-0.5 py-3 ${i > 0 ? 'border-l border-black/5' : ''}`}
          >
            <Text
              className="font-inter-semibold text-[22px] leading-[33px] tracking-[-0.55px]"
              style={{ color: stat.color }}
            >
              {stat.value}
            </Text>
            <Text
              numberOfLines={1}
              className="font-inter-bold text-[10px] uppercase leading-[15px] tracking-[1px] text-[#AAAAAA]"
            >
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
