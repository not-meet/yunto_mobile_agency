import { CalendarDays, ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { StatFigure, StatsCard } from '@/components/team/StatsCard';
import { LEAVE_TYPE_LABELS, pluralDays } from '@/components/team/labels';
import type { Leaves } from '@/services/leaveService';

// The Leaves card: days left of each kind, and "Apply for leave" to open the sheet.

interface LeaveBalanceCardProps {
  balance: Leaves['balance'];
  onApply: () => void;
}

export function LeaveBalanceCard({ balance, onApply }: LeaveBalanceCardProps) {
  return (
    <StatsCard
      title="Leaves"
      icon={CalendarDays}
      tone={{ color: '#EA580C', background: '#FFEDD5' }}
    >
      <View className="flex-row items-end justify-between px-5 pb-4 pt-4">
        <StatFigure
          label="Leave balance"
          value={pluralDays(balance.casual)}
          caption={LEAVE_TYPE_LABELS.casual}
        />
        <View className="pr-6">
          <StatFigure value={pluralDays(balance.paid)} caption={LEAVE_TYPE_LABELS.paid} />
        </View>
      </View>

      <Pressable
        onPress={onApply}
        accessibilityRole="button"
        accessibilityLabel="Apply for leave"
        className="mx-4 mb-4 h-[54px] flex-row items-center justify-center gap-3 rounded-[40px] border border-white/60 bg-white/50 active:opacity-70"
        style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)' }}
      >
        <Text className="font-inter-medium text-sm leading-5 text-[#111111]">Apply for leave</Text>
        <ChevronRight size={18} color="#64748B" strokeWidth={2} />
      </Pressable>
    </StatsCard>
  );
}
