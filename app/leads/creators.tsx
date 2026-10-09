import { router, useLocalSearchParams } from 'expo-router';
import { Trash2, Users } from 'lucide-react-native';
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
import {
  CreatorActionsBar,
  useCreatorActionsBarClearance,
} from '@/components/leads/CreatorActionsBar';
import { CreatorCard } from '@/components/leads/CreatorCard';
import { CreatorFilters } from '@/components/leads/CreatorFilters';
import { CreatorSearch } from '@/components/leads/CreatorSearch';
import { CreatorSelectionBar } from '@/components/leads/CreatorSelectionBar';
import { CreatorsSkeleton } from '@/components/leads/CreatorsSkeleton';
import { type CreatorFilter, creatorMatches, creatorTint } from '@/components/leads/labels';
import {
  useLeadCreators,
  useRemoveLeadCreators,
  useSetLeadCreatorStatus,
} from '@/hooks/useLeadCreators';
import { useLead } from '@/hooks/useLeads';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import type { LeadCreator } from '@/services/leadCreatorsService';
import { showToast } from '@/utils/notifications';

// The creators pitched for a lead: filter and search them, pick some and mark them shortlisted
// or done, or drop them from the lead. Opened from "Creators" on a lead with the lead's `id`.

const STAGGER_MS = 60;
const MAX_STAGGERED = 6;

const plural = (count: number) => `${count} ${count === 1 ? 'creator' : 'creators'}`;

function matchesQuery(creator: LeadCreator, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [creator.name, creator.handle, creator.niche].some((field) =>
    field.toLowerCase().includes(q),
  );
}

export default function LeadCreatorsScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const clearance = useCreatorActionsBarClearance();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lead = useLead(id);
  const creators = useLeadCreators(id);
  const pull = usePullToRefresh(creators);
  const setStatus = useSetLeadCreatorStatus(id);
  const remove = useRemoveLeadCreators(id);
  const { data } = creators;

  const [filter, setFilter] = useState<CreatorFilter>('all');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Who the confirm sheet is about. Kept after it closes so the sheet fades out intact.
  const [removing, setRemoving] = useState<string[]>([]);

  // Only creators still on the lead count, e.g. after a pull-to-refresh.
  const selected = picked.filter((pid) => data?.some((c) => c.id === pid));
  const shown = data?.filter((c) => creatorMatches(c, filter) && matchesQuery(c, query));
  const counts = {
    all: data?.length ?? 0,
    shortlisted: data?.filter((c) => c.status === 'shortlisted').length ?? 0,
    done: data?.filter((c) => c.status === 'done').length ?? 0,
  };
  const busy = setStatus.isPending || remove.isPending;

  const toggle = (creatorId: string) =>
    setPicked((current) =>
      current.includes(creatorId)
        ? current.filter((pid) => pid !== creatorId)
        : [...current, creatorId],
    );

  const mark = (status: 'shortlisted' | 'done') => {
    if (selected.length === 0 || busy) return;
    setStatus.mutate(
      { creatorIds: selected, status },
      {
        onSuccess: () => {
          showToast(
            `${plural(selected.length)} marked ${status === 'done' ? 'done' : 'shortlisted'}`,
          );
          setPicked([]);
        },
        onError: () => showToast('Couldn’t update these creators. Please try again.'),
      },
    );
  };

  const confirmRemove = () => {
    remove.mutate(removing, {
      onSuccess: () => {
        setConfirmOpen(false);
        showToast(`${plural(removing.length)} removed`);
        setPicked([]);
      },
    });
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref={{ pathname: '/leads/[id]', params: { id } }} />
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          {lead.data?.name ?? 'Creators'}
        </Text>
      </View>

      {data ? (
        <>
          <View className="gap-5 pb-5">
            <CreatorFilters selected={filter} counts={counts} onSelect={setFilter} />
            <View className="gap-5 px-4">
              <CreatorSearch value={query} onChange={setQuery} />
              <CreatorSelectionBar
                count={selected.length}
                onSelectAll={() => setPicked(shown?.map((c) => c.id) ?? [])}
                onClear={() => setPicked([])}
              />
            </View>
          </View>

          <Animated.FlatList
            // Remounted per filter so the cards ease back in.
            key={filter}
            data={shown}
            keyExtractor={(creator) => creator.id}
            refreshing={pull.refreshing}
            onRefresh={pull.onRefresh}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            itemLayoutAnimation={reduceMotion ? undefined : LinearTransition.duration(240)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: clearance }}
            ItemSeparatorComponent={() => <View className="h-3" />}
            ListHeaderComponent={
              <View className="flex-row items-center justify-between pb-3">
                <Text className="font-inter-bold text-sm leading-5 tracking-[-0.35px] text-[#141311]">
                  Matched Creators
                </Text>
                <Text className="font-inter text-xs leading-4 text-[#8C8A84]">
                  {plural(shown?.length ?? 0)}
                </Text>
              </View>
            }
            renderItem={({ item, index }) => (
              <Animated.View
                entering={
                  reduceMotion
                    ? undefined
                    : FadeInDown.delay(Math.min(index, MAX_STAGGERED) * STAGGER_MS).duration(300)
                }
              >
                <CreatorCard
                  creator={item}
                  tint={creatorTint(index)}
                  selected={selected.includes(item.id)}
                  onToggle={() => toggle(item.id)}
                  onOpen={() =>
                    router.push({ pathname: '/leads/creator', params: { id, creatorId: item.id } })
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
                  <Users size={24} color="#9A8EA3" strokeWidth={1.67} />
                </View>
                <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
                  {query.trim()
                    ? 'No creators match your search.'
                    : data.length === 0
                      ? 'No creators on this lead yet.'
                      : 'No creators here yet.'}
                </Text>
              </Animated.View>
            }
          />

          <CreatorActionsBar
            buttonHeight={36}
            actions={[
              {
                label: 'Mark Shortlisted',
                background: '#FFECF3',
                grow: true,
                onPress: () => mark('shortlisted'),
                disabled: selected.length === 0,
                busy: setStatus.isPending && setStatus.variables?.status === 'shortlisted',
              },
              {
                label: 'Mark Done',
                background: '#E9F6ED',
                width: 91,
                onPress: () => mark('done'),
                disabled: selected.length === 0,
                busy: setStatus.isPending && setStatus.variables?.status === 'done',
              },
              {
                label: 'Delete',
                background: '#BDBEBD',
                width: 78,
                onPress: () => {
                  if (selected.length === 0 || busy) return;
                  remove.reset();
                  setRemoving(selected);
                  setConfirmOpen(true);
                },
                disabled: selected.length === 0,
              },
            ]}
          />
          <ConfirmSheet
            visible={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            title={`Remove ${plural(removing.length)}?`}
            message="They’ll be dropped from this lead, along with their deliverables and activity."
            icon={Trash2}
            tone={{ color: '#E74C3C', background: 'rgba(231, 76, 60, 0.12)' }}
            confirmLabel="Remove"
            onConfirm={confirmRemove}
            busy={remove.isPending}
            error={remove.isError ? 'Couldn’t remove these creators. Please try again.' : null}
          />
        </>
      ) : creators.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load this lead’s creators.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void creators.refetch()}
              loading={creators.isFetching}
            />
          </View>
        </View>
      ) : (
        <CreatorsSkeleton />
      )}
    </View>
  );
}
