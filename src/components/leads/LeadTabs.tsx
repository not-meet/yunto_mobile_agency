import { useState } from 'react';
import { type LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// The lead's "Lead Info" / "Notes & Activity" switch. The white pill slides under the selected
// label; it jumps instead under reduced motion.

// The track's padding, on every side.
const INSET = 4;

interface LeadTabsProps<T extends string> {
  tabs: readonly { key: T; label: string }[];
  selected: T;
  onSelect: (tab: T) => void;
}

export function LeadTabs<T extends string>({ tabs, selected, onSelect }: LeadTabsProps<T>) {
  const reduceMotion = useReducedMotion();
  const [tabWidth, setTabWidth] = useState(0);
  const index = tabs.findIndex((tab) => tab.key === selected);
  const offset = useSharedValue(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const width = (event.nativeEvent.layout.width - INSET * 2) / tabs.length;
    setTabWidth(width);
    offset.set(index * width);
  };

  const select = (tab: T, i: number) => {
    offset.set(reduceMotion ? i * tabWidth : withTiming(i * tabWidth, { duration: 250 }));
    onSelect(tab);
  };

  const pillStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  return (
    <View
      onLayout={onLayout}
      accessibilityRole="tablist"
      className="flex-row rounded-full border border-[rgba(232,226,217,0.5)] bg-white/65 p-1"
    >
      {tabWidth > 0 ? (
        <Animated.View
          className="absolute bottom-1 left-1 top-1 rounded-full bg-white/90"
          style={[{ width: tabWidth, boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)' }, pillStyle]}
        />
      ) : null}
      {tabs.map(({ key, label }, i) => {
        const active = key === selected;
        return (
          <Pressable
            key={key}
            onPress={() => select(key, i)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            className="flex-1 items-center px-4 py-3"
          >
            <Text
              numberOfLines={1}
              className={`font-inter-semibold text-sm leading-[17px] ${
                active ? 'text-[#1C1C1E]' : 'text-[#6C6C70]'
              }`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
