import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

// Labelled white pill used on the agency screens. `PillField` is a text input; `PillLabel` and
// `PILL_CLASS` let other controls (the agency type picker) share the look.

const SLATE = '#64748B';

export const PILL_CLASS =
  'h-[50px] flex-row items-center gap-3 rounded-full border border-indigo/20 bg-white/60 px-4';
export const PILL_STYLE = { boxShadow: 'inset 0px 1px 3px 1px rgba(0, 0, 0, 0.04)' };

export function PillLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="gap-1.5">
      <Text className="px-1 font-inter-semibold text-xs uppercase leading-4 tracking-[0.3px] text-slate">
        {label}
      </Text>
      {children}
    </View>
  );
}

interface PillFieldProps extends TextInputProps {
  label: string;
  icon?: LucideIcon;
  error?: boolean;
}

export function PillField({ label, icon: Icon, error = false, ...props }: PillFieldProps) {
  return (
    <PillLabel label={label}>
      <View className={`${PILL_CLASS} ${error ? 'border-rose-400' : ''}`} style={PILL_STYLE}>
        {Icon ? <Icon size={16} color={SLATE} strokeWidth={2} /> : null}
        <TextInput
          placeholderTextColor={SLATE}
          accessibilityLabel={label}
          className="flex-1 py-0 font-inter text-sm text-ink"
          {...props}
        />
      </View>
    </PillLabel>
  );
}
