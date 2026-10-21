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
import { CreatorCard } from '@/components/leads/CreatorCard';
import { CreatorSearch } from '@/components/common/CreatorSearch';
import { CreatorsSkeleton } from '@/components/leads/CreatorsSkeleton';
import { creatorTint } from '@/components/leads/labels';
import { LeadCreatorsToolbar } from '@/components/leads/LeadCreatorsToolbar';
import { NoCreatorsCard } from '@/components/leads/NoCreatorsCard';
import { useLeadCreators } from '@/hooks/useLeadCreators';
import { useLead } from '@/hooks/useLeads';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import type { LeadCreator } from '@/services/leadCreatorsService';

// The creators pitched for a lead: add more from the roster, share or download the list, and
// search it; a card opens the creator. Until it has any, an empty card and an "Add creators"
// footer stand in. Opened from "Creators" on a lead with the lead's `id`.

const STAGGER_MS = 60;
const MAX_STAGGERED = 6;
// The "Add creators" footer and the space around it.
const FOOTER_HEIGHT = 56 + 32;

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
  const { id } = useLocalSearchParams<{ id: string }>();
  const lead = useLead(id);
  const creators = useLeadCreators(id);
  const pull = usePullToRefresh(creators);
  const { data } = creators;

  const [query, setQuery] = useState('');
  const shown = data?.filter((c) => matchesQuery(c, query));
  const leadName = lead.data?.name ?? 'Creators';

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
              <LeadCreatorsToolbar leadName={leadName} creators={data} onAdd={addCreators} />
            ) : null}
            <View className="px-4">
              <CreatorSearch value={query} onChange={setQuery} />
            </View>
          </View>

          <Animated.FlatList
            data={shown}
            keyExtractor={(creator) => creator.id}
            refreshing={pull.refreshing}
            onRefresh={pull.onRefresh}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            itemLayoutAnimation={reduceMotion ? undefined : LinearTransition.duration(240)}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: insets.bottom + (data.length === 0 ? FOOTER_HEIGHT : 16),
            }}
            ItemSeparatorComponent={() => <View className="h-4" />}
            ListHeaderComponent={
              data.length > 0 ? (
                <View className="flex-row items-center justify-between pb-4">
                  <Text
                    accessibilityRole="header"
                    className="font-inter-bold text-sm leading-5 tracking-[-0.35px] text-[#141311]"
                  >
                    My Creators
                  </Text>
                  <Text className="font-inter text-xs leading-4 text-[#8C8A84]">
                    {shown?.length ?? 0} {shown?.length === 1 ? 'result' : 'results'}
                  </Text>
                </View>
              ) : null
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
                  onOpen={() =>
                    router.push({ pathname: '/leads/creator', params: { id, creatorId: item.id } })
                  }
                />
              </Animated.View>
            )}
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
                    No creators match your search.
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
          ) : null}
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
