import { Text, View } from 'react-native';

import { CARD_SHADOW } from '@/components/home/shared';
import { ASSIGN_AS_LABELS, EMPLOYMENT_LABELS } from '@/components/team/labels';
import { PillButton } from '@/components/team/PillButton';
import type { MemberDetails } from '@/services/teamService';
import { slashDate } from '@/utils/dates';

// A member's details as label / value rows.

function Row({ label, value, first = false }: { label: string; value: string; first?: boolean }) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}, ${value}`}
      className={`flex-row justify-between gap-4 py-3 ${first ? 'pt-4' : 'border-t border-[rgba(226,232,240,0.3)]'}`}
    >
      <Text className="font-inter text-xs leading-4 text-slate">{label}</Text>
      <Text
        numberOfLines={1}
        className="shrink text-right font-inter-medium text-xs leading-4 text-[#111111]"
      >
        {value}
      </Text>
    </View>
  );
}

export function MemberInfo({ member, onAdd }: { member: MemberDetails; onAdd: () => void }) {
  const phone = member.phone?.replace(/^\+91(\d{10})$/, '+91 $1');
  const rows = [
    { label: 'Full Name', value: member.name },
    { label: 'Join Date', value: slashDate(member.joinedAt) },
    { label: 'Contact Number', value: phone ?? '—' },
    { label: 'Email Address', value: member.email ?? '—' },
    { label: 'Employment Type', value: EMPLOYMENT_LABELS[member.employmentType] },
    { label: 'Assign As', value: ASSIGN_AS_LABELS[member.assignAs] },
    { label: 'Reporting Manager', value: member.reportingManager ?? '—' },
    { label: 'Birth Date', value: member.birthDate ? slashDate(member.birthDate) : '—' },
  ];

  return (
    <View
      className="rounded-3xl border border-white/75 bg-white/55 px-5 pb-4"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <View className="flex-row items-center justify-between gap-3 border-b border-[rgba(226,232,240,0.3)] py-4">
        <Text
          accessibilityRole="header"
          className="font-inter-semibold text-sm leading-5 text-[#111111]"
        >
          Detailed Information
        </Text>
        <PillButton label="Add Information" onPress={onAdd} />
      </View>
      {rows.map((row, i) => (
        <Row key={row.label} label={row.label} value={row.value} first={i === 0} />
      ))}
    </View>
  );
}
