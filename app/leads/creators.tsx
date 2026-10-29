import { router, useLocalSearchParams } from 'expo-router';
import { Users } from 'lucide-react-native';
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
import {
  CreatorActionsBar,
  useCreatorActionsBarClearance,
} from '@/components/leads/CreatorActionsBar';
import { CreatorSearch } from '@/components/common/CreatorSearch';
import { SegmentedFilter } from '@/components/common/SegmentedFilter';
import { ScopeToggle } from '@/components/creators/ScopeToggle';
import { CreatorCard } from '@/components/leads/CreatorCard';
import { CreatorsSkeleton } from '@/components/leads/CreatorsSkeleton';
import {
  CREATOR_STATUS_LABELS,
  creatorTint,
  REACH_TIERS,
  type ReachTier,
  reachTierOf,
} from '@/components/leads/labels';
import { LeadCreatorsToolbar } from '@/components/leads/LeadCreatorsToolbar';
import { NoCreatorsCard } from '@/components/leads/NoCreatorsCard';
import { RemoveCreatorsSheet } from '@/components/leads/RemoveCreatorsSheet';
import {
  useLeadCreators,
  useRemoveLeadCreators,
  useSetLeadCreatorStatus,
} from '@/hooks/useLeadCreators';
import { useLead } from '@/hooks/useLeads';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import type { CreatorScope } from '@/services/creatorsService';
import type { LeadCreator, SetCreatorStatusRequest } from '@/services/leadCreatorsService';
import { showToast } from '@/utils/notifications';

// The creators pitched for a lead, grouped by reach (Mega, Macro, Micro, Nano) as on the web's
// board: our own or every creator on it, one tier or all, and a search. Add more from the roster,
// share or download the list, pick some and shortlist, mark done or remove them from the bar at
// the bottom; a card
// opens the creator's profile, or on a campaign (`from` "campaign") their campaign detail, where
// removing stays in the toolbar. Until it has any, an empty card and an "Add creators"
// footer stand in. Opened from "Creators" on a lead or campaign with the lead's `id`.

const STAGGER_MS = 60;
const MAX_STAGGERED = 6;
// The "Add creators" footer and the space around it.
const FOOTER_HEIGHT = 56 + 32;

const plural = (count: number) => `${count} ${count === 1 ? 'creator' : 'creators'}`;

type TierFilter = 'all' | ReachTier;

const TIER_FILTERS: { key: TierFilter; label: string }[] = [
  { key: 'all', label: 'All Tiers' },
  ...REACH_TIERS.map(({ key, label }) => ({ key, label })),
];

// The list's rows: a heading per tier, then its creators.
type Row =
  | { kind: 'tier'; key: string; heading: string; count: number; first: boolean }
  | { kind: 'creator'; key: string; creator: LeadCreator; index: number }
  | { kind: 'empty'; key: string };

// Every tier that has someone, in order; a tier picked on its own shows even when it's empty.
function toRows(creators: LeadCreator[], tier: TierFilter): Row[] {
  const rows: Row[] = [];
  let index = 0;
  for (const band of REACH_TIERS) {
    if (tier !== 'all' && tier !== band.key) continue;
    const members = creators.filter((c) => reachTierOf(c.followers) === band.key);
    if (members.length === 0 && tier === 'all') continue;
    rows.push({
      kind: 'tier',
      key: `tier-${band.key}`,
      heading: band.heading,
      count: members.length,
      first: rows.length === 0,
    });
    if (members.length === 0) rows.push({ kind: 'empty', key: `empty-${band.key}` });
    for (const creator of members) {
      rows.push({ kind: 'creator', key: creator.id, creator, index: index++ });
    }
  }
  return rows;
}

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
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const onCampaign = from === 'campaign';
  const lead = useLead(id);
  const creators = useLeadCreators(id);
  const remove = useRemoveLeadCreators(id);
  const setStatus = useSetLeadCreatorStatus(id);
  const actionsClearance = useCreatorActionsBarClearance();
  const pull = usePullToRefresh(creators);
  const { data } = creators;

  const [query, setQuery] = useState('');
  // Everyone on the lead to start, so nobody's hidden on first look.
  const [scope, setScope] = useState<CreatorScope>('all');
  const [tier, setTier] = useState<TierFilter>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [removing, setRemoving] = useState(false);
  // How many the remove sheet is asking about. Kept after it closes so it fades out intact.
  const [removeCount, setRemoveCount] = useState(0);
  const shown = data?.filter(
    (c) => matchesQuery(c, query) && (scope === 'all' || c.managedBy === null),
  );
  const rows = shown ? toRows(shown, tier) : [];
  // Picks that are still on the lead, whatever the search.
  const selected = data?.filter((c) => selectedIds.includes(c.id)) ?? [];
  const leadName = lead.data ? (lead.data.brand ?? lead.data.name) : 'Creators';

  const toggle = (creatorId: string) =>
    setSelectedIds((current) =>
      current.includes(creatorId)
        ? current.filter((c) => c !== creatorId)
        : [...current, creatorId],
    );

  const askRemove = () => {
    if (remove.isPending) return;
    remove.reset();
    setRemoveCount(selected.length);
    setRemoving(true);
  };

  const confirmRemove = () => {
    if (selected.length === 0 || remove.isPending) return;
    remove.mutate(
      selected.map((c) => c.id),
      {
        onSuccess: () => {
          setRemoving(false);
          setSelectedIds([]);
          showToast(`${plural(removeCount)} removed from ${leadName}`);
        },
      },
    );
  };

  const changeStatus = (status: SetCreatorStatusRequest['status']) => {
    if (setStatus.isPending) return;
    if (selected.length === 0) {
      showToast('Select some creators first');
      return;
    }
    const count = selected.length;
    setStatus.mutate(
      { creatorIds: selected.map((c) => c.id), status },
      {
        onSuccess: () => {
          setSelectedIds([]);
          showToast(
            `${count === 1 ? '1 creator is' : `${count} creators are`} now ${CREATOR_STATUS_LABELS[status].toLowerCase()}`,
          );
        },
        onError: () => showToast('Couldn’t update these creators. Please try again.'),
      },
    );
  };

  const askDelete = () =>
    selected.length > 0 ? askRemove() : showToast('Select the creators to remove first');

  const addCreators = () => router.push({ pathname: '/leads/add-creators', params: { id } });

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref={{ pathname: '/leads/[id]', params: { id } }} />
        <View className="flex-1 gap-[5px]">
          <Text
            accessibilityRole="header"
            numberOfLines={1}
            className="font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
          >
            {leadName}
          </Text>
          <Text className="font-inter-medium text-[10px] leading-[11px] text-black/70">
            {data ? (data.length === 0 ? 'No creators' : plural(data.length)) : ' '}
          </Text>
        </View>
      </View>

      {data ? (
        <>
          <View className="gap-5 pb-5">
            {data.length > 0 ? (
              <LeadCreatorsToolbar
                leadName={leadName}
                creators={data}
                onAdd={addCreators}
                selectedCount={selected.length}
                onRemove={onCampaign ? askRemove : undefined}
              />
            ) : null}
            <View className="px-4">
              <CreatorSearch value={query} onChange={setQuery} />
            </View>
          </View>

          <Animated.FlatList
            data={rows}
            keyExtractor={(row) => row.key}
            refreshing={pull.refreshing}
            onRefresh={pull.onRefresh}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            itemLayoutAnimation={reduceMotion ? undefined : LinearTransition.duration(240)}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom:
                data.length === 0
                  ? insets.bottom + FOOTER_HEIGHT
                  : onCampaign
                    ? insets.bottom + 16
                    : actionsClearance,
            }}
            ListHeaderComponent={
              data.length > 0 ? (
                <View className="gap-3 pb-5">
                  <ScopeToggle value={scope} onChange={setScope} />
                  <SegmentedFilter options={TIER_FILTERS} selected={tier} onSelect={setTier} />
                </View>
              ) : null
            }
            renderItem={({ item: row }) =>
              row.kind === 'tier' ? (
                <View
                  className={`flex-row items-center justify-between pb-3 ${row.first ? '' : 'pt-6'}`}
                >
                  <Text
                    accessibilityRole="header"
                    numberOfLines={1}
                    className="shrink font-geist-medium text-[17px] leading-[22px] tracking-[-0.4px] text-[#141311]"
                  >
                    {row.heading}
                  </Text>
                  <Text className="pl-3 font-inter text-xs leading-4 text-[#8C8A84]">
                    {plural(row.count)}
                  </Text>
                </View>
              ) : row.kind === 'empty' ? (
                <View className="rounded-2xl border border-dashed border-black/10 px-4 py-5">
                  <Text className="font-inter text-[13px] leading-4 text-[#8C8A84]">
                    No creators in this tier yet.
                  </Text>
                </View>
              ) : (
                <Animated.View
                  className="pb-4"
                  entering={
                    reduceMotion
                      ? undefined
                      : FadeInDown.delay(Math.min(row.index, MAX_STAGGERED) * STAGGER_MS).duration(
                          300,
                        )
                  }
                >
                  <CreatorCard
                    creator={row.creator}
                    tint={creatorTint(row.index)}
                    onOpen={() =>
                      onCampaign
                        ? router.push({
                            pathname: '/leads/creator',
                            params: { id, creatorId: row.creator.id, from: 'campaign' },
                          })
                        : router.push({
                            pathname: '/creators/[id]',
                            params: { id: row.creator.id, leadId: id },
                          })
                    }
                    selected={selectedIds.includes(row.creator.id)}
                    onToggle={() => toggle(row.creator.id)}
                  />
                </Animated.View>
              )
            }
            ListEmptyComponent={
              data.length === 0 ? (
                <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(250)}>
                  <NoCreatorsCard />
                </Animated.View>
              ) : (
                <Animated.View
                  entering={reduceMotion ? undefined : FadeIn.duration(250)}
                  className="items-center gap-3 py-16"
                >
                  <View className="h-14 w-14 items-center justify-center rounded-full bg-white/70">
                    <Users size={24} color="#9A8EA3" strokeWidth={1.67} />
                  </View>
                  <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
                    {scope === 'ours' && !query
                      ? 'None of your own creators are on this yet.'
                      : 'No creators match your search.'}
                  </Text>
                </Animated.View>
              )
            }
          />

          {data.length === 0 ? (
            <View
              className="absolute inset-x-0 bottom-0 px-4"
              style={{ paddingBottom: insets.bottom + 16 }}
            >
              <Button label="Add creators" onPress={addCreators} />
            </View>
          ) : onCampaign ? null : (
            <CreatorActionsBar
              buttonHeight={36}
              actions={[
                {
                  label: 'Mark Shortlisted',
                  background: '#FFECF3',
                  grow: true,
                  onPress: () => changeStatus('shortlisted'),
                  busy: setStatus.isPending && setStatus.variables?.status === 'shortlisted',
                },
                {
                  label: 'Mark Done',
                  background: '#E9F6ED',
                  width: 91,
                  onPress: () => changeStatus('done'),
                  busy: setStatus.isPending && setStatus.variables?.status === 'done',
                },
                { label: 'Delete', background: '#BDBEBD', width: 78, onPress: askDelete },
              ]}
            />
          )}

          <RemoveCreatorsSheet
            visible={removing}
            onClose={() => setRemoving(false)}
            count={removeCount}
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
