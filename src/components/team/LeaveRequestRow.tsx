import { Text, View } from 'react-native';

import { LEAVE_STATUS_STYLES, LEAVE_TYPE_LABELS, pluralDays } from '@/components/team/labels';
import type { LeaveRequest } from '@/services/leaveService';
import { dayMonth, fromDateKey } from '@/utils/dates';

// One leave the member applied for: its kind, the days it covers and where it stands.

export function LeaveRequestRow({ leave }: { leave: LeaveRequest }) {
  const status = LEAVE_STATUS_STYLES[leave.status];
  const from = dayMonth(fromDateKey(leave.from));
  const dates = leave.from === leave.to ? from : `${from} – ${dayMonth(fromDateKey(leave.to))}`;

  return (
    <View
      accessible
      accessibilityLabel={`${LEAVE_TYPE_LABELS[leave.type]}, ${dates}, ${pluralDays(leave.days)}, ${status.label}`}
      className="flex-row items-center gap-3 rounded-3xl border border-white bg-white/70 px-5 py-4"
      style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)' }}
    >
      <View className="flex-1 gap-0.5">
        <Text className="font-inter-semibold text-[15px] leading-[22px] tracking-[-0.375px] text-[#111111]">
          {LEAVE_TYPE_LABELS[leave.type]}
        </Text>
        <Text numberOfLines={1} className="font-inter-medium text-xs leading-[18px] text-[#999999]">
          {dates} · {pluralDays(leave.days)}
          {leave.reason ? ` · ${leave.reason}` : ''}
        </Text>
      </View>
      <View
        className="flex-row items-center gap-1 rounded-full border py-1 pl-[9px] pr-3"
        style={{ backgroundColor: status.background, borderColor: status.border }}
      >
        <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
        <Text className="font-inter-medium text-[10px] leading-4" style={{ color: status.text }}>
          {status.label}
        </Text>
      </View>
    </View>
  );
}
