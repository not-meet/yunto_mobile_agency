import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { getDocumentAsync } from 'expo-document-picker';
import { Check, ChevronDown, ImagePlus } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { Image, Pressable, Text, TextInput, type TextInputProps, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, useReducedMotion } from 'react-native-reanimated';

import { Avatar } from '@/components/common/Avatar';
import { fromDateKey, slashDate, toDateKey, todayDate } from '@/utils/dates';
import { PLACEHOLDER_COLOR } from '@/utils/constants';
import { showToast } from '@/utils/notifications';

// The profile forms' inputs: a labelled pill text field, a pill select that opens a list in
// place, a date that opens the calendar, and the round photo picker.

const FIELD_SHADOW = '0px 4px 12px rgba(0, 0, 0, 0.02), inset 0px 2px 4px 1px rgba(0, 0, 0, 0.02)';
const PILL = 'h-[52px] flex-row items-center rounded-full border border-white/90 bg-white/80 px-5';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="flex-1 gap-2">
      <Text className="pl-4 font-inter-semibold text-[13px] leading-4 text-[#6B7280]">{label}</Text>
      {children}
    </View>
  );
}

interface PillFieldProps extends Pick<
  TextInputProps,
  'keyboardType' | 'autoCapitalize' | 'autoComplete'
> {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  placeholder: string;
}

export function PillField({ label, value, onChangeText, placeholder, ...input }: PillFieldProps) {
  return (
    <Field label={label}>
      <View className={PILL} style={{ boxShadow: FIELD_SHADOW }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={PLACEHOLDER_COLOR}
          returnKeyType="done"
          accessibilityLabel={label}
          className="flex-1 py-0 font-inter-medium text-[15px] leading-[18px] text-[#111827]"
          {...input}
        />
      </View>
    </Field>
  );
}

interface PillSelectProps<T extends string> {
  label: string;
  value: T | null;
  options: readonly { value: T; label: string }[];
  onChange: (next: T) => void;
}

export function PillSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: PillSelectProps<T>) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <Field label={label}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${current?.label ?? 'not selected'}`}
        accessibilityState={{ expanded: open }}
        className={`${PILL} active:opacity-80`}
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
          className="overflow-hidden rounded-[20px] border border-white/90 bg-white"
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  onChange(option.value);
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
    </Field>
  );
}

// `value` is "YYYY-MM-DD"; only past dates can be picked.
export function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (next: string) => void;
}) {
  const openCalendar = () =>
    DateTimePickerAndroid.open({
      value: value ? fromDateKey(value) : todayDate(),
      mode: 'date',
      maximumDate: todayDate(),
      onValueChange: (_, picked) => onChange(toDateKey(picked)),
    });

  return (
    <Field label={label}>
      <Pressable
        onPress={openCalendar}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${value ? slashDate(value) : 'not set'}`}
        accessibilityHint="Opens the calendar"
        className={`${PILL} active:opacity-80`}
        style={{ boxShadow: FIELD_SHADOW }}
      >
        <Text
          className={`flex-1 font-inter-medium text-[15px] leading-[18px] ${
            value ? 'text-[#111827]' : 'text-[#BDB8C7]'
          }`}
        >
          {value ? slashDate(value) : 'DD/MM/YYYY'}
        </Text>
      </Pressable>
    </Field>
  );
}

// The round photo at the top of a form. `uri` is what's picked but not saved yet.
export function PhotoField({
  name,
  savedUrl,
  uri,
  caption,
  onPick,
}: {
  name: string;
  savedUrl: string | null;
  uri: string | null;
  caption: string;
  onPick: (uri: string) => void;
}) {
  const pick = async () => {
    try {
      const result = await getDocumentAsync({ type: 'image/*', copyToCacheDirectory: true });
      const asset = result.canceled ? undefined : result.assets[0];
      if (asset) onPick(asset.uri);
    } catch {
      showToast('Couldn’t open your photos');
    }
  };

  return (
    <Pressable
      onPress={() => void pick()}
      accessibilityRole="button"
      accessibilityLabel={caption}
      className="items-center gap-1 self-center active:opacity-80"
    >
      <View className="rounded-full border border-white/60 p-[3px]">
        {uri ? (
          <Image
            source={{ uri }}
            className="h-[60px] w-[60px] rounded-full bg-[#EFEFEF]"
            accessibilityIgnoresInvertColors
          />
        ) : savedUrl ? (
          <Avatar name={name} url={savedUrl} size={60} />
        ) : (
          <View className="h-[60px] w-[60px] items-center justify-center rounded-full bg-[#EFEFEF]">
            <ImagePlus size={20} color="#9CA3AF" strokeWidth={1.5} />
          </View>
        )}
      </View>
      <Text className="font-inter-medium text-[11px] leading-5 text-[#6B7280]">{caption}</Text>
    </Pressable>
  );
}
