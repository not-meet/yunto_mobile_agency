import { User } from 'lucide-react-native';
import { Text, View } from 'react-native';

// Stands in for a lead's creators list until it has any; the screen's footer adds them.

export function NoCreatorsCard() {
  return (
    <View
      className="h-[300px] items-center justify-center rounded-[28px] bg-[#EFEFF9] px-6"
      style={{ boxShadow: 'inset 0px 1px 1px rgba(255, 255, 255, 0.7)' }}
    >
      <View
        className="h-[52px] w-[52px] items-center justify-center rounded-full bg-white"
        style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
      >
        <User size={24} color="#222222" strokeWidth={1.8} />
      </View>
      <Text className="pt-5 text-center font-inter-semibold text-base leading-6 tracking-[-0.4px] text-[#111111]">
        No creators here yet
      </Text>
      <Text className="max-w-[220px] pt-2 text-center font-inter text-xs leading-5 text-[#6C6C70]">
        Add creators to this lead to see them here.
      </Text>
    </View>
  );
}
