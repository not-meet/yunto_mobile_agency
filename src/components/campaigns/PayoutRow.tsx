import { Pencil } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { initialOf, NEGOTIATION_STYLES, payoutTone, rupees } from '@/components/campaigns/labels';
import type { CreatorPayout } from '@/services/paymentsService';

// One creator in the payment summary: initials, name, and either what they're making or where
// their fee stands; the amount, with what they first asked struck through above it; and, on a
// lead, a pencil to edit it, amber while their agency's proposal waits on approval.

interface PayoutRowProps {
  payout: CreatorPayout;
  index: number;
  // Show where the fee stands instead of the deliverables.
  showNegotiation: boolean;
  first: boolean;
  // Left out, the payout can't be edited (on a campaign).
  onEdit?: () => void;
}

export function PayoutRow({ payout, index, showNegotiation, first, onEdit }: PayoutRowProps) {
  const tone = payoutTone(index);
  const negotiation = NEGOTIATION_STYLES[payout.negotiation];
  const needsApproval = payout.negotiation === 'action_needed';

  return (
    <View
      className={`flex-row items-center justify-between gap-3 py-3 ${
        first ? '' : 'border-t border-[#F5F5F4]'
      }`}
    >
      <View
        accessible
        accessibilityLabel={`${payout.name}, ${
          showNegotiation ? negotiation.label : (payout.deliverables ?? 'no deliverables yet')
        }, ${rupees(payout.amount)}${
          payout.originalAmount !== null ? `, down from ${rupees(payout.originalAmount)}` : ''
        }`}
        className="flex-1 flex-row items-center gap-3"
      >
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: tone.background }}
        >
          <Text className="font-jakarta-bold text-xs leading-4" style={{ color: tone.text }}>
            {initialOf(payout.name)}
          </Text>
        </View>
        <View className={`flex-1 items-start ${showNegotiation ? 'gap-1' : ''}`}>
          <Text numberOfLines={1} className="font-jakarta-bold text-xs leading-4 text-[#1A1C1E]">
            {payout.name}
          </Text>
          {showNegotiation ? (
            <View
              className="rounded-full border px-2 py-0.5"
              style={{ backgroundColor: negotiation.background, borderColor: negotiation.border }}
            >
              <Text
                className="font-jakarta-semibold text-[10px] leading-[15px]"
                style={{ color: negotiation.text }}
              >
                {negotiation.label}
              </Text>
            </View>
          ) : payout.deliverables ? (
            <Text
              numberOfLines={1}
              className="font-jakarta-medium text-[11px] leading-4 text-[#8C8E95]"
            >
              {payout.deliverables}
            </Text>
          ) : null}
        </View>
      </View>
      <View className="flex-row items-center gap-2.5">
        <View className="items-end gap-0.5">
          {payout.originalAmount !== null ? (
            <Text className="font-jakarta-medium text-[10px] leading-[10px] text-[#A8A29E] line-through">
              {rupees(payout.originalAmount)}
            </Text>
          ) : null}
          <Text className="font-jakarta-bold text-xs leading-4 text-[#1A1C1E]">
            {rupees(payout.amount)}
          </Text>
        </View>
        {onEdit ? (
          <Pressable
            onPress={onEdit}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={
              needsApproval
                ? `Approval required for ${payout.name}`
                : `Edit payout for ${payout.name}`
            }
            className={`h-7 w-7 items-center justify-center rounded-full border active:opacity-70 ${
              needsApproval ? 'border-[#FCD34D] bg-[#FEE9C9]' : 'border-[#E7E5E4]'
            }`}
          >
            <Pencil size={14} color={needsApproval ? '#78350F' : '#57534E'} strokeWidth={1.17} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
