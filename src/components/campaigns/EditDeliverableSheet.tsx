import { Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { QuantityRow } from '@/components/campaigns/AddDeliverablesSheet';
import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { FieldLabel } from '@/components/leads/FieldLabel';
import {
  DELIVERABLE_TITLE_MAX,
  type Deliverable,
  type UpdateDeliverableInput,
} from '@/services/leadsService';
import { PLACEHOLDER_COLOR } from '@/utils/constants';
import { sanitizeLeadText } from '@/utils/sanitize';

// Changing one deliverable on a lead or campaign: how many pieces and its title, or removing it.
// The caller keys it per opening so it starts from the deliverable as it is, and closes it once a
// save or remove succeeds.

interface EditDeliverableSheetProps {
  visible: boolean;
  onClose: () => void;
  // null while nothing's being edited; the sheet keeps its last one so it closes intact.
  deliverable: Deliverable | null;
  onSave: (input: UpdateDeliverableInput) => void;
  onRemove: () => void;
  saving: boolean;
  removing: boolean;
  error: string | null;
}

export function EditDeliverableSheet({
  visible,
  onClose,
  deliverable,
  onSave,
  onRemove,
  saving,
  removing,
  error,
}: EditDeliverableSheetProps) {
  const [quantity, setQuantity] = useState(deliverable?.quantity ?? 1);
  const [title, setTitle] = useState(deliverable?.note ?? '');
  const busy = saving || removing;
  const close = busy ? () => {} : onClose;
  const unchanged =
    quantity === deliverable?.quantity && title.trim() === (deliverable?.note ?? '');

  const save = () => {
    if (busy || unchanged) return;
    onSave({ quantity, title: title.trim() || null });
  };

  return (
    <BottomSheet visible={visible} onClose={close} title="Edit deliverable">
      {deliverable ? (
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ gap: 16, paddingTop: 16 }}
        >
          <View className="gap-1">
            <FieldLabel>Quantity</FieldLabel>
            <QuantityRow
              type={deliverable.type}
              value={quantity}
              onChange={setQuantity}
              last
              min={1}
            />
          </View>

          <View className="gap-2">
            <FieldLabel>Title</FieldLabel>
            <TextInput
              value={title}
              onChangeText={(next) => setTitle(sanitizeLeadText(next, DELIVERABLE_TITLE_MAX))}
              onSubmitEditing={save}
              placeholder="e.g. Launch week (optional)"
              placeholderTextColor={PLACEHOLDER_COLOR}
              returnKeyType="done"
              accessibilityLabel="Title"
              className="h-[52px] rounded-2xl bg-[#F9F9F9] px-4 py-0 font-inter text-sm leading-[17px] text-[#1D1D1F]"
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

          <Button
            label="Save changes"
            onPress={save}
            disabled={unchanged || removing}
            disabledReason={unchanged ? 'Change the quantity or title first' : null}
            loading={saving}
          />
          <Pressable
            onPress={onRemove}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${deliverable.title}`}
            accessibilityState={{ disabled: busy, busy: removing }}
            className={`h-12 flex-row items-center justify-center gap-2 rounded-full active:opacity-70 ${
              busy ? 'opacity-60' : ''
            }`}
          >
            {removing ? (
              <ActivityIndicator size="small" color="#E74C3C" />
            ) : (
              <>
                <Trash2 size={16} color="#E74C3C" strokeWidth={1.67} />
                <Text className="font-inter-semibold text-sm leading-5 text-[#E74C3C]">
                  Remove deliverable
                </Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      ) : null}
    </BottomSheet>
  );
}
