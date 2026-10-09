import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Switch } from '@/components/common/Switch';

// Whether the agency is taking new leads. The status dot breathes while active.
// TODO(availability): save this through the API instead of keeping it on screen.

export function AvailabilityToggle() {
  const [active, setActive] = useState(true);
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.set(active ? withRepeat(withTiming(1, { duration: 1400 }), -1, true) : withTiming(0));
  }, [active, pulse]);

  const halo = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - pulse.get()),
    transform: [{ scale: 1 + pulse.get() }],
  }));

  return (
    <Pressable
      onPress={() => setActive((value) => !value)}
      accessibilityRole="switch"
      accessibilityLabel="Agency availability"
      accessibilityState={{ checked: active }}
      className="h-[42px] flex-row items-center justify-between rounded-full border border-sand bg-white/40 pl-4 pr-2"
      style={{ boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)' }}
    >
      <View className="flex-row items-center gap-2.5">
        <View className="h-2.5 w-2.5 items-center justify-center">
          {active ? (
            <Animated.View
              className="absolute h-2.5 w-2.5 rounded-full bg-[#4ADE80]"
              style={halo}
            />
          ) : null}
          <View
            className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-[#05DF72]' : 'bg-[#D1D5DC]'}`}
            style={active ? { boxShadow: '0px 0px 8px rgba(74, 222, 128, 0.6)' } : undefined}
          />
        </View>
        <Text className="font-geist-medium text-[13px] leading-5 text-charcoal/80">
          {active ? 'Active' : 'Away'}
          <Text className="text-charcoal/40">
            {active ? ' · taking new leads' : ' · new leads paused'}
          </Text>
        </Text>
      </View>
      <Switch value={active} onValueChange={setActive} />
    </Pressable>
  );
}
