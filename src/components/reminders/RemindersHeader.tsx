import { Text, View } from 'react-native';

import { BackButton } from '@/components/common/BackButton';

// Back button with the screen's title centred, the same as yunto_mobile_app's reminders header.
// An empty slot on the right keeps the title centred.

interface RemindersHeaderProps {
  title: string;
  fallbackHref?: '/home' | '/reminders';
}

export function RemindersHeader({ title, fallbackHref = '/home' }: RemindersHeaderProps) {
  return (
    <View className="flex-row items-center justify-between gap-2 px-5 py-[15px]">
      <BackButton fallbackHref={fallbackHref} size={44} />
      <View className="flex-1 items-center">
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          className="font-grotesk-bold text-2xl leading-7 tracking-[-1px] text-cocoa"
        >
          {title}
        </Text>
      </View>
      <View className="w-11" />
    </View>
  );
}
