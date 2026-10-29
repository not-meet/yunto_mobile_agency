import { router, useLocalSearchParams } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
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
import { RemoveCreatorsSheet } from '@/components/leads/RemoveCreatorsSheet';
import {
  useLeadCreator,
  useRemoveLeadCreators,
  useSetLeadCreatorStatus,
} from '@/hooks/useLeadCreators';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import type { SetCreatorStatusRequest } from '@/services/leadCreatorsService';
import { showToast } from '@/utils/notifications';

// One creator pitched for a lead: their profile and status, analytics, deliverables, add-ons and
// activity, with removing them from the lead in the header. On a lead, the calendar and
// shortlisting are pinned to the bottom; on its campaign (`from` "campaign"), just marking them
// done. Opened from a creator card with the lead's `id` and the `creatorId`.
export default function LeadCreatorScreen() {
  const insets = useSafeAreaInsets();
  const clearance = useCreatorActionsBarClearance();
  const { id, creatorId, from } = useLocalSearchParams<{
    id: string;
    creatorId: string;
    from?: string;
  }>();
  const onCampaign = from === 'campaign';
  const creator = useLeadCreator(id, creatorId);
  const pull = usePullToRefresh(creator);
  const setStatus = useSetLeadCreatorStatus(id);
  const remove = useRemoveLeadCreators(id);
  const [removing, setRemoving] = useState(false);
  const { data } = creator;

  const confirmRemove = () => {
    if (!data || remove.isPending) return;
    remove.mutate([data.id], {
      onSuccess: () => {
        setRemoving(false);
        showToast(`${data.name} removed from this campaign`);
        if (router.canGoBack()) router.back();
        else router.replace({ pathname: '/leads/creators', params: { id, from } });
      },
    });
  };

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
        <BackButton
          tone="dark"
          fallbackHref={{ pathname: '/leads/creators', params: { id, from } }}
        />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Creator Detail
        </Text>
        {data ? (
          <Pressable
            onPress={() => {
              remove.reset();
              setRemoving(true);
            }}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${data.name} from this lead`}
            className="h-9 w-9 items-center justify-center rounded-[18px] border-[0.8px] border-white/90 bg-white/40 active:opacity-70"
            style={{ boxShadow: '0px 3.27px 9.82px rgba(0, 0, 0, 0.03)' }}
          >
            <Trash2 size={18} color="#E74C3C" strokeWidth={1.5} />
          </Pressable>
        ) : null}
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
                  onStatusChange={onCampaign ? undefined : changeStatus}
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
            actions={
              onCampaign
                ? [
                    {
                      label: data.status === 'done' ? 'Done' : 'Mark Done',
                      background: '#E9F6ED',
                      grow: true,
                      onPress: () => changeStatus('done'),
                      disabled: data.status === 'done',
                      busy: setStatus.isPending,
                    },
                  ]
                : [
                    {
                      label: 'Manage Calendar',
                      background: '#FFECF3',
                      grow: true,
                      onPress: () =>
                        router.push({ pathname: '/creators/calendar', params: { id: data.id } }),
                    },
                    {
                      label:
                        data.status === 'pending'
                          ? 'Mark Shortlist'
                          : CREATOR_STATUS_LABELS[data.status],
                      background: '#E9F6ED',
                      grow: true,
                      onPress: () => changeStatus('shortlisted'),
                      disabled: data.status !== 'pending',
                      busy: setStatus.isPending && setStatus.variables?.status === 'shortlisted',
                    },
                  ]
            }
          />
          <RemoveCreatorsSheet
            visible={removing}
            onClose={() => setRemoving(false)}
            count={1}
            onConfirm={confirmRemove}
            busy={remove.isPending}
            error={remove.isError ? 'Couldn’t remove this creator. Please try again.' : null}
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
