import { router, useLocalSearchParams } from 'expo-router';
import { BadgeCheck, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { ConfirmSheet } from '@/components/common/ConfirmSheet';
import { Reveal } from '@/components/common/Reveal';
import { FollowUpSheet } from '@/components/leads/FollowUpSheet';
import { LeadActionsBar, useLeadActionsBarClearance } from '@/components/leads/LeadActionsBar';
import { LeadDetailsSkeleton } from '@/components/leads/LeadDetailsSkeleton';
import { LeadHero } from '@/components/leads/LeadHero';
import { LeadInfo } from '@/components/leads/LeadInfo';
import { LeadTabs } from '@/components/leads/LeadTabs';
import { NotesAndActivity } from '@/components/leads/NotesAndActivity';
import { useLeadActivity } from '@/hooks/useLeadActivity';
import { useConvertLead, useDeleteLead, useLead } from '@/hooks/useLeads';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { showToast } from '@/utils/notifications';

type LeadTab = 'info' | 'notes';

const TABS: { key: LeadTab; label: string }[] = [
  { key: 'info', label: 'Lead Info' },
  { key: 'notes', label: 'Notes & Activity' },
];

type Confirming = 'convert' | 'delete';

const CONFIRM_COPY = {
  convert: {
    icon: BadgeCheck,
    tone: { color: '#7C3AED', background: 'rgba(183, 148, 244, 0.18)' },
    confirmLabel: 'Convert',
    error: 'Couldn’t convert this lead. Please try again.',
  },
  delete: {
    icon: Trash2,
    tone: { color: '#E74C3C', background: 'rgba(231, 76, 60, 0.12)' },
    confirmLabel: 'Delete',
    error: 'Couldn’t delete this lead. Please try again.',
  },
} as const;

// One lead: its details and its notes & activity, with follow up / mark converted pinned to the
// bottom and delete in the header. Opened from a lead card with the lead's `id`.
export default function LeadDetailsScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const clearance = useLeadActionsBarClearance();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lead = useLead(id);
  // Fetched alongside the lead so the notes tab opens ready.
  const activity = useLeadActivity(id);
  const pull = usePullToRefresh(lead, activity);
  const convert = useConvertLead(id);
  const remove = useDeleteLead(id);
  const { data } = lead;

  const [tab, setTab] = useState<LeadTab>('info');
  const [followUpOpen, setFollowUpOpen] = useState(false);
  // What the confirm sheet is asking. Kept after it closes so the sheet fades out intact.
  const [confirming, setConfirming] = useState<Confirming>('convert');
  const [sheetOpen, setSheetOpen] = useState(false);
  const action = confirming === 'convert' ? convert : remove;

  const ask = (next: Confirming) => {
    if (convert.isPending || remove.isPending) return;
    convert.reset();
    remove.reset();
    setConfirming(next);
    setSheetOpen(true);
  };

  const confirm = () => {
    if (!data) return;
    if (confirming === 'convert') {
      convert.mutate(undefined, {
        onSuccess: () => {
          setSheetOpen(false);
          showToast(`${data.name} is now a campaign`);
        },
      });
    } else {
      remove.mutate(undefined, {
        onSuccess: () => {
          setSheetOpen(false);
          showToast('Lead deleted');
          if (router.canGoBack()) router.back();
          else router.replace('/leads');
        },
      });
    }
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/leads" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Lead Detail
        </Text>
        {data ? (
          <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(250)}>
            <Pressable
              onPress={() => ask('delete')}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`Delete lead ${data.name}`}
              className="h-9 w-9 items-center justify-center rounded-[18px] border-[0.8px] border-white/90 bg-white/40 active:opacity-70"
              style={{ boxShadow: '0px 3.27px 9.82px rgba(0, 0, 0, 0.03)' }}
            >
              <Trash2 size={18} color="#E74C3C" strokeWidth={1.5} />
            </Pressable>
          </Animated.View>
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
            // Lets the note and link fields' buttons take a tap while the keyboard is up.
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 15,
              paddingTop: 5,
              paddingBottom: clearance,
            }}
          >
            <View className="gap-[15px]">
              <Reveal order={0}>
                <LeadHero lead={data} />
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
                    <LeadInfo lead={data} />
                  ) : (
                    <NotesAndActivity
                      leadId={data.id}
                      onAddFollowUp={() => setFollowUpOpen(true)}
                    />
                  )}
                </Animated.View>
              </Reveal>
            </View>
          </ScrollView>

          <LeadActionsBar
            onFollowUp={() => setFollowUpOpen(true)}
            onConvert={() => ask('convert')}
            converted={data.status === 'campaign'}
          />
          <FollowUpSheet
            leadId={data.id}
            visible={followUpOpen}
            onClose={() => setFollowUpOpen(false)}
          />
          <ConfirmSheet
            visible={sheetOpen}
            onClose={() => setSheetOpen(false)}
            title={confirming === 'convert' ? `Convert ${data.name}?` : 'Delete this lead?'}
            message={
              confirming === 'convert'
                ? `${data.brand ?? data.name} moves to your campaigns, with its notes and activity.`
                : `${data.name}${data.brand ? ` from ${data.brand}` : ''} and its notes will be removed for everyone on the team.`
            }
            icon={CONFIRM_COPY[confirming].icon}
            tone={CONFIRM_COPY[confirming].tone}
            confirmLabel={CONFIRM_COPY[confirming].confirmLabel}
            onConfirm={confirm}
            busy={action.isPending}
            error={action.isError ? CONFIRM_COPY[confirming].error : null}
          />
        </>
      ) : lead.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load this lead.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void lead.refetch()}
              loading={lead.isFetching}
            />
          </View>
        </View>
      ) : (
        <LeadDetailsSkeleton />
      )}
    </View>
  );
}
