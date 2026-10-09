import { router } from 'expo-router';
import { Bell, Mail, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { MessagesPanel } from '@/components/home/MessagesPanel';
import { CARD_SHADOW } from '@/components/home/shared';
import { usePressScale } from '@/hooks/usePressScale';
import type { Role } from '@/services/authService';

// Avatar, name and role on the left; messages (side panel) and notifications (own screen) on
// the right, as in yunto_mobile_app.

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  sales: 'Sales',
  operations: 'Operations',
};

function IconButton({
  icon: Icon,
  label,
  badge,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  badge?: boolean;
  onPress: () => void;
}) {
  const press = usePressScale(0.9);
  return (
    <Animated.View style={press.style}>
      <Pressable
        {...press.handlers}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={badge ? `${label}, unread` : label}
        className="h-10 w-10 items-center justify-center rounded-full bg-espresso"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <Icon size={20} color="#F1EEE8" strokeWidth={1.67} />
        {badge ? (
          <Animated.View
            entering={ZoomIn.delay(400).springify()}
            className="absolute right-px top-px h-3 w-3 rounded-full border-2 border-espresso bg-[#FFCDEA]"
          />
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

interface HomeHeaderProps {
  name: string;
  role: Role;
}

export function HomeHeader({ name, role }: HomeHeaderProps) {
  const [messagesOpen, setMessagesOpen] = useState(false);
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View className="flex-row items-center justify-between gap-4">
      <View className="flex-1 flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#E9E1FF]">
          <Text className="font-inter-semibold text-base text-charcoal">{initials}</Text>
        </View>
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="font-geist-medium text-2xl leading-8 tracking-[-0.6px] text-charcoal"
          >
            {name}
          </Text>
          <Text className="font-inter-light text-sm leading-5 tracking-[-0.35px] text-charcoal/60">
            {ROLE_LABELS[role]}
          </Text>
        </View>
      </View>
      <View className="flex-row gap-2">
        <IconButton icon={Mail} label="Messages" onPress={() => setMessagesOpen(true)} />
        <IconButton
          icon={Bell}
          label="Notifications"
          badge
          onPress={() => router.push('/notifications')}
        />
      </View>

      <MessagesPanel visible={messagesOpen} onClose={() => setMessagesOpen(false)} />
    </View>
  );
}
