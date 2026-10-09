import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { CARD_SHADOW } from '@/components/home/shared';
import { usePressScale } from '@/hooks/usePressScale';

// Pastel number tile, two to a row, used by the Lead Matrix and Performance sections. With
// `onPress` it's a button that presses in slightly.

interface StatTileProps {
  label: string;
  value: string;
  caption: string;
  // Tailwind background and border classes.
  tone: string;
  onPress?: () => void;
}

export function StatTile({ label, value, caption, tone, onPress }: StatTileProps) {
  const press = usePressScale(0.96);
  const a11yLabel = `${label}: ${value}, ${caption}`;
  const className = `h-[130px] justify-between rounded-3xl border p-5 ${tone}`;

  const content = (
    <>
      <Text className="font-inter-semibold text-xs leading-4 text-charcoal/60">{label}</Text>
      <View className="gap-1">
        <Text numberOfLines={1} className="font-inter-bold text-2xl leading-8 text-charcoal">
          {value}
        </Text>
        <Text
          numberOfLines={1}
          className="font-inter-medium text-[11px] leading-4 text-charcoal/60"
        >
          {caption}
        </Text>
      </View>
    </>
  );

  if (!onPress) {
    return (
      <View
        accessible
        accessibilityLabel={a11yLabel}
        className={`flex-1 ${className}`}
        style={{ boxShadow: CARD_SHADOW }}
      >
        {content}
      </View>
    );
  }

  return (
    <Animated.View style={press.style} className="flex-1">
      <Pressable
        {...press.handlers}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        className={className}
        style={{ boxShadow: CARD_SHADOW }}
      >
        {content}
      </Pressable>
    </Animated.View>
  );
}
