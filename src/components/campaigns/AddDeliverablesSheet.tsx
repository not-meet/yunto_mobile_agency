import { type LucideIcon, Minus, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, useReducedMotion } from 'react-native-reanimated';

import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { FieldLabel } from '@/components/leads/FieldLabel';
import { CONTENT_STYLES } from '@/components/leads/labels';
import { InstagramIcon } from '@/components/leads/PlatformIcons';
import {
  type AddDeliverablesInput,
  DELIVERABLE_QUANTITY_MAX,
  DELIVERABLE_TITLE_MAX,
  DELIVERABLE_TYPES,
  type DeliverableType,
} from '@/services/leadsService';
import { PLACEHOLDER_COLOR } from '@/utils/constants';
import { sanitizeLeadText } from '@/utils/sanitize';

// Adding to a lead's or campaign's scope: the platform, how many of each kind of piece (any
// number of kinds), and an optional title. The caller keys it per opening so it starts empty, and
// closes it once the add succeeds.

type Quantities = Record<DeliverableType, number>;

const EMPTY: Quantities = { reel: 0, post: 0, story: 0, ugc: 0 };

function StepButton({
  icon: Icon,
  label,
  onPress,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      className={`h-8 w-8 items-center justify-center rounded-full bg-[#F4F4F6] active:opacity-70 ${
        disabled ? 'opacity-40' : ''
      }`}
    >
      <Icon size={16} color="#1D1D1F" strokeWidth={1.67} />
    </Pressable>
  );
}

// One kind of piece: its icon and name, then −  n  +. The number rolls up or down with the step.
// Also the edit sheet's, which won't go below 1.
export function QuantityRow({
  type,
  value,
  onChange,
  last,
  min = 0,
}: {
  type: DeliverableType;
  value: number;
  onChange: (n: number) => void;
  last: boolean;
  min?: number;
}) {
  const reduceMotion = useReducedMotion();
  const [rising, setRising] = useState(true);
  const { label, icon: Icon, color, background } = CONTENT_STYLES[type];

  const step = (by: 1 | -1) => {
    const next = value + by;
    if (next < min || next > DELIVERABLE_QUANTITY_MAX) return;
    setRising(by > 0);
    onChange(next);
  };

  return (
    <View
      className={`flex-row items-center py-3 ${last ? '' : 'border-b border-[#F2F2F7]'}`}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max: DELIVERABLE_QUANTITY_MAX, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
    >
      <View
        className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: background }}
      >
        <Icon size={20} color={color} strokeWidth={1.67} />
      </View>
      <Text className="flex-1 font-inter-semibold text-[15px] leading-[18px] text-[#1D1D1F]">
        {label}
      </Text>
      <View className="flex-row items-center gap-3">
        <StepButton
          icon={Minus}
          label={`Fewer ${label}`}
          onPress={() => step(-1)}
          disabled={value <= min}
        />
        <View className="h-[19px] min-w-5 items-center overflow-hidden">
          <Animated.Text
            key={value}
            entering={reduceMotion ? undefined : (rising ? FadeInUp : FadeInDown).duration(180)}
            className={`text-center font-inter-bold text-[15px] leading-[18px] ${
              value > 0 ? 'text-[#1D1D1F]' : 'text-[#8A8A8E]'
            }`}
          >
            {value}
          </Animated.Text>
        </View>
        <StepButton
          icon={Plus}
          label={`More ${label}`}
          onPress={() => step(1)}
          disabled={value >= DELIVERABLE_QUANTITY_MAX}
        />
      </View>
    </View>
  );
}

interface AddDeliverablesSheetProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (input: AddDeliverablesInput) => void;
  busy: boolean;
  error: string | null;
}

export function AddDeliverablesSheet({
  visible,
  onClose,
  onAdd,
  busy,
  error,
}: AddDeliverablesSheetProps) {
  const [quantities, setQuantities] = useState<Quantities>(EMPTY);
  const [title, setTitle] = useState('');
  const close = busy ? () => {} : onClose;

  const items = DELIVERABLE_TYPES.filter((type) => quantities[type] > 0).map((type) => ({
    type,
    quantity: quantities[type],
  }));

  const add = () => {
    if (busy || items.length === 0) return;
    onAdd({ platform: 'instagram', items, title: title.trim() || null });
  };

  return (
    <BottomSheet visible={visible} onClose={close} title="Add deliverables">
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 16, paddingTop: 16 }}
      >
        <View className="gap-2">
          <FieldLabel>Platform</FieldLabel>
          {/* Instagram's the only platform for now; this becomes a picker when there are more. */}
          <View
            accessible
            accessibilityLabel="Platform, Instagram"
            className="h-[52px] flex-row items-center gap-2.5 rounded-2xl bg-[#F9F9F9] px-4"
          >
            <InstagramIcon size={18} color="#C13FBA" />
            <Text className="font-inter-medium text-sm leading-[17px] text-[#1D1D1F]">
              Instagram
            </Text>
          </View>
        </View>

        <View className="gap-1">
          <FieldLabel>Deliverables</FieldLabel>
          <View>
            {DELIVERABLE_TYPES.map((type, i) => (
              <QuantityRow
                key={type}
                type={type}
                value={quantities[type]}
                onChange={(n) => setQuantities((current) => ({ ...current, [type]: n }))}
                last={i === DELIVERABLE_TYPES.length - 1}
              />
            ))}
          </View>
          <Text className="font-inter text-[13px] leading-4 text-[#8A8A8E]">
            Pick a quantity for one or more.
          </Text>
        </View>

        <View className="gap-2">
          <FieldLabel>Title</FieldLabel>
          <TextInput
            value={title}
            onChangeText={(next) => setTitle(sanitizeLeadText(next, DELIVERABLE_TITLE_MAX))}
            onSubmitEditing={add}
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
          label="Add deliverables"
          onPress={add}
          disabled={items.length === 0}
          disabledReason={items.length === 0 ? 'Pick a quantity first' : null}
          loading={busy}
        />
      </ScrollView>
    </BottomSheet>
  );
}
