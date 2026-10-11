import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { CircleUserRound, LogOut, Network, Plug, Users } from 'lucide-react-native';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { ConfirmSheet } from '@/components/common/ConfirmSheet';
import { Reveal } from '@/components/common/Reveal';
import { comingSoon } from '@/components/home/shared';
import { ActivityRow } from '@/components/profile/ActivityRow';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { ProfileSummary } from '@/components/profile/ProfileSummary';
import { useProfile } from '@/hooks/useProfile';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useSessionStore } from '@/store/sessionStore';

// The signed-in member's profile, opened from their photo or name on home: who they are and
// their agency's code and numbers, then where to manage their details, the team, lead
// distribution and integrations, and Log Out.
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const signOut = useSessionStore((s) => s.signOut);
  const profile = useProfile();
  const pull = usePullToRefresh(profile);
  const [loggingOut, setLoggingOut] = useState(false);
  const { data } = profile;

  const logOut = () => {
    setLoggingOut(false);
    signOut();
    // Nothing of this account should show to whoever signs in next.
    queryClient.clear();
    if (router.canDismiss()) router.dismissAll();
    router.replace('/sign-in');
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/home" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Profile
        </Text>
      </View>

      {data ? (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={pull.refreshing}
              onRefresh={pull.onRefresh}
              colors={['#1F1A17']}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            gap: 12,
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: insets.bottom + 40,
          }}
        >
          <Reveal order={0}>
            <ProfileSummary overview={data} />
          </Reveal>

          <Reveal order={1}>
            <Text
              accessibilityRole="header"
              className="px-1 pb-1 pt-5 font-inter-bold text-[11px] uppercase leading-4 tracking-[1.1px] text-[#AAAAAA]"
            >
              Activity
            </Text>
            <View className="gap-3">
              <ActivityRow
                title="Profile & Agency Info"
                subtitle="Manage your details"
                icon={CircleUserRound}
                tint="#EDF2F6"
                onPress={() => router.push('/profile/details')}
              />
              <ActivityRow
                title="Team Management"
                subtitle={`${data.stats.teams} ${data.stats.teams === 1 ? 'Team' : 'Teams'}`}
                icon={Users}
                tint="#F0F5F1"
                onPress={() => router.push('/team')}
              />
              {/* TODO(profile): open these once their screens exist. */}
              <ActivityRow
                title="Lead Distribution"
                subtitle="Auto-assign rules"
                icon={Network}
                tint="#F5F0FA"
                onPress={() => comingSoon('Lead distribution')}
              />
              <ActivityRow
                title="Integrations"
                subtitle="Facebook, Wordpress, Google Ads"
                icon={Plug}
                tint="#FEF9EE"
                onPress={() => comingSoon('Integrations')}
              />
            </View>
          </Reveal>

          <Reveal order={2}>
            <View className="my-3 h-px bg-black/5" />
            <ActivityRow
              title="Log Out"
              icon={LogOut}
              tint="#FFF1F1"
              onPress={() => setLoggingOut(true)}
              danger
            />
          </Reveal>
        </ScrollView>
      ) : profile.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load your profile.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void profile.refetch()}
              loading={profile.isFetching}
            />
          </View>
        </View>
      ) : (
        <ProfileSkeleton />
      )}

      <ConfirmSheet
        visible={loggingOut}
        onClose={() => setLoggingOut(false)}
        title="Log out?"
        message="You’ll need to sign in again to see your agency’s leads and creators."
        icon={LogOut}
        tone={{ color: '#9B3232', background: '#FFF1F1' }}
        confirmLabel="Log Out"
        onConfirm={logOut}
      />
    </View>
  );
}
