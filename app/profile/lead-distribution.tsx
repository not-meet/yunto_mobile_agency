import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { Reveal } from '@/components/common/Reveal';
import { LeadDistributionForm } from '@/components/profile/LeadDistributionForm';
import { useLeadDistribution } from '@/hooks/useLeadDistribution';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

// "Lead Distribution", opened from the profile: how new leads are handed to the team, and in
// what order for round by round.

export default function LeadDistributionScreen() {
  const insets = useSafeAreaInsets();
  const distribution = useLeadDistribution();
  const pull = usePullToRefresh(distribution);
  const { data } = distribution;

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/profile" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Lead Distribution
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
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: insets.bottom + 40,
          }}
        >
          <Reveal order={0}>
            <LeadDistributionForm
              // Starts over from what's saved whenever that changes.
              key={`${data.mode}:${data.members.map((m) => m.id).join(',')}`}
              distribution={data}
            />
          </Reveal>
        </ScrollView>
      ) : distribution.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load your lead distribution.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void distribution.refetch()}
              loading={distribution.isFetching}
            />
          </View>
        </View>
      ) : (
        <ListSkeleton label="Loading lead distribution" cardHeight={598} withFilters={false} />
      )}
    </View>
  );
}
