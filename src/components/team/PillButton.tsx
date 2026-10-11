import { type LucideIcon, Plus } from 'lucide-react-native';
import { Pressable, Text } from 'react-native';

import { CARD_SHADOW } from '@/components/home/shared';

// The small dark pill at the end of a card's heading, e.g. "Add Members".
export function PillButton({
  label,
  onPress,
  icon: Icon = Plus,
}: {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-7 flex-row items-center gap-1 rounded-full bg-[#111111] px-3 active:opacity-80"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <Icon size={12} color="#F4F6F8" strokeWidth={2} />
      <Text className="font-inter-medium text-xs leading-4 text-[#F4F6F8]">{label}</Text>
    </Pressable>
  );
}
