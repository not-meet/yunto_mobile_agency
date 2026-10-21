import { Text, View } from 'react-native';

import {
  ASSIGN_AS_LABELS,
  MEMBER_STATUS_STYLES,
  memberTint,
  ROLE_LABELS,
} from '@/components/team/labels';
import type { MemberDetails } from '@/services/teamService';

// Top of a member's page from Assign Creators: their initial, name and status, what they do,
// and their employee code.

export function AssigneeProfileCard({ member }: { member: MemberDetails }) {
  const tint = memberTint(member.id);
  const status = MEMBER_STATUS_STYLES[member.status];
  const pill =
    member.status === 'active'
      ? { background: '#EAF7EE', text: '#18794E' }
      : { background: status.background, text: status.text };
  const what = `${ROLE_LABELS[member.role]} · ${ASSIGN_AS_LABELS[member.assignAs]}`;

  return (
    <View
      accessible
      accessibilityLabel={`${member.name}, ${status.label}, ${what}${
        member.employeeCode ? `, employee code ${member.employeeCode}` : ''
      }`}
      className="flex-row items-center gap-4 rounded-[22px] border border-[#F5F5F4] bg-white p-4"
      style={{ boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)' }}
    >
      <View
        className="h-[58px] w-[58px] items-center justify-center rounded-full"
        style={{ backgroundColor: tint.background }}
      >
        <Text
          className="font-inter text-2xl leading-8 tracking-[-0.6px]"
          style={{ color: tint.text }}
        >
          {member.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text
            numberOfLines={1}
            className="shrink font-inter-medium text-[19px] leading-6 text-[#141414]"
          >
            {member.name}
          </Text>
          <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: pill.background }}>
            <Text className="font-inter-medium text-[11px] leading-4" style={{ color: pill.text }}>
              {status.label}
            </Text>
          </View>
        </View>
        <Text
          numberOfLines={1}
          className="pt-[3px] font-inter text-[13.5px] leading-5 text-[#78716C]"
        >
          {what}
        </Text>
        {member.employeeCode ? (
          <Text
            numberOfLines={1}
            className="pt-0.5 font-inter text-[13px] leading-5 text-[#78716C]"
          >
            Employee code {member.employeeCode}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
