import { Check, ChevronDown, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Keyboard, Modal, Pressable, Text, TextInput, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { useSetRevenueTarget } from '@/hooks/useHome';
import {
  type Revenue,
  setRevenueTargetRequestSchema,
  type TargetFrequency,
  targetFrequencySchema,
} from '@/services/homeService';
import { PLACEHOLDER_COLOR } from '@/utils/constants';
import { groupDigits } from '@/utils/format';

// Bottom sheet behind "Set Target", opened the same way as yunto_mobile_app's revenue goal
// sheet: fades in its backdrop and slides up. Starts from the current target each time it opens
// and closes itself once the target is saved.

const FREQUENCY_LABELS: Record<TargetFrequency, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
};
const FREQUENCIES = targetFrequencySchema.options;
const MAX_DIGITS = 12;

const FIELD_SHADOW = '0px 4px 12px rgba(0, 0, 0, 0.02), inset 0px 2px 4px 1px rgba(0, 0, 0, 0.02)';

// Height of the on-screen keyboard, 0 while it's closed. Tracked by hand rather than with
// KeyboardAvoidingView, which inside an Android modal can start out padded for a keyboard
// that isn't open, leaving a gap under the sheet.
function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => setHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardDidHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}

interface RevenueTargetSheetProps {
  visible: boolean;
  revenue: Revenue;
  onClose: () => void;
}

export function RevenueTargetSheet({ visible, revenue, onClose }: RevenueTargetSheetProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const keyboardHeight = useKeyboardHeight();
  const save = useSetRevenueTarget();
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<TargetFrequency>(revenue.frequency);
  const [picking, setPicking] = useState(false);
  const [wasVisible, setWasVisible] = useState(false);

  // Each time the sheet opens, the form starts over from the current target.
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setAmount(String(revenue.target));
      setFrequency(revenue.frequency);
      setPicking(false);
    }
  }

  const value = Number(amount);
  const request = { target: value, frequency };
  const isValid = setRevenueTargetRequestSchema.safeParse(request).success;

  // Clears a failed save so the next open doesn't show its error.
  const close = () => {
    save.reset();
    onClose();
  };

  const submit = () => {
    if (isValid && !save.isPending) save.mutate(request, { onSuccess: close });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={close}
    >
      <Pressable
        onPress={close}
        accessibilityLabel="Close"
        className="flex-1 justify-end bg-black/30"
      >
        <Animated.View
          style={
            reduceMotion
              ? undefined
              : {
                  animationName: {
                    from: { transform: [{ translateY: 600 }] },
                    to: { transform: [{ translateY: 0 }] },
                  },
                  animationDuration: 320,
                  animationTimingFunction: 'ease-out',
                }
          }
        >
          {/* Swallows taps so only the backdrop closes the sheet. Sits on the keyboard when
              it's open (its height already covers the navigation bar), else above the bar. */}
          <Pressable
            accessible={false}
            className="rounded-t-[32px] bg-white px-6 pt-4"
            style={{ paddingBottom: Math.max(keyboardHeight, insets.bottom) + 24 }}
          >
            <View className="h-1 w-10 self-center rounded-sm bg-[#E5E5E5]" />

            <View className="mt-4 flex-row items-start justify-between gap-3 pt-2">
              <Text
                accessibilityRole="header"
                className="flex-1 font-inter-semibold text-2xl leading-[29px] tracking-[-0.52px] text-ink"
              >
                Set Your Revenue Target
              </Text>
              <Pressable
                onPress={close}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Close"
                className="h-9 w-9 items-center justify-center rounded-full bg-[#F8F8F8] active:opacity-70"
              >
                <X size={20} color="#555555" strokeWidth={1.67} />
              </Pressable>
            </View>

            <View className="mt-6 gap-2">
              <Text className="pl-1 font-inter-medium text-sm leading-[17px] text-[#6B7280]">
                How much do you want to earn?
              </Text>
              <View
                className="h-[52px] flex-row items-center gap-1 rounded-[20px] border border-[#E8E8E8] bg-white/80 px-5"
                style={{ boxShadow: FIELD_SHADOW }}
              >
                <Text className="font-inter-medium text-[15px] leading-[18px] text-[#111827]">
                  ₹
                </Text>
                <TextInput
                  value={amount ? groupDigits(value) : ''}
                  onChangeText={(next) => {
                    setAmount(next.replace(/\D/g, '').replace(/^0+/, '').slice(0, MAX_DIGITS));
                    if (save.isError) save.reset();
                  }}
                  onSubmitEditing={submit}
                  keyboardType="number-pad"
                  placeholder="e.g. 5000"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  returnKeyType="done"
                  accessibilityLabel="Target amount in rupees"
                  className="flex-1 py-0 font-inter-medium text-[15px] leading-[18px] text-[#111827]"
                />
              </View>
            </View>

            <View className="mt-4 gap-2">
              <Text className="pl-1 font-inter-medium text-sm leading-[17px] text-[#6B7280]">
                Choose Frequency
              </Text>
              <Pressable
                onPress={() => {
                  // Frees up the room the options open into.
                  Keyboard.dismiss();
                  setPicking((open) => !open);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Frequency, ${FREQUENCY_LABELS[frequency]}`}
                accessibilityState={{ expanded: picking }}
                className="h-[52px] flex-row items-center rounded-[20px] border border-[#E5E5E5] bg-white/80 px-5 active:opacity-80"
                style={{ boxShadow: FIELD_SHADOW }}
              >
                <Text className="flex-1 font-inter-medium text-[15px] leading-[18px] text-[#111827]">
                  {FREQUENCY_LABELS[frequency]}
                </Text>
                <View style={{ transform: [{ rotate: picking ? '180deg' : '0deg' }] }}>
                  <ChevronDown size={20} color="#6B7280" strokeWidth={1.67} />
                </View>
              </Pressable>
              {picking ? (
                <View className="overflow-hidden rounded-[20px] border border-[#E5E5E5] bg-white">
                  {FREQUENCIES.map((key) => (
                    <Pressable
                      key={key}
                      onPress={() => {
                        setFrequency(key);
                        setPicking(false);
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: key === frequency }}
                      className="h-12 flex-row items-center px-5 active:bg-[#F8F8F8]"
                    >
                      <Text className="flex-1 font-inter-medium text-[15px] leading-[18px] text-[#111827]">
                        {FREQUENCY_LABELS[key]}
                      </Text>
                      {key === frequency ? (
                        <Check size={18} color="#312B28" strokeWidth={2} />
                      ) : null}
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>

            {save.isError ? (
              <Text
                accessibilityLiveRegion="polite"
                className="mt-3 pl-1 font-inter-medium text-[13px] leading-4 text-rose-500"
              >
                We couldn’t save your target. Please try again.
              </Text>
            ) : null}

            <View className="mt-6">
              <Button
                label="Set Target"
                onPress={submit}
                disabled={!isValid}
                loading={save.isPending}
              />
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
