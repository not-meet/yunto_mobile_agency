import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { ATTENTION_STYLES } from '@/components/notifications/labels';
import { SwipeToDismiss } from '@/components/notifications/SwipeToDismiss';
import { usePressScale } from '@/hooks/usePressScale';
import type { AttentionItem } from '@/services/notificationService';

// A tinted card in "Needs your attention". Its hue and icon follow its kind. Tap to open what
// it's about, swipe right to dismiss it.

const SHEEN =
  'radial-gradient(102.57% 449.42% at 0% 0%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 60%)';

interface AttentionCardProps {
  item: AttentionItem;
  onOpen: () => void;
  onDismiss: () => void;
}

export function AttentionCard({ item, onOpen, onDismiss }: AttentionCardProps) {
  const {
    icon: Icon,
    color,
    background,
    shadow,
    iconShadow,
    subtitleColor,
  } = ATTENTION_STYLES[item.kind];
  const press = usePressScale();

  return (
    <SwipeToDismiss color={color} onDismiss={onDismiss}>
      <Animated.View style={press.style}>
        <Pressable
          {...press.handlers}
          onPress={onOpen}
          accessibilityRole="button"
          accessibilityLabel={item.subtitle ? `${item.title}, ${item.subtitle}` : item.title}
          accessibilityHint="Swipe right to dismiss"
          accessibilityActions={[{ name: 'dismiss', label: 'Dismiss' }]}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === 'dismiss') onDismiss();
          }}
          className="flex-row items-center gap-3.5 rounded-[20px] border border-white/90 p-4"
          style={{ experimental_backgroundImage: background, boxShadow: shadow }}
        >
          <View
            pointerEvents="none"
            className="absolute inset-px rounded-[20px]"
            style={{ experimental_backgroundImage: SHEEN }}
          />
          <View
            className="h-11 w-11 items-center justify-center rounded-[14px] bg-white/80"
            style={{ boxShadow: iconShadow }}
          >
            <Icon size={22} color={color} strokeWidth={1.83} />
          </View>
          <View className="flex-1 gap-1">
            <Text
              numberOfLines={2}
              className="font-inter-bold text-[15px] leading-[18px] text-[#3E2723]"
            >
              {item.title}
            </Text>
            {item.subtitle ? (
              <Text
                numberOfLines={1}
                className="font-inter-medium text-[13px] leading-4"
                style={{ color: subtitleColor }}
              >
                {item.subtitle}
              </Text>
            ) : null}
          </View>
          <ChevronRight size={20} color={color} strokeWidth={1.67} />
        </Pressable>
      </Animated.View>
    </SwipeToDismiss>
  );
}
