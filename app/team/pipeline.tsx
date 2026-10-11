import { useLocalSearchParams } from 'expo-router';
import { Inbox } from 'lucide-react-native';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { Reveal } from '@/components/common/Reveal';
import { CARD_SHADOW } from '@/components/home/shared';
import { LEAD_CHIPS, pluralMembers, ROLE_LABELS } from '@/components/team/labels';
import { LeadChips } from '@/components/team/LeadChips';
import { MemberRow } from '@/components/team/MemberRow';
import { TeamIcon } from '@/components/team/TeamIcon';
import { TeamLeadCard } from '@/components/team/TeamLeadCard';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useMemberLeads } from '@/hooks/useTeam';

// One member's leads within a team, opened from a member on the team's screen with `team` and
// `member` ids. Sales teams filter them by where they stand; operations (and mixed) teams by
// whether they're running as campaigns.

const STAGGER_MS = 60;
const MAX_STAGGERED = 6;

export default function MemberPipelineScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const params = useLocalSearchParams<{ team: string; member: string }>();
  const pipeline = useMemberLeads(params.team, params.member);
  const pull = usePullToRefresh(pipeline);
  const [selected, setSelected] = useState(0);
  const { data } = pipeline;

  const chips = data ? LEAD_CHIPS[data.team.focus] : [];
  const status = chips[selected]?.status ?? null;
  const counts = chips.map(
    (chip) =>
      data?.leads.filter((l) => chip.status === null || l.status === chip.status).length ?? 0,
  );
  const shown = data?.leads.filter((l) => status === null || l.status === status) ?? [];

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/team/manage" />
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          {data?.member.name ?? 'Team Member'}
        </Text>
      </View>

      {data ? (
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
            gap: 16,
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 48,
          }}
        >
          <Reveal order={0}>
            <View
              className="overflow-hidden rounded-3xl border border-white/80 bg-white/60 pb-4"
              style={{ boxShadow: CARD_SHADOW }}
            >
              <View className="flex-row items-center gap-3 border-b border-[rgba(226,232,240,0.4)] px-5 pb-4 pt-5">
                <TeamIcon focus={data.team.focus} size={48} />
                <View className="flex-1">
                  <Text
                    numberOfLines={1}
                    className="font-inter-semibold text-base leading-6 text-[#111111]"
                  >
                    {data.team.name}
                  </Text>
                  <Text className="font-inter text-xs leading-4 text-slate">
                    {pluralMembers(data.team.members)}
                  </Text>
                </View>
              </View>
              <View className="gap-3 px-4 pt-4">
                <MemberRow
                  member={data.member}
                  subtitle={ROLE_LABELS[data.member.role]}
                  size={48}
                />
              </View>
              <View className="pt-3">
                <LeadChips
                  chips={chips}
                  counts={counts}
                  selected={selected}
                  onSelect={setSelected}
                />
              </View>
            </View>
          </Reveal>

          {shown.length > 0 ? (
            shown.map((lead, i) => (
              <Animated.View
                // Re-keyed per filter so the cards ease back in.
                key={`${selected}-${lead.id}`}
                entering={
                  reduceMotion
                    ? undefined
                    : FadeInDown.delay(Math.min(i, MAX_STAGGERED) * STAGGER_MS).duration(300)
                }
              >
                <TeamLeadCard lead={lead} index={i} />
              </Animated.View>
            ))
          ) : (
            <Animated.View
              entering={reduceMotion ? undefined : FadeIn.duration(250)}
              className="items-center gap-3 py-12"
            >
              <View className="h-14 w-14 items-center justify-center rounded-full bg-white/70">
                <Inbox size={24} color="#9A8EA3" strokeWidth={1.67} />
              </View>
              <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
                Nothing here yet.
              </Text>
            </Animated.View>
          )}
        </ScrollView>
      ) : pipeline.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load their leads.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void pipeline.refetch()}
              loading={pipeline.isFetching}
            />
          </View>
        </View>
      ) : (
        <ListSkeleton label="Loading leads" cardHeight={147} withFilters={false} />
      )}
    </View>
  );
}
