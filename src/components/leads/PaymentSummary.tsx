import { Text, View } from 'react-native';

import type { Payment } from '@/services/leadsService';
import { groupDigits } from '@/utils/format';

// Deal amount, the agency's cut, and what's left for the creator. An amount that isn't agreed
// yet shows as a dash.

function rupees(amount: number | null) {
  return amount === null ? '—' : `₹${groupDigits(Math.round(amount))}`;
}

export function PaymentSummary({ payment }: { payment: Payment }) {
  return (
    <View
      accessible
      accessibilityLabel={`Payment summary. Deal amount ${rupees(payment.amount)}, agency fee ${rupees(payment.agencyFee)}, payout ${rupees(payment.payout)}`}
      className="gap-4 rounded-[20px] border border-[rgba(232,226,217,0.5)] bg-white px-5 pb-5 pt-8"
    >
      <Text className="font-inter-semibold text-base leading-[19px] text-[#1D1D1F]">
        Payment Summary
      </Text>
      <View className="flex-row items-center justify-between pt-1">
        <Text className="font-inter-medium text-sm leading-[17px] text-[#1D1D1F]">Deal amount</Text>
        <Text className="font-inter-medium text-sm leading-[17px] text-[#1D1D1F]">
          {rupees(payment.amount)}
        </Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="font-inter-medium text-sm leading-[21px] text-[#6E6E73]">Agency fee</Text>
        <Text className="font-inter-medium text-sm leading-[21px] text-[#6E6E73]">
          {payment.agencyFee === null ? '—' : `−${rupees(payment.agencyFee)}`}
        </Text>
      </View>
      <View className="h-px bg-[#F2F2F7]" />
      <View className="flex-row items-center justify-between">
        <Text className="font-inter-semibold text-base leading-5 text-[#1D1D1F]">Your payout</Text>
        <Text className="font-inter-bold text-xl leading-6 text-[#2B9A57]">
          {rupees(payment.payout)}
        </Text>
      </View>
    </View>
  );
}
