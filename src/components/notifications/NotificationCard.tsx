import { Pressable, Text, View } from 'react-native';
import Animated, { ZoomOut } from 'react-native-reanimated';

import { NOTIFICATION_STYLES, notificationTime } from '@/components/notifications/labels';
import { usePressScale } from '@/hooks/usePressScale';
import type { AppNotification } from '@/services/notificationService';

// One entry in the day-grouped feed: kind icon, title, detail, time, and an unread dot in the
// kind's hue that shrinks away once it's opened.

interface NotificationCardProps {
  notification: AppNotification;
  onPress: () => void;
}

export function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const { icon: Icon, color, tint } = NOTIFICATION_STYLES[notification.kind];
  const { title, subtitle, createdAt, read } = notification;
  const time = notificationTime(createdAt);
  const press = usePressScale(0.985);

  return (
    <Animated.View style={press.style}>
      <Pressable
        {...press.handlers}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${read ? '' : 'Unread. '}${title}, ${subtitle ? `${subtitle}, ` : ''}${time}`}
        className="flex-row items-start gap-3.5 rounded-[20px] border border-white bg-white/90 p-4"
        style={{ boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.02)' }}
      >
        <View
          className="h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: tint }}
        >
          <Icon size={20} color={color} strokeWidth={1.67} />
        </View>
        <View className="flex-1 gap-[3px]">
          <Text
            numberOfLines={1}
            className={`font-inter-semibold text-[15px] leading-5 ${
              read ? 'text-[#555555]' : 'text-[#1A1A1A]'
            }`}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              className="font-inter-medium text-sm leading-[18px] text-[#777777]"
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View className="items-end gap-2">
          <Text className="font-inter-medium text-[13px] leading-4 text-[#AAAAAA]">{time}</Text>
          {read ? null : (
            <Animated.View
              exiting={ZoomOut.duration(180)}
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
