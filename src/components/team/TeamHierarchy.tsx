import { ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { MEMBER_STATUS_STYLES, memberTint, pluralCreators } from '@/components/team/labels';
import { TeamIcon } from '@/components/team/TeamIcon';
import type { Assignee, CreatorAssignment } from '@/services/teamService';

// One team on Assign Creators: its card, then its members by role (managers, team leads,
// employees) with how many creators each is the POC of. Only the first few employees show until
// "Show more". Tap a member to open their profile and creators.

const EMPLOYEE_PREVIEW = 2;

const SECTIONS: { title: string; matches: (m: Assignee) => boolean }[] = [
  { title: 'Manager', matches: (m) => m.assignAs === 'manager' },
  { title: 'Team Lead', matches: (m) => m.assignAs === 'lead' },
  { title: 'Employees', matches: (m) => m.assignAs !== 'manager' && m.assignAs !== 'lead' },
];

function AssigneeCard({ member, onOpen }: { member: Assignee; onOpen: () => void }) {
  const firstName = member.name.split(' ')[0] ?? member.name;
  const tint = memberTint(member.id);
  const status = MEMBER_STATUS_STYLES[member.status];
  const pill =
    member.status === 'active'
      ? { background: '#ECFDF5', text: '#059669' }
      : { background: status.background, text: status.text };

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`${member.name}, ${pluralCreators(member.creators)}, ${status.label}`}
      accessibilityHint="Opens their profile and creators"
      // Pressed, it takes the selected card's indigo edge.
      className="flex-row items-center justify-between gap-3 rounded-2xl border border-[#F5F5F5] bg-white p-3 active:border-[rgba(199,210,254,0.8)]"
      style={{ boxShadow: '0px 2px 8px -2px rgba(0, 0, 0, 0.04), 0px 1px 3px rgba(0, 0, 0, 0.02)' }}
    >
      <View className="flex-1 flex-row items-center gap-3">
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: tint.background }}
        >
          <Text className="font-inter text-sm leading-5" style={{ color: tint.text }}>
            {firstName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="font-inter-medium text-sm leading-[18px] text-[#171717]"
          >
            {firstName}
          </Text>
          <Text className="font-inter text-xs leading-[17px] text-[#A3A3A3]">
            {pluralCreators(member.creators)}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: pill.background }}>
          <Text className="font-inter text-[11px] leading-4" style={{ color: pill.text }}>
            {status.label}
          </Text>
        </View>
        <ChevronRight size={16} color="#A3A3A3" strokeWidth={1.33} />
      </View>
    </Pressable>
  );
}

function SectionHeading({ title, count }: { title: string; count: number }) {
  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={`${title}, ${count}`}
      className="flex-row items-center justify-between px-0.5"
    >
      <Text className="font-inter-medium text-[13px] leading-5 text-[#404040]">{title}</Text>
      <View className="h-4 min-w-4 items-center justify-center rounded-full bg-[rgba(229,229,229,0.5)] px-1">
        <Text className="font-inter text-[11px] leading-4 text-[#A3A3A3]">{count}</Text>
      </View>
    </View>
  );
}

interface TeamHierarchyProps {
  entry: CreatorAssignment['teams'][number];
  onOpenMember: (id: string) => void;
}

export function TeamHierarchy({ entry, onOpenMember }: TeamHierarchyProps) {
  const { team, creators, members } = entry;
  const [showAll, setShowAll] = useState(false);
  const summary = `${team.members} ${team.members === 1 ? 'member' : 'members'} · ${creators} assigned ${
    creators === 1 ? 'creator' : 'creators'
  }`;

  return (
    <View className="gap-2.5">
      <View
        accessible
        accessibilityLabel={`${team.name} Team, ${summary}`}
        className="flex-row items-center gap-3 rounded-[27px] border border-black/[0.07] bg-white px-5 pb-4 pt-5"
      >
        <TeamIcon focus={team.focus} size={44} />
        <View className="flex-1">
          <Text numberOfLines={1} className="font-inter-semibold text-sm leading-5 text-[#111111]">
            {team.name} Team
          </Text>
          <Text numberOfLines={1} className="font-inter text-xs leading-4 text-slate">
            {summary}
          </Text>
        </View>
      </View>

      {members.length === 0 ? (
        <Text className="py-2 text-center font-inter-medium text-sm leading-5 text-muted">
          No members on this team yet.
        </Text>
      ) : (
        <View className="gap-4">
          {SECTIONS.map(({ title, matches }) => {
            const group = members.filter(matches);
            if (group.length === 0) return null;
            const employees = title === 'Employees';
            const hidden = employees && !showAll ? group.length - EMPLOYEE_PREVIEW : 0;
            const shown = hidden > 0 ? group.slice(0, EMPLOYEE_PREVIEW) : group;

            return (
              <View key={title} className="gap-1.5">
                <SectionHeading title={title} count={group.length} />
                <View className="gap-2">
                  {shown.map((member) => (
                    <AssigneeCard
                      key={member.id}
                      member={member}
                      onOpen={() => onOpenMember(member.id)}
                    />
                  ))}
                  {employees && group.length > EMPLOYEE_PREVIEW ? (
                    <Pressable
                      onPress={() => setShowAll((all) => !all)}
                      accessibilityRole="button"
                      accessibilityState={{ expanded: showAll }}
                      className="items-center justify-center rounded-2xl border border-dashed border-[#D4D4D4] bg-white/40 py-2.5 active:opacity-70"
                    >
                      <Text className="font-inter text-xs leading-4 text-[#737373]">
                        {hidden > 0
                          ? `Show ${hidden} more ${hidden === 1 ? 'employee' : 'employees'}`
                          : 'Show fewer employees'}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
