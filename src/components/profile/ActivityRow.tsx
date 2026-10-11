import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressScale } from '@/hooks/usePressScale';

// One row under the profile's "Activity" heading: a tinted icon, a title and a line under it.
// `danger` is Log Out: red, with no line or chevron.

interface ActivityRowProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  tint: string;
  onPress: () => void;
  danger?: boolean;
}

export function ActivityRow({
  title,
  subtitle,
  icon: Icon,
  tint,
  onPress,
  danger = false,
}: ActivityRowProps) {
  const press = usePressScale(0.98);
  const color = danger ? '#9B3232' : '#333333';

  return (
    <Animated.View style={press.style}>
      <Pressable
        {...press.handlers}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
        className="flex-row items-center gap-4 rounded-3xl border border-white bg-white/70 px-5 py-4"
        style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)' }}
      >
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: tint }}
        >
          <Icon size={18} color={color} strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="font-inter-semibold text-[15px] leading-[22px] tracking-[-0.375px]"
            style={{ color: danger ? color : '#111111' }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              className="font-inter-medium text-xs leading-[18px] text-[#999999]"
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        {danger ? null : <ChevronRight size={16} color="#CCCCCC" strokeWidth={2} />}
      </Pressable>
    </Animated.View>
  );
}
