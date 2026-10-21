import { router } from 'expo-router';
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
import { CreatorRequestSheet } from '@/components/creators/CreatorRequestSheet';
import { CreatorsHeaderActions } from '@/components/creators/CreatorsHeaderActions';
import { CreatorsToolbar } from '@/components/creators/CreatorsToolbar';
import { FilterSheet } from '@/components/creators/FilterSheet';
import { countFilters, pluralCreators, SCOPE_OPTIONS } from '@/components/creators/labels';
import { ScopeToggle } from '@/components/creators/ScopeToggle';
import { SelectionSummary } from '@/components/creators/SelectionSummary';
import {
  ShareCreatorsButton,
  useShareCreatorsClearance,
} from '@/components/creators/ShareCreatorsButton';
import { SortSheet } from '@/components/creators/SortSheet';
import { useCreatorRequests, useCreators } from '@/hooks/useCreators';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import {
  type Creator,
  type CreatorFilters,
  type CreatorScope,
  type CreatorSort,
  NO_CREATOR_FILTERS,
} from '@/services/creatorsService';

// The agency's creators (or everyone on Yunto), opened from the bottom nav: search, filter and
// sort them, pick some and share them with a brand. "Add Creator" opens the roster to invite
// more. The header holds creator requests and, on Our Creators, a listed-only switch.

const STAGGER_MS = 60;
const MAX_STAGGERED = 6;
// Waits for a pause in typing before searching.
const SEARCH_DEBOUNCE_MS = 350;

export default function CreatorsScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const clearance = useShareCreatorsClearance();

  const [scope, setScope] = useState<CreatorScope>('ours');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<CreatorSort>('newest');
  const [filters, setFilters] = useState<CreatorFilters>(NO_CREATOR_FILTERS);
  const [listedOnly, setListedOnly] = useState(false);
  const [sheet, setSheet] = useState<'sort' | 'filter' | 'requests' | null>(null);
  // Kept whole, so picks survive a new search, filter or scope and can still be shared.
  const [picked, setPicked] = useState<Creator[]>([]);
  const [viewingSelected, setViewingSelected] = useState(false);

  const search = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const creators = useCreators({
    scope,
    query: search,
    sort,
    filters,
    listedOnly: scope === 'ours' && listedOnly,
  });
  const requests = useCreatorRequests();
  const pull = usePullToRefresh(creators);
  const { data } = creators;

  const pickedIds = new Set(picked.map((c) => c.id));
  // Back to the full list once nothing's picked.
  const onlySelected = viewingSelected && picked.length > 0;
  const shown = onlySelected ? picked : data?.creators;
  const scopeLabel = SCOPE_OPTIONS.find((o) => o.key === scope)?.label ?? 'Creators';

  const toggle = (creator: Creator) =>
    setPicked((current) =>
      current.some((c) => c.id === creator.id)
        ? current.filter((c) => c.id !== creator.id)
        : [...current, creator],
    );

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/home" />
        <View className="flex-1 gap-[5px]">
          <Text
            accessibilityRole="header"
            className="font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
          >
            Creators
          </Text>
          <Text className="font-inter-medium text-[10px] leading-[11px] text-black/70">
            {data ? `Total: ${pluralCreators(data.total)}` : ' '}
          </Text>
        </View>
        <CreatorsHeaderActions
          requests={requests.data?.length ?? 0}
          onRequests={() => setSheet('requests')}
          listed={scope === 'ours' ? { value: listedOnly, onChange: setListedOnly } : undefined}
        />
      </View>

      <View className="gap-4 pb-4">
        <CreatorsToolbar
          onAdd={() => router.push('/creators/add')}
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
            onSelectAll={() => setPicked(data?.creators ?? [])}
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
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: clearance }}
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
                {search || listedOnly || countFilters(filters) > 0
                  ? 'No creators match your search or filters.'
                  : 'No creators here yet.'}
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

      <ShareCreatorsButton creators={picked} />

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
      <CreatorRequestSheet visible={sheet === 'requests'} onClose={() => setSheet(null)} />
    </View>
  );
}
