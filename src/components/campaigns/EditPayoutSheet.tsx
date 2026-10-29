import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { NEGOTIATION_STYLES, rupees } from '@/components/campaigns/labels';
import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { useApproveLeadPayout, useUpdateLeadPayout } from '@/hooks/usePayments';
import { type CreatorPayout, PAYOUT_MAX } from '@/services/paymentsService';
import { PLACEHOLDER_COLOR } from '@/utils/constants';
import { showToast } from '@/utils/notifications';
import { sanitizeDigits } from '@/utils/sanitize';

// Changing what a creator is paid on a lead, as the web's payment summary does. While another agency's
// proposed amount waits on approval, it can be approved as it stands instead. The caller keys it
// per creator so the field starts from their current amount, and it closes once a change lands.

const AMOUNT_DIGITS = String(PAYOUT_MAX).length;

interface EditPayoutSheetProps {
  leadId: string;
  payout: CreatorPayout | null;
  visible: boolean;
  onClose: () => void;
}

export function EditPayoutSheet({ leadId, payout, visible, onClose }: EditPayoutSheetProps) {
  const update = useUpdateLeadPayout(leadId);
  const approve = useApproveLeadPayout(leadId);
  const [text, setText] = useState(payout?.amount === null ? '' : String(payout?.amount ?? ''));
  const busy = update.isPending || approve.isPending;
  const close = busy ? () => {} : onClose;

  const amount = text ? Number(text) : 0;
  const unchanged = amount === payout?.amount;
  const needsApproval = payout?.negotiation === 'action_needed';

  const save = () => {
    if (!payout || busy || amount <= 0 || unchanged) return;
    approve.reset();
    update.mutate(
      { creatorId: payout.id, amount },
      {
        onSuccess: () => {
          onClose();
          showToast('Payout updated');
        },
      },
    );
  };

  const approveProposal = () => {
    if (!payout || busy) return;
    update.reset();
    approve.mutate(payout.id, {
      onSuccess: () => {
        onClose();
        showToast(`${payout.name}’s payout approved`);
      },
    });
  };

  const error = update.isError
    ? 'Couldn’t update the payout. Please try again.'
    : approve.isError
      ? 'Couldn’t approve the payout. Please try again.'
      : null;

  return (
    <BottomSheet visible={visible} onClose={close} title="Edit payout">
      {payout ? (
        <View className="gap-4 pt-2">
          <View className="gap-1">
            <Text className="font-jakarta-bold text-base leading-6 text-[#1A1C1E]">
              {payout.name}
            </Text>
            <Text className="font-jakarta-medium text-xs leading-4 text-[#8C8E95]">
              {needsApproval
                ? `Their agency proposed ${rupees(payout.amount)}. ${NEGOTIATION_STYLES.action_needed.label}.`
                : (payout.deliverables ?? 'No deliverables yet')}
            </Text>
          </View>

          <View className="h-[52px] flex-row items-center gap-2 rounded-2xl bg-[#F9F9F9] px-4">
            <Text className="font-jakarta-bold text-base leading-5 text-[#1A1C1E]">₹</Text>
            <TextInput
              value={text}
              onChangeText={(next) => {
                setText(sanitizeDigits(next, AMOUNT_DIGITS));
                if (update.isError) update.reset();
              }}
              onSubmitEditing={save}
              placeholder="Payout amount"
              placeholderTextColor={PLACEHOLDER_COLOR}
              keyboardType="number-pad"
              returnKeyType="done"
              accessibilityLabel={`Payout for ${payout.name}, in rupees`}
              className="flex-1 py-0 font-jakarta-semibold text-base leading-5 text-[#1A1C1E]"
            />
          </View>

          {error ? (
            <Text
              accessibilityLiveRegion="polite"
              className="-mt-2 pl-1 font-inter-medium text-[13px] leading-4 text-rose-500"
            >
              {error}
            </Text>
          ) : null}

          <View className="gap-3">
            <Button
              label="Save payout"
              onPress={save}
              disabled={amount <= 0 || unchanged || approve.isPending}
              disabledReason={
                amount <= 0 ? 'Enter an amount' : unchanged ? 'Change the amount first' : null
              }
              loading={update.isPending}
            />
            {needsApproval ? (
              <Button
                label={`Approve ${rupees(payout.amount)}`}
                variant="secondary"
                onPress={approveProposal}
                disabled={update.isPending}
                loading={approve.isPending}
              />
            ) : null}
          </View>
        </View>
      ) : null}
    </BottomSheet>
  );
}
