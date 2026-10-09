import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { parseCampaignStage, STAGE_LABELS } from '@/components/requests/labels';
import { TalentCampaignCard } from '@/components/requests/TalentCampaignCard';
import { BackButton } from '@/components/common/BackButton';
import { BrowseMoreButton } from '@/components/common/BrowseMoreButton';
import { Button } from '@/components/common/Button';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { SegmentedFilter } from '@/components/common/SegmentedFilter';
import { useTalentCampaigns } from '@/hooks/useTalentCampaigns';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { type CampaignStage, campaignStageSchema } from '@/services/talentCampaignService';

// Campaigns the creator is hiring talent for, filtered by stage. Opened from "View requests"
// under Explore services on home, optionally with a `stage` param (e.g. "shortlisted").

export default function TalentRequestsScreen() {
  const insets = useSafeAreaInsets();
  const { stage: rawStage } = useLocalSearchParams<{ stage?: string }>();
  const stage = parseCampaignStage(rawStage);
  const campaigns = useTalentCampaigns();
  const pull = usePullToRefresh(campaigns);
  const { data } = campaigns;

  const options = campaignStageSchema.options.map((key) => ({
    key,
    label: `${STAGE_LABELS[key]} (${data?.filter((c) => c.stage === key).length ?? 0})`,
  }));
  const shown = data?.filter((c) => c.stage === stage);

  return (
    <View className="flex-1 bg-[#F7F0E4]" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-3 px-[15px] py-4">
        <BackButton fallbackHref="/home" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-grotesk-bold text-2xl leading-7 tracking-[-1px] text-espresso"
        >
          Talent requests
        </Text>
      </View>

      {data ? (
        <FlatList
          refreshing={pull.refreshing}
          onRefresh={pull.onRefresh}
          data={shown}
          keyExtractor={(campaign) => campaign.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 15,
            paddingBottom: insets.bottom + 24,
          }}
          ListHeaderComponent={
            <View className="pb-4">
              <SegmentedFilter<CampaignStage>
                options={options}
                selected={stage}
                onSelect={(next) => router.setParams({ stage: next })}
              />
            </View>
          }
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 60).duration(300)}>
              <TalentCampaignCard
                campaign={item}
                onView={() => router.push({ pathname: '/requests/[id]', params: { id: item.id } })}
              />
            </Animated.View>
          )}
          ListEmptyComponent={
            <Text className="py-10 text-center font-inter-medium text-[15px] leading-5 text-muted">
              No {STAGE_LABELS[stage].toLowerCase()} campaigns right now.
            </Text>
          }
          ListFooterComponent={
            <View className="pt-6">
              <BrowseMoreButton onPress={() => router.push('/talent')} />
            </View>
          }
        />
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
        <ListSkeleton label="Loading your campaigns" cardHeight={331} />
      )}
    </View>
  );
}
