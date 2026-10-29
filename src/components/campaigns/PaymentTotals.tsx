import { Text, View } from 'react-native';

import { rupees } from '@/components/campaigns/labels';
import type { Payments } from '@/services/paymentsService';

// Foot of the payment summary: what the brand has paid in so far, then the brand's budget over
// creator payouts, agency fees and GST adding up to the grand total.

function Line({ label, value, strong }: { label: string; value: number | null; strong?: boolean }) {
  const text = strong
    ? 'font-inter-medium text-sm leading-[17px] text-[#1D1D1F]'
    : 'font-inter-medium text-sm leading-[21px] text-[#6E6E73]';
  return (
    <View
      accessible
      className={`flex-row items-center justify-between gap-3 ${strong ? 'pt-1' : ''}`}
    >
      <Text numberOfLines={1} className={`shrink ${text}`}>
        {label}
      </Text>
      <Text className={text}>{rupees(value)}</Text>
    </View>
  );
}

export function PaymentTotals({ payments }: { payments: Payments }) {
  const { totals } = payments;

  return (
    <>
      {payments.advanceReceived !== null ? (
        <View
          accessible
          className="flex-row items-center justify-between rounded-[20px] border border-[#D5EFE1] bg-[#E5F5ED] px-4 py-3.5"
        >
          <Text className="font-jakarta-bold text-sm leading-5 text-[#1A1C1E]">
            Advance received
          </Text>
          <Text className="font-jakarta-bold text-sm leading-5 text-[#1A1C1E]">
            {rupees(payments.advanceReceived)}
          </Text>
        </View>
      ) : null}

      <View className="gap-4 rounded-[20px] border border-[rgba(232,226,217,0.5)] bg-white px-5 pb-5 pt-8">
        <Text
          accessibilityRole="header"
          className="font-inter-semibold text-base leading-[19px] text-[#1D1D1F]"
        >
          Payment Summary
        </Text>
        <Line label="Brand budget" value={payments.brandBudget} strong />
        <Line label="Creator payouts" value={totals.creatorPayouts} />
        <Line label="Agency fees" value={totals.agencyFees} />
        <Line label="GST (18%)" value={totals.gst} />
        <View className="h-px bg-[#F2F2F7]" />
        <View accessible className="flex-row items-center justify-between gap-3">
          <Text className="font-inter-semibold text-base leading-5 text-[#1D1D1F]">
            Grand total
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            className="shrink font-inter-bold text-xl leading-6 text-[#2B9A57]"
          >
            {rupees(totals.grandTotal)}
          </Text>
        </View>
      </View>
    </>
  );
}
