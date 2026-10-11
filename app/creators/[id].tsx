import { useLocalSearchParams } from 'expo-router';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { Reveal } from '@/components/common/Reveal';
import { CommercialsCard } from '@/components/creators/CommercialsCard';
import { PlatformStatsCard } from '@/components/creators/PlatformStatsCard';
import { ProfileCard } from '@/components/creators/ProfileCard';
import { ProfileSkeleton } from '@/components/creators/ProfileSkeleton';
import { useCreator } from '@/hooks/useCreators';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

// One creator's profile: who they are and how to reach them, each platform's numbers, and their
// rates. Opened from a creator card or the roster with the creator's `id`, and right after
// inviting someone.
export default function CreatorProfileScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const creator = useCreator(id);
  const pull = usePullToRefresh(creator);
  const { data } = creator;

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/creators" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Creator Profile
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
            gap: 16,
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <Reveal order={0}>
            <ProfileCard creator={data} />
          </Reveal>
          {data.platforms.map((stats, i) => (
            <Reveal key={stats.platform} order={i + 1}>
              <PlatformStatsCard stats={stats} />
            </Reveal>
          ))}
          <Reveal order={data.platforms.length + 1}>
            <CommercialsCard commercials={data.commercials} />
          </Reveal>
        </ScrollView>
      ) : creator.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load this creator.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void creator.refetch()}
              loading={creator.isFetching}
            />
          </View>
        </View>
      ) : (
        <ProfileSkeleton />
      )}
    </View>
  );
}
