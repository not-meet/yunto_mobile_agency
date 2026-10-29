import { Pencil } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { rupees } from '@/components/campaigns/labels';

// A white card of creator payouts: a header (the title and subtotal on one line, or with a
// subtitle, the title and an optional tag over the subtitle and subtotal), the rows, and an
// optional agency fee footer, with a pencil to change the fee when `onEditFee` is given.

const SECTION_CARD = 'rounded-3xl border border-[#F5F5F4] bg-white p-4';
const SECTION_SHADOW = '0px 1px 2px rgba(0, 0, 0, 0.05)';

interface PayoutSectionProps {
  title: string;
  // e.g. "External". Shown only with a subtitle.
  tag?: string;
  // e.g. "Creator payouts (External)".
  subtitle?: string;
  total: number;
  fee?: { percent: number | null; amount: number | null };
  onEditFee?: () => void;
  children: ReactNode;
}

export function PayoutSection({
  title,
  tag,
  subtitle,
  total,
  fee,
  onEditFee,
  children,
}: PayoutSectionProps) {
  return (
    <View className={SECTION_CARD} style={{ boxShadow: SECTION_SHADOW }}>
      {subtitle ? (
        <View className="gap-0.5 border-b border-[#F5F5F4] pb-3">
          <View className="flex-row items-center justify-between gap-3">
            <Text
              accessibilityRole="header"
              numberOfLines={1}
              className="shrink font-jakarta-bold text-sm leading-5 text-[#1A1C1E]"
            >
              {title}
            </Text>
            {tag ? (
              <Text className="font-jakarta-medium text-[11px] leading-4 text-[#A8A29E]">
                {tag}
              </Text>
            ) : null}
          </View>
          <View className="flex-row items-center justify-between gap-3">
            <Text
              numberOfLines={1}
              className="shrink font-jakarta-medium text-xs leading-4 text-[#8C8E95]"
            >
              {subtitle}
            </Text>
            <Text className="font-jakarta-bold text-sm leading-5 text-[#1A1C1E]">
              {rupees(total)}
            </Text>
          </View>
        </View>
      ) : (
        <View className="flex-row items-center justify-between gap-3 border-b border-[#F5F5F4] pb-3.5">
          <Text
            accessibilityRole="header"
            numberOfLines={1}
            className="shrink font-inter-semibold text-sm leading-5 text-[#1A1C1E]"
          >
            {title}
          </Text>
          <Text className="font-inter-semibold text-sm leading-5 text-[#1A1C1E]">
            {rupees(total)}
          </Text>
        </View>
      )}

      <View className="pb-3">{children}</View>

      {fee ? (
        <View
          accessible={!onEditFee}
          accessibilityLabel={`Agency fee${fee.percent === null ? '' : ` ${fee.percent}%`}, ${rupees(fee.amount)}`}
          className="flex-row items-center justify-between gap-3 rounded-[20px] border border-[#F5F5F4] bg-[#F9F7F2] px-3.5 py-3"
        >
          <View className="flex-row items-center gap-1.5">
            <Text className="font-jakarta-medium text-xs leading-4 text-[#1A1C1E]">Agency fee</Text>
            {fee.percent !== null ? (
              <Text className="font-jakarta-semibold text-xs leading-4 text-[#189547]">
                ({fee.percent}%)
              </Text>
            ) : null}
          </View>
          <View className="flex-row items-center gap-2.5">
            <Text className="font-jakarta-bold text-sm leading-5 text-[#1A1C1E]">
              {rupees(fee.amount)}
            </Text>
            {onEditFee ? (
              <Pressable
                onPress={onEditFee}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`Edit agency fee for ${title}`}
                className="h-7 w-7 items-center justify-center rounded-full border border-[#E7E5E4] bg-white active:opacity-70"
              >
                <Pencil size={14} color="#57534E" strokeWidth={1.17} />
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}
