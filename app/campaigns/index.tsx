import { router, useLocalSearchParams } from 'expo-router';
import { Megaphone } from 'lucide-react-native';
import { Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  LinearTransition,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { CampaignsSkeleton } from '@/components/campaigns/CampaignsSkeleton';
import { campaignMatches, FILTER_CHIPS, parseCampaignFilter } from '@/components/campaigns/labels';
import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { StatusFilters } from '@/components/leads/StatusFilters';
import { useCampaigns } from '@/hooks/useCampaigns';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

// Every campaign the agency is running, filtered by status. Each one is a lead marked converted.
// Opened from the bottom nav, optionally with a `filter` param ("live", "upcoming"…). Tap a
// card, or swipe it right, to open the campaign.

const STAGGER_MS = 60;
const MAX_STAGGERED = 6;

export default function CampaignsScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const params = useLocalSearchParams<{ filter?: string }>();
  const filter = parseCampaignFilter(params.filter);
  const campaigns = useCampaigns();
  const pull = usePullToRefresh(campaigns);
  const { data } = campaigns;

  const counts = Object.fromEntries(
    FILTER_CHIPS.map(({ key }) => [key, data?.filter((c) => campaignMatches(c, key)).length ?? 0]),
  ) as Record<(typeof FILTER_CHIPS)[number]['key'], number>;
  const shown = data?.filter((c) => campaignMatches(c, filter));
  const setFilter = (next: string) => router.setParams({ filter: next });

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/home" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Campaigns
        </Text>
      </View>

      {data ? (
        <>
          <View className="px-4 pb-4 pt-[10px]">
            <StatusFilters
              chips={FILTER_CHIPS}
              selected={filter}
              counts={counts}
              onSelect={setFilter}
              noun="campaigns"
            />
          </View>

          <Animated.FlatList
            // Remounted per filter so the cards ease back in.
            key={filter}
            data={shown}
            keyExtractor={(campaign) => campaign.id}
            refreshing={pull.refreshing}
            onRefresh={pull.onRefresh}
            showsVerticalScrollIndicator={false}
            itemLayoutAnimation={reduceMotion ? undefined : LinearTransition.duration(240)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
            ItemSeparatorComponent={() => <View className="h-3.5" />}
            renderItem={({ item, index }) => (
              <Animated.View
                entering={
                  reduceMotion
                    ? undefined
                    : FadeInDown.delay(Math.min(index, MAX_STAGGERED) * STAGGER_MS).duration(300)
                }
              >
                <CampaignCard
                  campaign={item}
                  onOpen={() =>
                    router.push({ pathname: '/campaigns/[id]', params: { id: item.id } })
                  }
                />
              </Animated.View>
            )}
            ListEmptyComponent={
              <Animated.View
                entering={reduceMotion ? undefined : FadeIn.duration(250)}
                className="items-center gap-3 py-16"
              >
                <View className="h-14 w-14 items-center justify-center rounded-full bg-white/70">
                  <Megaphone size={24} color="#9A8EA3" strokeWidth={1.67} />
                </View>
                <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
                  {filter === 'all'
                    ? 'No campaigns yet. Mark a lead converted to start one.'
                    : 'No campaigns here yet.'}
                </Text>
              </Animated.View>
            }
          />
        </>
      ) : campaigns.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load your campaigns.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void campaigns.refetch()}
              loading={campaigns.isFetching}
            />
          </View>
        </View>
      ) : (
        <View className="pt-[10px]">
          <CampaignsSkeleton />
        </View>
      )}
    </View>
  );
}
