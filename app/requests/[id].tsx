import { router, useLocalSearchParams } from 'expo-router';
import { BadgeCheck } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  parseRequestTab,
  RequestCard,
  REQUEST_TABS,
  type RequestTab,
  requestTab,
} from '@/components/requests/RequestCard';
import { BackButton } from '@/components/common/BackButton';
import { BrowseMoreButton } from '@/components/common/BrowseMoreButton';
import { Button } from '@/components/common/Button';
import { ConfirmSheet } from '@/components/common/ConfirmSheet';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { SegmentedFilter } from '@/components/common/SegmentedFilter';
import { ConfirmedTalentCard } from '@/components/requests/ConfirmedTalentCard';
import { ROLE_LABELS } from '@/components/talent/labels';
import { useCampaignRequests, useConfirmRequest } from '@/hooks/useTalentCampaigns';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import type { CampaignRequest } from '@/services/talentCampaignService';
import { apiErrorCode } from '@/utils/api';
import { showToast } from '@/utils/notifications';

// Every talent the creator swiped on for a campaign, split into accepted, pending and history.
// An accepted talent can be confirmed for the campaign; whoever is shows pinned above the list.
// Opened from a campaign card's "View" (or a brand campaign's add-on) with the campaign's `id`,
// optionally with a `tab` param.

export default function CampaignRequestsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string; tab?: string }>();
  const tab = parseRequestTab(params.tab);
  const requests = useCampaignRequests(params.id);
  const pull = usePullToRefresh(requests);
  const confirm = useConfirmRequest(params.id);
  const { data } = requests;
  const confirmed = data?.requests.find((r) => r.id === data.campaign.confirmedRequestId);

  const openProfile = (request: CampaignRequest) =>
    router.push({
      pathname: '/talent/[id]',
      params: { id: request.talent.id, role: data?.campaign.role },
    });
  const openChat = (request: CampaignRequest) =>
    router.push({ pathname: '/requests/chat', params: { id: params.id, requestId: request.id } });

  // The request on the confirm sheet. Kept after it closes so the sheet fades out intact.
  const [asking, setAsking] = useState<CampaignRequest | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const askToConfirm = (request: CampaignRequest) => {
    if (confirm.isPending) return;
    confirm.reset();
    setAsking(request);
    setSheetOpen(true);
  };

  const confirmAsked = () => {
    if (!data || !asking) return;
    const { name } = asking.talent;
    confirm.mutate(asking.id, {
      onSuccess: () => {
        setSheetOpen(false);
        showToast(`${name} confirmed for ${data.campaign.title}`);
      },
    });
  };

  const options = REQUEST_TABS.map(({ key, label }) => ({
    key,
    label: `${label} (${data?.requests.filter((r) => requestTab(r.status) === key).length ?? 0})`,
  }));
  const shown = data?.requests.filter((r) => requestTab(r.status) === tab);

  return (
    <View className="flex-1 bg-[#F7F0E4]" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-3 px-[15px] py-4">
        <BackButton fallbackHref="/requests" />
        <View className="flex-1">
          <Text
            accessibilityRole="header"
            className="font-grotesk-bold text-2xl leading-7 tracking-[-1px] text-espresso"
          >
            All requests
          </Text>
          {data ? (
            <Text numberOfLines={1} className="font-inter-medium text-[13px] leading-4 text-muted">
              {data.campaign.title}
            </Text>
          ) : null}
        </View>
      </View>

      {data ? (
        <FlatList
          refreshing={pull.refreshing}
          onRefresh={pull.onRefresh}
          data={shown}
          keyExtractor={(request) => request.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 15,
            paddingBottom: insets.bottom + 24,
          }}
          ListHeaderComponent={
            <View className="gap-4 pb-4">
              {confirmed ? (
                <ConfirmedTalentCard
                  role={ROLE_LABELS[data.campaign.role].singular}
                  talent={confirmed.talent}
                  rate={confirmed.rate}
                  onOpenProfile={() => openProfile(confirmed)}
                  onOpenChat={() => openChat(confirmed)}
                />
              ) : null}
              <SegmentedFilter<RequestTab>
                options={options}
                selected={tab}
                onSelect={(next) => router.setParams({ tab: next })}
              />
            </View>
          }
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 60).duration(300)}>
              <RequestCard
                request={item}
                confirmed={item.id === confirmed?.id}
                locked={confirmed !== undefined}
                confirming={confirm.isPending && confirm.variables === item.id}
                onOpenProfile={() => openProfile(item)}
                onOpenChat={() => openChat(item)}
                onConfirm={() => askToConfirm(item)}
              />
            </Animated.View>
          )}
          ListEmptyComponent={
            <Text className="py-10 text-center font-inter-medium text-[15px] leading-5 text-muted">
              Nothing here yet.
            </Text>
          }
          ListFooterComponent={
            <View className="pt-6">
              <BrowseMoreButton
                onPress={() =>
                  router.push({ pathname: '/talent', params: { role: data.campaign.role } })
                }
              />
            </View>
          }
        />
      ) : requests.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load this campaign’s requests.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void requests.refetch()}
              loading={requests.isFetching}
            />
          </View>
        </View>
      ) : (
        <ListSkeleton label="Loading requests" cardHeight={220} />
      )}

      {data && asking ? (
        <ConfirmSheet
          visible={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title={`Confirm ${asking.talent.name}?`}
          message={`${asking.talent.name} will be locked in for ${data.campaign.title}.`}
          icon={BadgeCheck}
          tone={{ color: '#7C3AED', background: 'rgba(183, 148, 244, 0.18)' }}
          confirmLabel="Confirm"
          onConfirm={confirmAsked}
          busy={confirm.isPending}
          error={
            !confirm.isError
              ? null
              : apiErrorCode(confirm.error) === 'conflict'
                ? 'Only a talent who accepted can be confirmed, and only one per campaign.'
                : 'Couldn’t confirm that talent. Please try again.'
          }
        />
      ) : null}
    </View>
  );
}
