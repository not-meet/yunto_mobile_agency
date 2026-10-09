import { Plus } from 'lucide-react-native';
import { Pressable, Text } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { type PlatformIcon, TAG_TONES, type TagTone } from '@/components/leads/labels';
import { usePressScale } from '@/hooks/usePressScale';

// Pastel pill for a platform or niche. On the Add Lead screen it toggles (tinted when picked,
// plain white when not) and squeezes under the finger; on the added-lead summary it's a small
// static badge.

const SIZES = {
  // Platforms.
  lg: { box: 'h-9 gap-2 px-3.5', text: 'font-inter-semibold text-xs leading-[18px]', icon: 14 },
  // Niches.
  md: { box: 'h-8 gap-1.5 px-3', text: 'font-inter-semibold text-xs leading-[18px]', icon: 12 },
  // Summary badges.
  sm: { box: 'h-[31px] gap-1.5 px-3', text: 'font-inter-bold text-[11px] leading-4', icon: 11 },
} as const;
type ChipSize = keyof typeof SIZES;

const IDLE = { background: '#FFFFFF', border: '#EAEAEA', text: '#888888' };

interface TagChipProps {
  label: string;
  tone: TagTone;
  size: ChipSize;
  icon?: PlatformIcon | null;
  // Left out, the chip is a static badge.
  onPress?: () => void;
  selected?: boolean;
}

export function TagChip({ label, tone, size, icon: Icon, onPress, selected = true }: TagChipProps) {
  const reduceMotion = useReducedMotion();
  const press = usePressScale(0.94);
  const colors = selected ? TAG_TONES[tone] : IDLE;
  const { box, text, icon } = SIZES[size];

  const chip = (
    <Animated.View
      className={`flex-row items-center rounded-full border ${box}`}
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        boxShadow: size === 'sm' ? '0px 2px 8px rgba(0, 0, 0, 0.02)' : undefined,
        transitionProperty: ['backgroundColor', 'borderColor'],
        transitionDuration: reduceMotion ? 0 : 180,
      }}
    >
      {Icon ? <Icon size={icon} color={colors.text} /> : null}
      <Text numberOfLines={1} className={text} style={{ color: colors.text }}>
        {label}
      </Text>
    </Animated.View>
  );

  if (!onPress) return chip;

  return (
    <Animated.View style={press.style}>
      <Pressable
        {...press.handlers}
        onPress={onPress}
        accessibilityRole="checkbox"
        accessibilityLabel={label}
        accessibilityState={{ checked: selected }}
      >
        {chip}
      </Pressable>
    </Animated.View>
  );
}

// The dashed "+ Add" pill at the end of a chip row.
export function AddChip({
  size,
  onPress,
  accessibilityLabel,
}: {
  size: 'lg' | 'md';
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const large = size === 'lg';
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={`flex-row items-center rounded-full border border-dashed border-[#DDDDDD] active:opacity-70 ${
        large ? 'h-9 gap-1.5 bg-white px-3.5' : 'h-8 gap-1 px-3'
      }`}
    >
      <Plus size={large ? 13 : 11} color="#AAAAAA" strokeWidth={2} />
      <Text className="font-inter-semibold text-xs leading-[18px] text-[#AAAAAA]">Add</Text>
    </Pressable>
  );
}
