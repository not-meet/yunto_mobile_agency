import { Users } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { PeopleSection } from '@/components/team/PeopleSection';
import { StatusPill } from '@/components/team/StatusPill';
import type { People } from '@/services/teamService';

// The People screen's first card: headcount and who's in today, then teams, attendance and the
// average first sign-in.

// "10:15" → ["10:15", "am"].
function twelveHour(time: string): [string, string] {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  const suffix = hours < 12 ? 'am' : 'pm';
  return [`${hours % 12 || 12}:${String(minutes).padStart(2, '0')}`, suffix];
}

function Stat({
  label,
  children,
  last = false,
}: {
  label: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <View className={`flex-1 items-center gap-2 p-4 ${last ? '' : 'border-r border-black/5'}`}>
      <Text className="font-inter-bold text-[11px] uppercase leading-4 tracking-[1.1px] text-[#AAAAAA]">
        {label}
      </Text>
      {children}
    </View>
  );
}

export function PeopleOverview({ overview }: { overview: People['overview'] }) {
  const [login, suffix] = twelveHour(overview.avgLogin);

  return (
    <PeopleSection
      title="People"
      icon={Users}
      tone={{ color: '#159B7F', background: '#CCFBF1' }}
      glow="210, 205, 255"
      large
    >
      <View className="flex-row items-start justify-between border-t border-black/5 px-5 py-4">
        <View className="gap-1">
          <Text className="font-inter-bold text-[11px] uppercase leading-4 tracking-[1.1px] text-[#AAAAAA]">
            Total Employees
          </Text>
          <Text className="pt-0.5 font-inter-semibold text-[28px] leading-7 tracking-[-0.7px] text-[#111111]">
            {overview.total}
          </Text>
          <Text className="font-inter-medium text-xs leading-[18px] text-[#888888]">
            {overview.total === 1 ? 'Member' : 'Members'}
          </Text>
        </View>
        <StatusPill status="active" label={`${overview.active} Active`} />
      </View>
      <View className="flex-row border-t border-black/5">
        <Stat label="Teams">
          <Text className="font-inter-semibold text-[26px] leading-[26px] tracking-[-0.65px] text-[#111111]">
            {overview.teams}
          </Text>
        </Stat>
        <Stat label="Attendance">
          <Text className="font-inter-semibold text-[26px] leading-[26px] tracking-[-0.65px] text-[#3A7DE8]">
            {overview.attendance}%
          </Text>
        </Stat>
        <Stat label="Avg Login" last>
          <View className="items-center">
            <Text className="font-inter-semibold text-base leading-5 tracking-[-0.4px] text-[#111111]">
              {login}
            </Text>
            <Text className="font-inter-medium text-[10px] leading-[15px] text-[#AAAAAA]">
              {suffix}
            </Text>
          </View>
        </Stat>
      </View>
    </PeopleSection>
  );
}
