import { ChevronDown } from 'lucide-react-native';
import { type ReactNode, useRef, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View, type ViewStyle } from 'react-native';

import { DropdownMenu } from '@/components/common/DropdownMenu';
import { Switch } from '@/components/common/Switch';
import { EDITOR_CARD_SHADOW } from '@/components/content/labels';

// The content editor's building blocks: its white cards, their small caps labels, a labelled
// switch and a dropdown field.

export function EditorCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <View
      className={`gap-3 rounded-3xl border border-[#F1F5F9] bg-white p-5 ${className}`}
      style={{ boxShadow: EDITOR_CARD_SHADOW }}
    >
      {children}
    </View>
  );
}

export function CardLabel({ children, right }: { children: string; right?: ReactNode }) {
  return (
    <View className="flex-row items-center justify-between gap-2">
      <Text
        accessibilityRole="header"
        className="font-inter-bold text-[11px] uppercase leading-4 tracking-[0.55px] text-[#94A3B8]"
      >
        {children}
      </Text>
      {right}
    </View>
  );
}

interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ToggleRow({ label, value, onChange, disabled = false }: ToggleRowProps) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled }}
      className="flex-row items-center justify-between gap-2 active:opacity-80"
    >
      <Text className="flex-1 font-inter-semibold text-sm leading-5 text-[#1E293B]">{label}</Text>
      <Switch value={value} onValueChange={onChange} disabled={disabled} />
    </Pressable>
  );
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T | null;
  options: readonly { value: T; label: string }[];
  onChange: (next: T) => void;
  placeholder?: string;
  disabled?: boolean;
}

// A tappable box showing the pick; the options open just under it.
export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select',
  disabled = false,
}: SelectFieldProps<T>) {
  const { width } = useWindowDimensions();
  const box = useRef<View>(null);
  const [menu, setMenu] = useState<ViewStyle | null>(null);
  const picked = options.find((o) => o.value === value);

  const open = () =>
    box.current?.measureInWindow((x, y, w, h) =>
      setMenu({ top: y + h + 6, left: x, right: Math.max(16, width - x - w) }),
    );

  return (
    <View className="flex-1 gap-1">
      <Text className="font-inter text-[11px] leading-4 text-[#94A3B8]">{label}</Text>
      <Pressable
        ref={box}
        onPress={open}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${picked?.label ?? 'not set'}`}
        accessibilityState={{ expanded: menu !== null, disabled }}
        className={`h-11 flex-row items-center gap-2 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] px-3 active:opacity-80 ${
          disabled ? 'opacity-50' : ''
        }`}
      >
        <Text
          numberOfLines={1}
          className={`flex-1 font-inter-semibold text-[13px] leading-4 ${
            picked ? 'text-[#1E293B]' : 'text-[#94A3B8]'
          }`}
        >
          {picked?.label ?? placeholder}
        </Text>
        <ChevronDown size={14} color="#94A3B8" strokeWidth={1.75} />
      </Pressable>
      <DropdownMenu
        visible={menu !== null}
        onClose={() => setMenu(null)}
        options={options}
        selected={value ?? undefined}
        onSelect={onChange}
        position={menu ?? {}}
        label={label}
      />
    </View>
  );
}

// A small rounded chip: dark when picked.
export function Pill({
  label,
  selected,
  onPress,
  disabled = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      className={`rounded-full px-3 py-1.5 active:opacity-70 ${selected ? 'bg-black' : 'bg-[#F1F5F9]'}`}
    >
      <Text
        className={`font-inter-medium text-xs leading-4 ${selected ? 'text-white' : 'text-[#475569]'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
