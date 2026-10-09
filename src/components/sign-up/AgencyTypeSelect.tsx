import { Check, ChevronDown, Layers } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PILL_CLASS, PILL_STYLE, PillLabel } from '@/components/auth/PillField';
import type { AgencyType } from '@/services/authService';

// The "Agency Type" pill. Tapping it opens a bottom sheet of the types.

const SLATE = '#64748B';

interface AgencyTypeSelectProps {
  value: AgencyType;
  options: readonly AgencyType[];
  onChange: (value: AgencyType) => void;
  disabled?: boolean;
}

export function AgencyTypeSelect({ value, options, onChange, disabled }: AgencyTypeSelectProps) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <PillLabel label="Agency Type">
      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Agency type, ${value}`}
        accessibilityHint="Opens the options"
        className={`${PILL_CLASS} active:opacity-80`}
        style={PILL_STYLE}
      >
        <Layers size={16} color={SLATE} strokeWidth={2} />
        <Text numberOfLines={1} className="flex-1 font-inter text-sm leading-5 text-ink">
          {value}
        </Text>
        <ChevronDown size={15} color={SLATE} strokeWidth={2} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          onPress={() => setOpen(false)}
          accessibilityLabel="Close"
          className="flex-1 justify-end bg-black/30"
        >
          <Pressable
            className="rounded-t-[28px] bg-canvas px-5 pt-5"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <Text className="px-1 pb-3 font-inter-semibold text-xs uppercase leading-4 tracking-[0.3px] text-slate">
              Agency Type
            </Text>
            {options.map((option) => {
              const active = option === value;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  className={`h-12 flex-row items-center rounded-2xl px-4 active:bg-white/70 ${active ? 'bg-white/80' : ''}`}
                >
                  <Text className="flex-1 font-inter-medium text-sm text-ink">{option}</Text>
                  {active ? <Check size={16} color="#6366F1" strokeWidth={2} /> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </PillLabel>
  );
}
