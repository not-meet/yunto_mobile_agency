import { Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, type TextInputProps, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, useReducedMotion } from 'react-native-reanimated';

import { PLACEHOLDER_COLOR } from '@/utils/constants';

// The Add Creator sheet's inputs: a labelled text field, a select that opens a list in place,
// and a toggle chip.

const FIELD_SHADOW = '0px 4px 12px rgba(0, 0, 0, 0.02), inset 0px 2px 4px 1px rgba(0, 0, 0, 0.02)';

export function SectionTitle({ children }: { children: string }) {
  return (
    <Text
      accessibilityRole="header"
      className="pt-2 font-inter-semibold text-base leading-5 tracking-[-0.3px] text-[#111111]"
    >
      {children}
    </Text>
  );
}

function Label({ children }: { children: string }) {
  return (
    <Text className="pl-1 font-inter-medium text-sm leading-[17px] text-[#6B7280]">{children}</Text>
  );
}

interface SheetFieldProps extends Pick<
  TextInputProps,
  'keyboardType' | 'autoCapitalize' | 'autoComplete' | 'multiline'
> {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  placeholder: string;
}

export function SheetField({ label, value, onChangeText, placeholder, ...input }: SheetFieldProps) {
  const reduceMotion = useReducedMotion();
  const [focused, setFocused] = useState(false);

  return (
    <View className="flex-1 gap-2">
      <Label>{label}</Label>
      <Animated.View
        className={`justify-center rounded-[20px] border bg-white/80 px-5 ${
          input.multiline ? 'min-h-[96px] py-3.5' : 'h-[52px]'
        }`}
        style={{
          borderColor: focused ? '#D6CFC4' : '#E8E8E8',
          boxShadow: FIELD_SHADOW,
          transitionProperty: 'borderColor',
          transitionDuration: reduceMotion ? 0 : 180,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={PLACEHOLDER_COLOR}
          returnKeyType={input.multiline ? 'default' : 'done'}
          textAlignVertical={input.multiline ? 'top' : 'center'}
          accessibilityLabel={label}
          className="py-0 font-inter-medium text-[15px] leading-[18px] text-[#111827]"
          {...input}
        />
      </Animated.View>
    </View>
  );
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T | null;
  options: readonly { value: T; label: string }[];
  onChange: (next: T | null) => void;
}

// Picking the selected option again clears it, since every select here is optional.
export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps<T>) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <View className="flex-1 gap-2">
      <Label>{label}</Label>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${current?.label ?? 'not selected'}`}
        accessibilityState={{ expanded: open }}
        className="h-[52px] flex-row items-center rounded-[20px] border border-[#E5E5E5] bg-white/80 px-5 active:opacity-80"
        style={{ boxShadow: FIELD_SHADOW }}
      >
        <Text
          numberOfLines={1}
          className={`flex-1 font-inter-medium text-[15px] leading-[18px] ${
            current ? 'text-[#111827]' : 'text-[#BDB8C7]'
          }`}
        >
          {current?.label ?? 'Select…'}
        </Text>
        <Animated.View
          style={{
            transform: [{ rotate: open ? '180deg' : '0deg' }],
            ...(reduceMotion ? null : { transitionProperty: 'transform', transitionDuration: 200 }),
          }}
        >
          <ChevronDown size={20} color="#6B7280" strokeWidth={1.67} />
        </Animated.View>
      </Pressable>
      {open ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(180)}
          exiting={reduceMotion ? undefined : FadeOut.duration(120)}
          className="overflow-hidden rounded-[20px] border border-[#E5E5E5] bg-white"
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  onChange(selected ? null : option.value);
                  setOpen(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className="h-12 flex-row items-center px-5 active:bg-[#F8F8F8]"
              >
                <Text className="flex-1 font-inter-medium text-[15px] leading-[18px] text-[#111827]">
                  {option.label}
                </Text>
                {selected ? <Check size={18} color="#312B28" strokeWidth={2} /> : null}
              </Pressable>
            );
          })}
        </Animated.View>
      ) : null}
    </View>
  );
}

export function ToggleChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      className={`h-[34px] justify-center rounded-[20px] border-[1.5px] px-3.5 active:opacity-70 ${
        selected ? 'border-black/90 bg-[#141311]' : 'border-[#E4E9EF] bg-white'
      }`}
    >
      <Text
        className={`text-xs leading-[15px] ${
          selected ? 'font-inter-semibold text-[#FAF7F2]' : 'font-inter text-[#212121]'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
