import { useLocalSearchParams } from 'expo-router';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { Reveal } from '@/components/common/Reveal';
import {
  CreatorActionsBar,
  useCreatorActionsBarClearance,
} from '@/components/leads/CreatorActionsBar';
import { CreatorAddOns } from '@/components/leads/CreatorAddOns';
import { CreatorAnalytics } from '@/components/leads/CreatorAnalytics';
import { CreatorDeliverables } from '@/components/leads/CreatorDeliverables';
import { CreatorDetailsSkeleton } from '@/components/leads/CreatorDetailsSkeleton';
import { CreatorHero } from '@/components/leads/CreatorHero';
import { CreatorTimeline } from '@/components/leads/CreatorTimeline';
import { CREATOR_STATUS_LABELS } from '@/components/leads/labels';
import { useLeadCreator, useSetLeadCreatorStatus } from '@/hooks/useLeadCreators';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import type { SetCreatorStatusRequest } from '@/services/leadCreatorsService';
import { showToast } from '@/utils/notifications';

// One creator pitched for a lead: their profile and status, analytics, deliverables, add-ons and
// activity, with shortlisting pinned to the bottom. Opened from a creator card with the lead's
// `id` and the `creatorId`.
export default function LeadCreatorScreen() {
  const insets = useSafeAreaInsets();
  const clearance = useCreatorActionsBarClearance();
  const { id, creatorId } = useLocalSearchParams<{ id: string; creatorId: string }>();
  const creator = useLeadCreator(id, creatorId);
  const pull = usePullToRefresh(creator);
  const setStatus = useSetLeadCreatorStatus(id);
  const { data } = creator;

  const changeStatus = (status: SetCreatorStatusRequest['status']) => {
    if (!data || setStatus.isPending) return;
    setStatus.mutate(
      { creatorIds: [data.id], status },
      {
        onSuccess: () =>
          showToast(`${data.name} is now ${CREATOR_STATUS_LABELS[status].toLowerCase()}`),
        onError: () => showToast('Couldn’t update this creator. Please try again.'),
      },
    );
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref={{ pathname: '/leads/creators', params: { id } }} />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Creator Detail
        </Text>
      </View>

      {data ? (
        <>
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
              paddingHorizontal: 16,
              paddingTop: 4,
              paddingBottom: clearance,
            }}
          >
            <View className="gap-6">
              <Reveal order={0}>
                <CreatorHero
                  creator={data}
                  onStatusChange={changeStatus}
                  updating={setStatus.isPending}
                />
              </Reveal>
              <Reveal order={1}>
                <CreatorAnalytics creator={data} />
              </Reveal>
              <Reveal order={2}>
                <CreatorDeliverables deliverables={data.deliverables} />
              </Reveal>
              {data.addOns.length > 0 ? (
                <Reveal order={3}>
                  <CreatorAddOns addOns={data.addOns} />
                </Reveal>
              ) : null}
              <Reveal order={4}>
                <CreatorTimeline activity={data.activity} />
              </Reveal>
            </View>
          </ScrollView>

          <CreatorActionsBar
            buttonHeight={40}
            actions={[
              {
                label: 'Manage Calendar',
                background: '#FFECF3',
                grow: true,
                // TODO(creators): open the creator's calendar once that screen is designed.
                onPress: () => showToast('Calendar is coming soon'),
              },
              {
                label:
                  data.status === 'pending' ? 'Mark Shortlist' : CREATOR_STATUS_LABELS[data.status],
                background: '#E9F6ED',
                grow: true,
                onPress: () => changeStatus('shortlisted'),
                disabled: data.status !== 'pending',
                busy: setStatus.isPending && setStatus.variables?.status === 'shortlisted',
              },
            ]}
          />
        </>
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
        <CreatorDetailsSkeleton />
      )}
    </View>
  );
}
