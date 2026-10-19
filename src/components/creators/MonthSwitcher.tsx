import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { monthTitle } from '@/utils/dates';

// The creator calendar's month pill: the month shown, with arrows either side (as in
// yunto_mobile_app).

function Arrow({
  icon: Icon,
  label,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-9 w-9 items-center justify-center rounded-full bg-white active:opacity-70"
      style={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)' }}
    >
      <Icon size={18} color="#141311" strokeWidth={1.5} />
    </Pressable>
  );
}

interface MonthSwitcherProps {
  month: Date;
  onChange: (step: -1 | 1) => void;
}

export function MonthSwitcher({ month, onChange }: MonthSwitcherProps) {
  return (
    <View
      className="h-[46px] flex-row items-center gap-2 self-start rounded-[28px] border border-white/70 bg-white/60 px-1.5"
      style={{
        boxShadow:
          '0px 4px 20px rgba(0, 0, 0, 0.03), inset 0px 2px 4px 1px rgba(255, 255, 255, 0.6)',
      }}
    >
      <Arrow icon={ChevronLeft} label="Previous month" onPress={() => onChange(-1)} />
      <Text
        accessibilityRole="header"
        accessibilityLiveRegion="polite"
        className="min-w-[90px] px-1 text-center font-inter-bold text-base leading-[19px] tracking-[-0.2px] text-[#141311]"
      >
        {monthTitle(month, true)}
      </Text>
      <Arrow icon={ChevronRight} label="Next month" onPress={() => onChange(1)} />
    </View>
  );
}
