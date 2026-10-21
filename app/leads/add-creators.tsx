import { router, useLocalSearchParams } from 'expo-router';
import { Users } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { CreatorSearch } from '@/components/common/CreatorSearch';
import { CreatorListCard } from '@/components/creators/CreatorListCard';
import { CreatorListSkeleton } from '@/components/creators/CreatorListSkeleton';
import { CreatorsToolbar } from '@/components/creators/CreatorsToolbar';
import { FilterSheet } from '@/components/creators/FilterSheet';
import { countFilters, pluralCreators, SCOPE_OPTIONS } from '@/components/creators/labels';
import { ScopeToggle } from '@/components/creators/ScopeToggle';
import { SelectionSummary } from '@/components/creators/SelectionSummary';
import { SortSheet } from '@/components/creators/SortSheet';
import { useCreators } from '@/hooks/useCreators';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAddLeadCreators, useLeadCreators } from '@/hooks/useLeadCreators';
import { useLead } from '@/hooks/useLeads';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import {
  type Creator,
  type CreatorFilters,
  type CreatorScope,
  type CreatorSort,
  NO_CREATOR_FILTERS,
} from '@/services/creatorsService';
import { showToast } from '@/utils/notifications';

// Picking creators for a lead, after the Creators list: search, filter and sort them, pick some
// and add them to the lead. Those already on it are left out. Opened from a lead's creators with
// the lead's `id`; goes back there once they're added.

const STAGGER_MS = 60;
const MAX_STAGGERED = 6;
// Waits for a pause in typing before searching.
const SEARCH_DEBOUNCE_MS = 350;
// The footer button and the space around it.
const FOOTER_HEIGHT = 56 + 32;

export default function AddLeadCreatorsScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lead = useLead(id);
  const onLead = useLeadCreators(id);
  const add = useAddLeadCreators(id);

  const [scope, setScope] = useState<CreatorScope>('ours');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<CreatorSort>('newest');
  const [filters, setFilters] = useState<CreatorFilters>(NO_CREATOR_FILTERS);
  const [sheet, setSheet] = useState<'sort' | 'filter' | null>(null);
  // Kept whole, so picks survive a new search, filter or scope.
  const [picked, setPicked] = useState<Creator[]>([]);
  const [viewingSelected, setViewingSelected] = useState(false);

  const search = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const creators = useCreators({ scope, query: search, sort, filters, listedOnly: false });
  const pull = usePullToRefresh(creators, onLead);
  const { data } = creators;

  const leadName = lead.data?.name ?? 'this lead';
  const added = new Set(onLead.data?.map((c) => c.id));
  const available = data?.creators.filter((c) => !added.has(c.id));
  const pickedIds = new Set(picked.map((c) => c.id));
  // Back to the full list once nothing's picked.
  const onlySelected = viewingSelected && picked.length > 0;
  const shown = onlySelected ? picked : available;
  const scopeLabel = SCOPE_OPTIONS.find((o) => o.key === scope)?.label ?? 'Creators';

  const toggle = (creator: Creator) =>
    setPicked((current) =>
      current.some((c) => c.id === creator.id)
        ? current.filter((c) => c.id !== creator.id)
        : [...current, creator],
    );

  const submit = () => {
    if (picked.length === 0 || add.isPending) return;
    add.mutate(
      picked.map((c) => c.id),
      {
        onSuccess: () => {
          showToast(`${pluralCreators(picked.length).toLowerCase()} added to ${leadName}`);
          if (router.canGoBack()) router.back();
          else router.replace({ pathname: '/leads/creators', params: { id } });
        },
        onError: () => showToast('Couldn’t add these creators. Please try again.'),
      },
    );
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref={{ pathname: '/leads/creators', params: { id } }} />
        <View className="flex-1 gap-[5px]">
          <Text
            accessibilityRole="header"
            className="font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
          >
            Add Creators
          </Text>
          <Text
            numberOfLines={1}
            className="font-inter-medium text-[10px] leading-[11px] text-black/70"
          >
            {lead.data ? `To ${lead.data.name}` : ' '}
          </Text>
        </View>
      </View>

      <View className="gap-4 pb-4">
        <CreatorsToolbar
          onFilter={() => setSheet('filter')}
          onSort={() => setSheet('sort')}
          filterCount={countFilters(filters)}
        />
        <View className="gap-4 px-4">
          <CreatorSearch value={query} onChange={setQuery} />
          <ScopeToggle value={scope} onChange={setScope} />
          <SelectionSummary
            count={picked.length}
            viewingSelected={onlySelected}
            onToggleView={() => setViewingSelected(!onlySelected)}
            onSelectAll={() => setPicked(available ?? [])}
          />
        </View>
      </View>

      {shown ? (
        <FlatList
          data={shown}
          keyExtractor={(creator) => creator.id}
          refreshing={pull.refreshing}
          onRefresh={pull.onRefresh}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + FOOTER_HEIGHT,
          }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          ListHeaderComponent={
            <View className="flex-row items-center justify-between pb-3">
              <Text
                accessibilityRole="header"
                className="font-inter-bold text-sm leading-5 tracking-[-0.35px] text-[#141311]"
              >
                {onlySelected ? 'Selected Creators' : scopeLabel}
              </Text>
              {creators.isFetching && !pull.refreshing ? (
                <ActivityIndicator size="small" color="#8C8A84" />
              ) : (
                <Text className="font-inter text-xs leading-4 text-[#8C8A84]">
                  {pluralCreators(shown.length).toLowerCase()}
                </Text>
              )}
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
              <CreatorListCard
                creator={item}
                selected={pickedIds.has(item.id)}
                onToggle={() => toggle(item)}
                onOpen={() => router.push({ pathname: '/creators/[id]', params: { id: item.id } })}
                showManaged={scope === 'all'}
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
                {search || countFilters(filters) > 0
                  ? 'No creators match your search or filters.'
                  : 'Every creator here is already on this lead.'}
              </Text>
            </Animated.View>
          }
        />
      ) : creators.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load your creators.
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
        <View className="px-4">
          <CreatorListSkeleton />
        </View>
      )}

      <View
        className="absolute inset-x-0 bottom-0 px-4"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Button
          label={
            picked.length > 0
              ? `Add ${pluralCreators(picked.length).toLowerCase()} to ${leadName}`
              : `Add creators to ${leadName}`
          }
          onPress={submit}
          loading={add.isPending}
          disabled={picked.length === 0}
          disabledReason="Select creators to add first"
        />
      </View>

      <SortSheet
        visible={sheet === 'sort'}
        onClose={() => setSheet(null)}
        value={sort}
        onChange={setSort}
      />
      <FilterSheet
        visible={sheet === 'filter'}
        onClose={() => setSheet(null)}
        value={filters}
        onApply={setFilters}
        facets={data?.facets}
      />
    </View>
  );
}
