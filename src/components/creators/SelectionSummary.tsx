import { Check } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

// How many creators are picked for sharing. With some picked, "View creators" narrows the list
// to just them (and back); with none, it offers to pick everyone shown.

interface SelectionSummaryProps {
  count: number;
  viewingSelected: boolean;
  onToggleView: () => void;
  onSelectAll: () => void;
}

export function SelectionSummary({
  count,
  viewingSelected,
  onToggleView,
  onSelectAll,
}: SelectionSummaryProps) {
  const any = count > 0;

  return (
    <View className="h-[42px] flex-row items-center justify-between rounded-2xl border border-[#F2EDFF] bg-[rgba(242,237,255,0.5)] px-4">
      <View className="flex-row items-center gap-2">
        <View
          className={`h-5 w-5 items-center justify-center rounded-full ${
            any ? 'bg-[#141311]' : 'border border-[rgba(20,19,17,0.15)] bg-white'
          }`}
        >
          {any ? <Check size={10} color="#FAF7F2" strokeWidth={2} /> : null}
        </View>
        <Text
          accessibilityLiveRegion="polite"
          className={`font-inter-semibold text-xs leading-4 text-[#141311] ${any ? 'underline' : ''}`}
        >
          {any
            ? `${count} ${count === 1 ? 'creator' : 'creators'} selected`
            : 'No creators selected'}
        </Text>
      </View>
      <Pressable
        onPress={any ? onToggleView : onSelectAll}
        hitSlop={8}
        accessibilityRole="button"
        className="active:opacity-60"
      >
        <Text className="font-inter text-[10px] leading-[15px] text-[#8C8A84]">
          {!any ? 'Select all' : viewingSelected ? 'Show all' : 'View creators'}
        </Text>
      </Pressable>
    </View>
  );
}
