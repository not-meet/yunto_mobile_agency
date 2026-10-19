import { useRef, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { Reveal } from '@/components/common/Reveal';
import { DistributionChannelToggle } from '@/components/profile/DistributionChannelToggle';
import { CHANNEL_OPTIONS } from '@/components/profile/distributionLabels';
import { LeadDistributionForm } from '@/components/profile/LeadDistributionForm';
import { useLeadDistribution } from '@/hooks/useLeadDistribution';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import type { DistributionChannel } from '@/services/leadDistributionService';

// "Lead Distribution", opened from the profile: how new leads and campaigns are handed to the
// team, each on its own tab. Both tabs stay mounted, so switching keeps unsaved edits.

export default function LeadDistributionScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const distribution = useLeadDistribution();
  const pull = usePullToRefresh(distribution);
  const { data } = distribution;
  const [channel, setChannel] = useState<DistributionChannel>('leads');
  const scroll = useRef<ScrollView>(null);

  const switchTo = (next: DistributionChannel) => {
    if (next === channel) return;
    setChannel(next);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

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
        <>
          <View className="px-5 pb-2">
            <DistributionChannelToggle value={channel} onChange={switchTo} />
          </View>
          <ScrollView
            ref={scroll}
            refreshControl={
              <RefreshControl
                refreshing={pull.refreshing}
                onRefresh={pull.onRefresh}
                colors={['#1F1A17']}
              />
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 14,
              paddingBottom: insets.bottom + 40,
            }}
          >
            <Reveal order={0}>
              {CHANNEL_OPTIONS.map(({ key }) => {
                const active = key === channel;
                const settings = data[key];
                return (
                  <Animated.View
                    key={key}
                    style={{
                      display: active ? 'flex' : 'none',
                      opacity: active ? 1 : 0,
                      ...(reduceMotion
                        ? null
                        : { transitionProperty: 'opacity', transitionDuration: 220 }),
                    }}
                  >
                    <LeadDistributionForm
                      // Starts over from what's saved whenever that changes.
                      key={`${settings.mode}:${settings.sequence.join(',')}:${settings.priority}:${data.members.map((m) => m.id).join(',')}`}
                      channel={key}
                      settings={settings}
                      members={data.members}
                    />
                  </Animated.View>
                );
              })}
            </Reveal>
          </ScrollView>
        </>
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
