import { Text, View } from 'react-native';

import type { BookingQuote } from '@/services/talentService';
import { groupDigits } from '@/utils/format';

// What the booking comes to: the tier's rate, each add-on, the platform fee and GST, then the
// total.

const rupees = (amount: number) => `₹${groupDigits(amount)}`;

function Row({
  label,
  amount,
  strong = false,
}: {
  label: string;
  amount: number;
  strong?: boolean;
}) {
  return (
    <View className="flex-row items-start justify-between gap-4">
      <Text
        numberOfLines={1}
        className="shrink font-inter-regular text-sm leading-[17px] text-[#555555]"
      >
        {label}
      </Text>
      <Text
        className={`text-sm leading-[17px] ${
          strong ? 'font-inter-semibold text-[#1A1A1A]' : 'font-inter-regular text-[#555555]'
        }`}
      >
        {rupees(amount)}
      </Text>
    </View>
  );
}

interface CostBreakdownProps {
  quote: BookingQuote;
  // e.g. "Base Rate (4 hrs shoot)".
  baseLabel: string;
  // Each chosen add-on with its price.
  addOns: { label: string; amount: number }[];
}

export function CostBreakdown({ quote, baseLabel, addOns }: CostBreakdownProps) {
  return (
    <View className="gap-3">
      <Text
        accessibilityRole="header"
        className="font-inter-bold text-[15px] leading-[18px] text-[#1A1A1A]"
      >
        Cost Breakdown
      </Text>
      <View
        className="gap-3 rounded-[20px] bg-white p-5"
        style={{ boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.04)' }}
      >
        <Row label={baseLabel} amount={quote.base} />
        {addOns.map(({ label, amount }) => (
          <Row key={label} label={label} amount={amount} />
        ))}
        <Row label="Platform Fee (5%)" amount={quote.platformFee} />
        <View className="pt-2">
          <Row label="GST (18%)" amount={quote.gst} strong />
        </View>
        <View className="h-px bg-[#EAEAEA]" />
        <View
          accessible
          accessibilityLabel={`Total, ${rupees(quote.total)}`}
          className="flex-row items-center justify-between pt-1"
        >
          <Text className="font-inter-extrabold text-lg leading-[22px] text-[#1A1A1A]">Total</Text>
          <Text className="font-inter-extrabold text-lg leading-[22px] text-[#7E57C2]">
            {rupees(quote.total)}
          </Text>
        </View>
      </View>
    </View>
  );
}
