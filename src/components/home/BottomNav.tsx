import { type Href, router } from 'expo-router';
import {
  ClipboardList,
  Contact,
  House,
  type LucideIcon,
  Plus,
  UsersRound,
} from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CARD_SHADOW, comingSoon } from '@/components/home/shared';
import { usePressScale } from '@/hooks/usePressScale';

// Floating bottom nav, the same shape as yunto_mobile_app's: four tabs with a create button
// poking out of the middle. It floats over the screen, so the screen pads its scroll content
// with useBottomNavClearance().
// TODO(nav): move this into an app/(tabs) layout as a custom tabBar once the other tabs exist,
// and frost it with expo-blur like yunto_mobile_app does; until then it sits on a solid wash.

const BAR_HEIGHT = 76;
const BAR_BOTTOM_GAP = 22;

// `href`: pushed for now, until the tabs layout exists. Tabs without one aren't built yet.
const TABS: { label: string; icon: LucideIcon; href?: Href }[] = [
  { label: 'Home', icon: House },
  { label: 'Leads', icon: UsersRound, href: '/leads' },
  { label: 'Creators', icon: Contact, href: '/creators' },
  { label: 'Reminder', icon: ClipboardList, href: '/reminders' },
];

export function useBottomNavClearance(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + BAR_BOTTOM_GAP + BAR_HEIGHT + 16;
}

function TabItem({
  label,
  icon: Icon,
  href,
  focused,
}: {
  label: string;
  icon: LucideIcon;
  href?: Href;
  focused: boolean;
}) {
  const color = focused ? '#B88BFF' : '#9A8EA3';
  return (
    <Pressable
      onPress={focused ? undefined : href ? () => router.push(href) : () => comingSoon(label)}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      className="flex-1 items-center gap-1 active:opacity-70"
    >
      <View className="h-[34px] w-[34px] items-center justify-center">
        <Icon size={20} color={color} strokeWidth={1.67} />
      </View>
      <Text
        numberOfLines={1}
        className={`text-xs leading-[14px] ${focused ? 'font-inter-semibold' : 'font-inter-medium'}`}
        style={{ color }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CreateButton() {
  const press = usePressScale(0.9);
  return (
    <View className="w-[76px] items-center">
      <Animated.View style={press.style} className="mb-[26px]">
        <Pressable
          {...press.handlers}
          onPress={() => router.push('/leads/add')}
          accessibilityRole="button"
          accessibilityLabel="Add lead"
          className="h-[60px] w-[60px] items-center justify-center rounded-full bg-canvas"
          style={{ boxShadow: CARD_SHADOW }}
        >
          <View
            className="h-12 w-12 items-center justify-center rounded-full bg-[#FFCDEA]"
            style={{ boxShadow: 'inset 0px 2px 4px rgba(0, 0, 0, 0.05)' }}
          >
            <Plus size={24} color="#1C1C1E" strokeWidth={2} />
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

export function BottomNav() {
  const insets = useSafeAreaInsets();
  const [home, ...rest] = TABS.map((tab, index) => (
    <TabItem key={tab.label} {...tab} focused={index === 0} />
  ));

  return (
    <View
      className="absolute left-4 right-4 flex-row items-center rounded-[30px] border border-[rgba(248,248,248,0.76)] bg-white/90 px-[19px]"
      style={{
        height: BAR_HEIGHT,
        bottom: insets.bottom + BAR_BOTTOM_GAP,
        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.06)',
      }}
    >
      {home}
      {rest[0]}
      <CreateButton />
      {rest.slice(1)}
    </View>
  );
}
