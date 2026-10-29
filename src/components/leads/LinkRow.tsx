import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressScale } from '@/hooks/usePressScale';

// A white row that opens something else about the lead (e.g. "Creators").

export function LinkRow({ title, onPress }: { title: string; onPress: () => void }) {
  const press = usePressScale(0.98);

  return (
    <Animated.View style={press.style}>
      <Pressable
        {...press.handlers}
        onPress={onPress}
        accessibilityRole="button"
        className="flex-row items-center justify-between rounded-[20px] border border-[rgba(232,226,217,0.5)] bg-white px-5 pb-5 pt-6"
      >
        <Text className="font-inter-semibold text-base leading-5 text-[#1D1D1F]">{title}</Text>
        <ChevronRight size={20} color="#8A8A8E" strokeWidth={1.67} />
      </Pressable>
    </Animated.View>
  );
}
