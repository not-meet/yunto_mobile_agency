import { type Href, router } from 'expo-router';
import {
  CalendarDays,
  ClipboardCheck,
  ListTree,
  type LucideIcon,
  Users,
  UsersRound,
} from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { MenuCard } from '@/components/common/MenuCard';
import { Reveal } from '@/components/common/Reveal';
import { comingSoon } from '@/components/home/shared';

// "Team Management", opened from the profile: setting up teams and
// members, managing the teams, and the people overview.

// `href`: its screen. Items without one aren't built yet.
const ITEMS: {
  title: string;
  icon: LucideIcon;
  tone: { color: string; background: string };
  href?: Href;
}[] = [
  {
    title: 'Create Teams',
    icon: UsersRound,
    tone: { color: '#9333EA', background: '#F3E8FF' },
    href: '/team/create',
  },
  {
    title: 'Manage Teams',
    icon: ListTree,
    tone: { color: '#2563EB', background: '#DBEAFE' },
    href: '/team/manage',
  },
  {
    title: 'People',
    icon: Users,
    tone: { color: '#159B7F', background: '#CCFBF1' },
    href: '/team/people',
  },
  { title: 'Leaves', icon: CalendarDays, tone: { color: '#EA580C', background: '#FFEDD5' } },
  {
    title: 'Assign Creators',
    icon: ClipboardCheck,
    tone: { color: '#059669', background: '#D1FAE5' },
  },
];

export default function TeamScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/profile" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Team Management
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: insets.bottom + 40,
        }}
      >
        <View className="gap-3">
          {ITEMS.map(({ title, icon, tone, href }, i) => (
            <Reveal key={title} order={i}>
              <MenuCard
                title={title}
                icon={icon}
                tone={tone}
                onPress={href ? () => router.push(href) : () => comingSoon(title)}
              />
            </Reveal>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
