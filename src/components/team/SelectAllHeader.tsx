import { Check } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

// Over the unassigned list: a box that picks every creator shown (a dash when only some are),
// and how many of them are picked.

interface SelectAllHeaderProps {
  selected: number;
  total: number;
  onToggleAll: () => void;
}

export function SelectAllHeader({ selected, total, onToggleAll }: SelectAllHeaderProps) {
  const all = total > 0 && selected === total;
  const some = selected > 0 && !all;

  return (
    <View className="flex-row items-center justify-between">
      <Pressable
        onPress={onToggleAll}
        disabled={total === 0}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityLabel="Select all"
        accessibilityState={{ checked: all ? true : some ? 'mixed' : false, disabled: total === 0 }}
        className="flex-row items-center gap-2.5 active:opacity-70"
      >
        <View
          className={`h-5 w-5 items-center justify-center rounded-md ${
            all || some ? 'bg-[#6437E7]' : 'border border-[#D4D4D4] bg-white'
          }`}
          style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
        >
          {all ? <Check size={12} color="#FFFFFF" strokeWidth={3} /> : null}
          {some ? <View className="h-0.5 w-2.5 rounded-full bg-white" /> : null}
        </View>
        <Text className="font-inter-medium text-sm leading-5 text-[#262626]">Select all</Text>
      </Pressable>
      <Text
        accessibilityLiveRegion="polite"
        className="font-inter-semibold text-xs leading-[18px] text-[#737373]"
      >
        {selected} of {total} selected
      </Text>
    </View>
  );
}
