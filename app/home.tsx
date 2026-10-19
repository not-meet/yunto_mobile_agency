import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvailabilityToggle } from '@/components/home/AvailabilityToggle';
import { BottomNav, useBottomNavClearance } from '@/components/home/BottomNav';
import { ExploreServices } from '@/components/home/ExploreServices';
import { HomeHeader } from '@/components/home/HomeHeader';
import { LeadMatrix } from '@/components/home/LeadMatrix';
import { LeadsAlert } from '@/components/home/LeadsAlert';
import { LiveCampaigns } from '@/components/home/LiveCampaigns';
import { Performance } from '@/components/home/Performance';
import { RecentActivity } from '@/components/home/RecentActivity';
import { Reminders } from '@/components/home/Reminders';
import { RevenueTarget } from '@/components/home/RevenueTarget';
import { TeamGlance } from '@/components/home/TeamGlance';
import { TopCreators } from '@/components/home/TopCreators';
import { useHomeDashboard } from '@/hooks/useHome';
import type { Role } from '@/services/authService';
import type { HomeDashboard } from '@/services/homeService';
import { useSessionStore } from '@/store/sessionStore';

// Role-based home: the header is the same for everyone, and each role gets its own list of
// sections below it, in order.

type Section = (home: HomeDashboard) => ReactNode;

const SECTIONS = {
  leadMatrix: (home) => <LeadMatrix matrix={home.leadMatrix} />,
  team: (home) => <TeamGlance team={home.team} />,
  performance: (home) => <Performance performance={home.performance} />,
  revenue: (home) => <RevenueTarget revenue={home.revenue} />,
  topCreators: (home) => <TopCreators creators={home.topCreators} />,
  liveCampaigns: (home) => <LiveCampaigns campaigns={home.liveCampaigns} />,
  services: () => <ExploreServices />,
  reminders: (home) => <Reminders reminders={home.reminders} />,
  activity: (home) => <RecentActivity activity={home.activity} />,
} satisfies Record<string, Section>;

type SectionKey = keyof typeof SECTIONS;

const SECTIONS_BY_ROLE: Record<Role, SectionKey[]> = {
  admin: [
    'leadMatrix',
    'team',
    'performance',
    'revenue',
    'topCreators',
    'services',
    'reminders',
    'activity',
  ],
  sales: [
    'leadMatrix',
    'performance',
    'revenue',
    'topCreators',
    'services',
    'reminders',
    'activity',
  ],
  operations: [
    'performance',
    'revenue',
    'topCreators',
    'liveCampaigns',
    'services',
    'reminders',
    'activity',
  ],
};

const STAGGER_MS = 70;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const clearance = useBottomNavClearance();
  const user = useSessionStore((s) => s.user);
  const role = useSessionStore((s) => s.role);
  const home = useHomeDashboard();

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-7 px-5"
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: clearance }}
        refreshControl={
          <RefreshControl
            refreshing={home.isRefetching}
            onRefresh={() => home.refetch()}
            colors={['#1F1A17']}
          />
        }
      >
        <View className="gap-4">
          <HomeHeader name={user?.fullName ?? 'Guest'} role={role} />
          <AvailabilityToggle />
          {home.data ? <LeadsAlert count={home.data.pendingLeads} /> : null}
        </View>

        {home.data ? (
          SECTIONS_BY_ROLE[role].map((key, index) => (
            // Keyed by role too, so switching roles staggers the new set in.
            <Animated.View
              key={`${role}-${key}`}
              entering={FadeInDown.delay(index * STAGGER_MS).duration(380)}
            >
              {SECTIONS[key](home.data)}
            </Animated.View>
          ))
        ) : home.isError ? (
          <View className="items-center gap-2 py-10">
            <Text className="font-inter-medium text-sm text-charcoal/60">
              Couldn&apos;t load your dashboard
            </Text>
            <Pressable onPress={() => home.refetch()} hitSlop={8} accessibilityRole="button">
              <Text className="font-inter-semibold text-sm text-charcoal">Try again</Text>
            </Pressable>
          </View>
        ) : (
          <ActivityIndicator color="#1F1A17" className="py-10" />
        )}
      </ScrollView>
      <BottomNav />
    </View>
  );
}
