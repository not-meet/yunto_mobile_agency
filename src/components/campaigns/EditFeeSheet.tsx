import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { rupees } from '@/components/campaigns/labels';
import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import type { AgencyFeeMutation } from '@/hooks/usePayments';
import type { PayoutGroup } from '@/services/paymentsService';
import { PLACEHOLDER_COLOR } from '@/utils/constants';
import { showToast } from '@/utils/notifications';
import { sanitizeDecimal } from '@/utils/sanitize';

// Changing the agency fee on one group of a lead's or campaign's payouts, as a percentage of
// their subtotal, through the caller's `setFee`. The caller keys it per group so the field starts from the current fee, and it closes
// once the change lands.

interface EditFeeSheetProps {
  setFee: AgencyFeeMutation;
  group: PayoutGroup | null;
  visible: boolean;
  onClose: () => void;
}

export function EditFeeSheet({ setFee, group, visible, onClose }: EditFeeSheetProps) {
  const [text, setText] = useState(group?.feePercent == null ? '' : String(group.feePercent));
  const close = setFee.isPending ? () => {} : onClose;

  const percent = text ? Number(text) : null;
  const valid = percent !== null && percent >= 0 && percent <= 100;
  const unchanged = percent === group?.feePercent;
  const preview =
    valid && group ? rupees(Math.round((group.subtotal * percent) / 100)) : rupees(null);

  const save = () => {
    if (!group || !valid || unchanged || setFee.isPending) return;
    setFee.mutate(
      { groupKey: group.key, percent },
      {
        onSuccess: () => {
          onClose();
          showToast('Agency fee updated');
        },
      },
    );
  };

  return (
    <BottomSheet visible={visible} onClose={close} title="Edit agency fee">
      {group ? (
        <View className="gap-4 pt-2">
          <View className="gap-1">
            <Text className="font-jakarta-bold text-base leading-6 text-[#1A1C1E]">
              {group.agency ?? 'Creator payouts (internal)'}
            </Text>
            <Text className="font-jakarta-medium text-xs leading-4 text-[#8C8E95]">
              On {rupees(group.subtotal)} of payouts: {preview}
            </Text>
          </View>

          <View className="h-[52px] flex-row items-center gap-2 rounded-2xl bg-[#F9F9F9] px-4">
            <TextInput
              value={text}
              onChangeText={(next) => {
                setText(sanitizeDecimal(next, 3, 1));
                if (setFee.isError) setFee.reset();
              }}
              onSubmitEditing={save}
              placeholder="Agency fee"
              placeholderTextColor={PLACEHOLDER_COLOR}
              keyboardType="decimal-pad"
              returnKeyType="done"
              accessibilityLabel="Agency fee, in percent"
              className="flex-1 py-0 font-jakarta-semibold text-base leading-5 text-[#1A1C1E]"
            />
            <Text className="font-jakarta-bold text-base leading-5 text-[#1A1C1E]">%</Text>
          </View>

          {setFee.isError ? (
            <Text
              accessibilityLiveRegion="polite"
              className="-mt-2 pl-1 font-inter-medium text-[13px] leading-4 text-rose-500"
            >
              Couldn’t update the agency fee. Please try again.
            </Text>
          ) : null}

          <Button
            label="Save fee"
            onPress={save}
            disabled={!valid || unchanged}
            disabledReason={
              percent === null
                ? 'Enter a fee'
                : !valid
                  ? 'The fee can be at most 100%'
                  : unchanged
                    ? 'Change the fee first'
                    : null
            }
            loading={setFee.isPending}
          />
        </View>
      ) : null}
    </BottomSheet>
  );
}
