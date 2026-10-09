import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated, { LinearTransition, ZoomIn } from 'react-native-reanimated';

import { SectionHeader } from '@/components/home/SectionHeader';
import { CARD_SHADOW } from '@/components/home/shared';
import { useToggleReminder } from '@/hooks/useHome';
import type { Reminder } from '@/services/homeService';

// Today's to-dos. Tapping one ticks it off (or back on). Open ones sit above done ones.

export function Reminders({ reminders }: { reminders: Reminder[] }) {
  const toggle = useToggleReminder();
  const sorted = [...reminders].sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <View className="gap-4">
      <SectionHeader
        title="Reminders"
        action={{ label: 'See all', onPress: () => router.push('/reminders') }}
      />
      <View className="gap-2">
        {sorted.map((reminder) => (
          <Animated.View key={reminder.id} layout={LinearTransition.springify().damping(18)}>
            <Pressable
              onPress={() => toggle.mutate({ id: reminder.id, done: !reminder.done })}
              accessibilityRole="checkbox"
              accessibilityLabel={reminder.title}
              accessibilityState={{ checked: reminder.done }}
              className={`h-16 flex-row items-center gap-3 rounded-[20px] border border-sand bg-white/40 p-3 ${reminder.done ? 'opacity-70' : ''}`}
              style={{ boxShadow: CARD_SHADOW }}
            >
              {reminder.done ? (
                <Animated.View
                  entering={ZoomIn.springify()}
                  className="h-5 w-5 items-center justify-center rounded-full bg-charcoal"
                >
                  <Check size={12} color="#F9F6EE" strokeWidth={2} />
                </Animated.View>
              ) : (
                <View className="h-5 w-5 rounded-full border-2 border-charcoal/20" />
              )}
              <View className="flex-1">
                <Text
                  numberOfLines={1}
                  className={`font-inter-bold text-sm leading-[21px] ${reminder.done ? 'text-charcoal/60' : 'text-charcoal'}`}
                >
                  {reminder.title}
                </Text>
                <Text
                  className={`font-inter-medium text-[11px] leading-4 ${reminder.done ? 'text-charcoal/40' : 'text-charcoal/60'}`}
                >
                  {reminder.done ? 'Completed' : reminder.due}
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
