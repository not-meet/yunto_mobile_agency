import { Plus } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

// A white card on the lead distribution screen (the sequence, the priority recipient): title and
// a line under it, an optional "Add" pill on the right, and the content below.

interface DistributionCardProps {
  title: string;
  subtitle: string;
  // Left out, there's no Add pill.
  onAdd?: () => void;
  addLabel?: string;
  children: ReactNode;
}

export function DistributionCard({
  title,
  subtitle,
  onAdd,
  addLabel,
  children,
}: DistributionCardProps) {
  return (
    <View
      className="gap-4 rounded-3xl border border-[#F0ECE1] bg-white p-4"
      style={{ boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.03)' }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-0.5">
          <Text
            accessibilityRole="header"
            className="font-inter-semibold text-sm leading-[21px] text-[#1E1B18]"
          >
            {title}
          </Text>
          <Text className="font-inter text-[11px] leading-[15px] text-[#7B766D]">{subtitle}</Text>
        </View>
        {onAdd ? (
          <Pressable
            onPress={onAdd}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={addLabel}
            className="h-[30px] flex-row items-center gap-1 rounded-full border border-[#D5CFC5] px-3 active:bg-[#F6F4EF]"
          >
            <Plus size={14} color="#1E1B18" strokeWidth={2} />
            <Text className="font-inter-medium text-xs leading-4 text-[#1E1B18]">Add</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}
