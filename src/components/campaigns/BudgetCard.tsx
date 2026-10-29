import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { rupees } from '@/components/campaigns/labels';
import type { Payments } from '@/services/paymentsService';

// Top of the payment summary: the lead or campaign and its status, what the agency stands to
// earn, and the brand's budget against what the creators cost and what it will spend, flagged
// under or over budget.

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <View
      className="min-h-[66px] flex-1 gap-[9px] rounded-[20px] bg-white px-2.5 pb-2.5 pt-[9px]"
      style={{ boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.02)' }}
    >
      <Text className="font-inter-medium text-[11px] leading-4 text-[#8C8E95]">{label}</Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        className="font-inter-semibold text-[13px] leading-5 tracking-[-0.325px] text-[#1A1C1E]"
      >
        {value}
      </Text>
    </View>
  );
}

interface BudgetCardProps {
  name: string;
  // e.g. "Zostel · 3 creators".
  subtitle: string;
  // e.g. "Active", green when `active`.
  badge: { label: string; active: boolean };
  payments: Payments;
}

export function BudgetCard({ name, subtitle, badge, payments }: BudgetCardProps) {
  const running = badge.active;
  const over = payments.brandBudget === null ? null : payments.estimateSpend > payments.brandBudget;

  return (
    <View
      className="gap-3.5 rounded-3xl border border-[rgba(243,232,255,0.6)] bg-[#ECEBFE] p-5"
      style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="font-inter-semibold text-lg leading-[25px] text-[#1A1C1E]"
          >
            {name}
          </Text>
          <Text numberOfLines={1} className="font-inter-medium text-xs leading-4 text-[#8C8E95]">
            {subtitle}
          </Text>
        </View>
        <View
          className={`rounded-full border px-2.5 py-0.5 ${
            running ? 'border-[rgba(167,243,208,0.5)] bg-[#EAF7EE]' : 'border-[#E7E5E4] bg-white/70'
          }`}
        >
          <Text
            className={`font-jakarta-semibold text-[11px] leading-4 ${
              running ? 'text-[#1E9E4B]' : 'text-[#57534E]'
            }`}
          >
            {badge.label}
          </Text>
        </View>
      </View>

      <View className="gap-0.5">
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          className="font-inter-bold text-[32px] leading-10 tracking-[-0.8px] text-[#1A1C1E]"
        >
          {rupees(payments.estimatePayout)}
        </Text>
        <Text className="font-inter-medium text-xs leading-4 text-[#8C8E95]">Estimate payout</Text>
      </View>

      <View className="flex-row gap-2 pt-0.5">
        <MiniCard label="Brand" value={rupees(payments.brandBudget)} />
        <MiniCard label="Creator" value={rupees(payments.creatorBudget)} />
        <View
          accessible
          accessibilityLabel={`Estimated spend ${rupees(payments.estimateSpend)}${
            over === null ? '' : over ? ', over budget' : ', under budget'
          }`}
          className="min-h-[66px] flex-1 gap-[2.5px] rounded-[20px] bg-white p-2.5"
          style={{ boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.02)' }}
        >
          <Text className="font-inter-medium text-[11px] leading-[11px] text-[#8C8E95]">
            Est. spend
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            className="font-inter-semibold text-[13px] leading-5 tracking-[-0.325px] text-[#1A1C1E]"
          >
            {rupees(payments.estimateSpend)}
          </Text>
          {over !== null ? (
            <View className="flex-row items-center gap-0.5">
              {over ? (
                <TrendingUp size={10} color="#E74C3C" strokeWidth={1.5} />
              ) : (
                <TrendingDown size={10} color="#4C64DE" strokeWidth={1.5} />
              )}
              <Text
                className="font-jakarta-medium text-[9.5px] leading-[10px]"
                style={{ color: over ? '#E74C3C' : '#4C64DE' }}
              >
                {over ? 'Over budget' : 'Under budget'}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
