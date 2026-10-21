import { router, useLocalSearchParams } from 'expo-router';
import { Inbox, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  LinearTransition,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { ConfirmSheet } from '@/components/common/ConfirmSheet';
import { leadMatches, parseLeadFilter } from '@/components/leads/labels';
import { LeadCard } from '@/components/leads/LeadCard';
import { LeadsSkeleton } from '@/components/leads/LeadsSkeleton';
import { NeedsResponseCard } from '@/components/leads/NeedsResponseCard';
import { StatusFilters } from '@/components/leads/StatusFilters';
import { useDeleteLead, useLeads } from '@/hooks/useLeads';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import type { Lead } from '@/services/leadsService';
import { showToast } from '@/utils/notifications';

// Every lead the agency is working, filtered by status. Opened from home's Lead Matrix and "new
// leads" nudge, and from leads notifications, optionally with a `filter` param ("new",
// "needs-response"…). Swiping a card left asks to delete it.

const STAGGER_MS = 60;
const MAX_STAGGERED = 6;

export default function LeadsScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const params = useLocalSearchParams<{ filter?: string }>();
  const filter = parseLeadFilter(params.filter);
  const leads = useLeads();
  const pull = usePullToRefresh(leads);
  const remove = useDeleteLead();
  const { data } = leads;
  // The lead the delete sheet asks about. Kept after it closes so the sheet fades out intact.
  const [deleting, setDeleting] = useState<Lead | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const askDelete = (lead: Lead) => {
    if (remove.isPending) return;
    remove.reset();
    setDeleting(lead);
    setSheetOpen(true);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    remove.mutate(deleting.id, {
      onSuccess: () => {
        setSheetOpen(false);
        showToast('Lead deleted');
      },
    });
  };

  const counts = {
    all: data?.length ?? 0,
    contacted: data?.filter((l) => l.status === 'contacted').length ?? 0,
    new: data?.filter((l) => l.status === 'new').length ?? 0,
    campaign: data?.filter((l) => l.status === 'campaign').length ?? 0,
  };
  const waiting = data?.filter((l) => l.needsResponse).length ?? 0;
  const shown = data?.filter((l) => leadMatches(l, filter));
  const setFilter = (next: string) => router.setParams({ filter: next });

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/home" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Leads
        </Text>
      </View>

      {data ? (
        <>
          <View className="gap-[18px] px-4 pb-4 pt-[10px]">
            <NeedsResponseCard
              count={waiting}
              reviewing={filter === 'needs-response'}
              onToggle={() => setFilter(filter === 'needs-response' ? 'all' : 'needs-response')}
            />
            <StatusFilters selected={filter} counts={counts} onSelect={setFilter} />
          </View>

          <Animated.FlatList
            // Remounted per filter so the cards ease back in.
            key={filter}
            data={shown}
            keyExtractor={(lead) => lead.id}
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
                <LeadCard
                  lead={item}
                  onOpen={() => router.push({ pathname: '/leads/[id]', params: { id: item.id } })}
                  onDelete={() => askDelete(item)}
                />
              </Animated.View>
            )}
            ListEmptyComponent={
              <Animated.View
                entering={reduceMotion ? undefined : FadeIn.duration(250)}
                className="items-center gap-3 py-16"
              >
                <View className="h-14 w-14 items-center justify-center rounded-full bg-white/70">
                  <Inbox size={24} color="#9A8EA3" strokeWidth={1.67} />
                </View>
                <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
                  {filter === 'needs-response'
                    ? 'Every lead has a reply. Nice work.'
                    : 'No leads here yet.'}
                </Text>
              </Animated.View>
            }
          />
        </>
      ) : leads.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load your leads.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void leads.refetch()}
              loading={leads.isFetching}
            />
          </View>
        </View>
      ) : (
        <View className="pt-[10px]">
          <LeadsSkeleton />
        </View>
      )}

      <ConfirmSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Delete this lead?"
        message={
          deleting
            ? `${deleting.name}${deleting.brand ? ` from ${deleting.brand}` : ''} and its notes will be removed for everyone on the team.`
            : ''
        }
        icon={Trash2}
        tone={{ color: '#E74C3C', background: 'rgba(231, 76, 60, 0.12)' }}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        busy={remove.isPending}
        error={remove.isError ? 'Couldn’t delete this lead. Please try again.' : null}
      />
    </View>
  );
}
