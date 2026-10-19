import { Text, View } from 'react-native';

import { ASSIGN_AS_TINTS, initialTint } from '@/components/profile/distributionLabels';
import { ASSIGN_AS_LABELS } from '@/components/team/labels';
import type { DistributionMember } from '@/services/leadDistributionService';

// A team member on the lead distribution screen: their first initial on a tint of their own, and
// the chip saying what they're assigned as.

const SIZES = {
  32: { box: 'h-8 w-8', text: 'text-xs leading-4 font-inter-semibold' },
  36: { box: 'h-9 w-9', text: 'text-xs leading-4 font-inter-bold' },
  40: { box: 'h-10 w-10', text: 'text-[15px] leading-[22px] font-inter-bold' },
} as const;

export function MemberInitial({
  member,
  size,
}: {
  member: Pick<DistributionMember, 'id' | 'name'>;
  size: keyof typeof SIZES;
}) {
  const tint = initialTint(member.id);
  const { box, text } = SIZES[size];
  return (
    <View
      className={`${box} items-center justify-center rounded-full`}
      style={{ backgroundColor: tint.background }}
    >
      <Text className={text} style={{ color: tint.text }}>
        {member.name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

export function AssignAsChip({ assignAs }: { assignAs: DistributionMember['assignAs'] }) {
  const tint = ASSIGN_AS_TINTS[assignAs];
  return (
    <View className="rounded-md px-1.5 py-0.5" style={{ backgroundColor: tint.background }}>
      <Text
        className="font-inter-bold text-[9px] uppercase leading-[14px] tracking-[0.225px]"
        style={{ color: tint.text }}
      >
        {ASSIGN_AS_LABELS[assignAs]}
      </Text>
    </View>
  );
}
