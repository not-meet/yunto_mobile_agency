import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { rupees } from '@/components/campaigns/labels';
import { usePressScale } from '@/hooks/usePressScale';
import type { CampaignDetails } from '@/services/campaignsService';

// The brand's budget, what the creators cost and what the agency earns. Opens the full payment
// summary.

export function CampaignPaymentCard({
  payment,
  onOpen,
}: {
  payment: CampaignDetails['payment'];
  onOpen: () => void;
}) {
  const press = usePressScale(0.98);

  return (
    <Animated.View style={press.style}>
      <Pressable
        {...press.handlers}
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`Payment summary. Brand budget ${rupees(payment.brandBudget)}, creator budget ${rupees(payment.creatorBudget)}, estimate payout ${rupees(payment.estimatePayout)}`}
        accessibilityHint="Opens the payment summary"
        className="gap-4 rounded-[20px] border border-[rgba(232,226,217,0.5)] bg-white px-5 pb-5 pt-8"
      >
        <View className="flex-row items-center justify-between">
          <Text className="font-inter-semibold text-base leading-[19px] text-[#1D1D1F]">
            Payment Summary
          </Text>
          <ChevronRight size={20} color="#8A8A8E" strokeWidth={1.67} />
        </View>
        <View className="flex-row items-center justify-between pt-1">
          <Text className="font-inter-medium text-sm leading-[17px] text-[#1D1D1F]">
            Brand budget
          </Text>
          <Text className="font-inter-medium text-sm leading-[17px] text-[#1D1D1F]">
            {rupees(payment.brandBudget)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="font-inter-medium text-sm leading-[21px] text-[#6E6E73]">
            Creator budget
          </Text>
          <Text className="font-inter-medium text-sm leading-[21px] text-[#6E6E73]">
            {rupees(payment.creatorBudget)}
          </Text>
        </View>
        <View className="h-px bg-[#F2F2F7]" />
        <View className="flex-row items-center justify-between">
          <Text className="font-inter-semibold text-base leading-5 text-[#1D1D1F]">
            Estimate payout
          </Text>
          <Text className="font-inter-bold text-xl leading-6 text-[#2B9A57]">
            {rupees(payment.estimatePayout)}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
