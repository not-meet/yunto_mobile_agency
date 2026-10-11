import { ArrowUpDown, type LucideIcon, Plus, SlidersHorizontal } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressScale } from '@/hooks/usePressScale';

// The row under the Creators title: add a creator, filter and sort the list.

// The dark "Add Creator" pill; also heads the roster on the Add Creators screen.
export function AddCreatorButton({ onPress }: { onPress: () => void }) {
  const press = usePressScale(0.95);
  return (
    <Animated.View style={press.style}>
      <Pressable
        {...press.handlers}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Add Creator"
        className="h-8 flex-row items-center gap-1.5 rounded-full bg-[#141311] px-4"
        style={{ boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.12)' }}
      >
        <Plus size={12} color="#FAF7F2" strokeWidth={2} />
        <Text className="font-inter-bold text-xs leading-4 text-[#FAF7F2]">Add Creator</Text>
      </Pressable>
    </Animated.View>
  );
}

function ToolChip({
  label,
  icon: Icon,
  onPress,
  badge,
}: {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  // How many are applied; shown as a small dark count when any are.
  badge?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={badge ? `${label}, ${badge} applied` : label}
      className="h-[34px] flex-row items-center gap-1.5 rounded-full border border-[rgba(232,229,223,0.2)] bg-white px-3.5 active:opacity-70"
      style={{ boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)' }}
    >
      <Icon size={12} color="#141311" strokeWidth={2} />
      <Text className="font-inter-semibold text-xs leading-4 text-[#141311]">{label}</Text>
      {badge ? (
        <View className="h-4 min-w-4 items-center justify-center rounded-full bg-[#141311] px-1">
          <Text className="font-inter-bold text-[9px] leading-3 text-[#FAF7F2]">{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

interface CreatorsToolbarProps {
  onAdd: () => void;
  onFilter: () => void;
  onSort: () => void;
  filterCount: number;
}

export function CreatorsToolbar({ onAdd, onFilter, onSort, filterCount }: CreatorsToolbarProps) {
  return (
    <View className="flex-row items-center gap-2 px-4">
      <AddCreatorButton onPress={onAdd} />
      <ToolChip label="Filter" icon={SlidersHorizontal} onPress={onFilter} badge={filterCount} />
      <ToolChip label="Sort" icon={ArrowUpDown} onPress={onSort} />
    </View>
  );
}
