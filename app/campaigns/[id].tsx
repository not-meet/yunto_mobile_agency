import { useLocalSearchParams } from 'expo-router';
import { BadgeCheck } from 'lucide-react-native';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CampaignHero } from '@/components/campaigns/CampaignHero';
import { CampaignInfo } from '@/components/campaigns/CampaignInfo';
import { isClosed, STATUS_STYLES } from '@/components/campaigns/labels';
import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { ConfirmSheet } from '@/components/common/ConfirmSheet';
import { Reveal } from '@/components/common/Reveal';
import { FollowUpSheet } from '@/components/leads/FollowUpSheet';
import { LeadActionsBar, useLeadActionsBarClearance } from '@/components/leads/LeadActionsBar';
import { LeadDetailsSkeleton } from '@/components/leads/LeadDetailsSkeleton';
import { LeadTabs } from '@/components/leads/LeadTabs';
import { NotesAndActivity } from '@/components/leads/NotesAndActivity';
import { useCampaign, useCompleteCampaign } from '@/hooks/useCampaigns';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { showToast } from '@/utils/notifications';

type CampaignTab = 'info' | 'notes';

const TABS: { key: CampaignTab; label: string }[] = [
  { key: 'info', label: 'Campaign Info' },
  { key: 'notes', label: 'Notes & Activity' },
];

// One campaign: its details and its notes & activity, with follow up / mark closed pinned to the
// bottom (closing is gone once it's closed). Notes, activity and follow-ups are the lead's,
// carried over when it converted. Opened from a campaign card, or from its lead, with the
// campaign's `id`.
export default function CampaignDetailsScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const clearance = useLeadActionsBarClearance();
  const { id } = useLocalSearchParams<{ id: string }>();
  const campaign = useCampaign(id);
  const { data } = campaign;
  const pull = usePullToRefresh(campaign);
  const complete = useCompleteCampaign(id);

  const [tab, setTab] = useState<CampaignTab>('info');
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const ask = () => {
    if (complete.isPending) return;
    complete.reset();
    setConfirming(true);
  };

  const confirm = () => {
    if (!data) return;
    complete.mutate(undefined, {
      onSuccess: () => {
        setConfirming(false);
        showToast('Campaign closed');
      },
    });
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/campaigns" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Campaign Detail
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
            // Lets the note field's button take a tap while the keyboard is up.
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 15,
              paddingTop: 5,
              paddingBottom: clearance,
            }}
          >
            <View className="gap-[15px]">
              <Reveal order={0}>
                <CampaignHero campaign={data} />
              </Reveal>
              <Reveal order={1}>
                <LeadTabs tabs={TABS} selected={tab} onSelect={setTab} />
              </Reveal>
              <Reveal order={2}>
                <Animated.View
                  key={tab}
                  entering={reduceMotion ? undefined : FadeIn.duration(250)}
                  exiting={reduceMotion ? undefined : FadeOut.duration(150)}
                >
                  {tab === 'info' ? (
                    <CampaignInfo campaign={data} />
                  ) : (
                    <NotesAndActivity
                      leadId={data.leadId}
                      onAddFollowUp={() => setFollowUpOpen(true)}
                    />
                  )}
                </Animated.View>
              </Reveal>
            </View>
          </ScrollView>

          <LeadActionsBar
            onFollowUp={() => setFollowUpOpen(true)}
            primary={
              isClosed(data.status)
                ? { label: STATUS_STYLES[data.status].label, onPress: () => {}, disabled: true }
                : { label: 'Mark Closed', onPress: ask }
            }
          />
          <FollowUpSheet
            leadId={data.leadId}
            visible={followUpOpen}
            onClose={() => setFollowUpOpen(false)}
          />
          <ConfirmSheet
            visible={confirming}
            onClose={() => setConfirming(false)}
            title={`Close ${data.name}?`}
            message="It closes at 100% and moves under Completed."
            icon={BadgeCheck}
            tone={{ color: '#2B9A57', background: 'rgba(43, 154, 87, 0.12)' }}
            confirmLabel="Mark closed"
            onConfirm={confirm}
            busy={complete.isPending}
            error={complete.isError ? 'Couldn’t close this campaign. Please try again.' : null}
          />
        </>
      ) : campaign.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load this campaign.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void campaign.refetch()}
              loading={campaign.isFetching}
            />
          </View>
        </View>
      ) : (
        <LeadDetailsSkeleton label="Loading campaign" />
      )}
    </View>
  );
}
