import { router } from 'expo-router';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { Reveal } from '@/components/common/Reveal';
import { PeopleHighlights } from '@/components/team/PeopleHighlights';
import { PeopleOverview } from '@/components/team/PeopleOverview';
import { TeamsAndRoles } from '@/components/team/TeamsAndRoles';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { usePeople } from '@/hooks/useTeam';

// "People", opened from Team Management and home's Team Glance: headcount, attendance and sign-ins, birthdays coming
// up, and each team with its first few members. A member opens their details; "View all" opens
// the team.
export default function PeopleScreen() {
  const insets = useSafeAreaInsets();
  const people = usePeople();
  const pull = usePullToRefresh(people);
  const { data } = people;

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/team" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          People
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
            paddingTop: 10,
            paddingBottom: insets.bottom + 48,
          }}
        >
          <Reveal order={0}>
            <PeopleOverview overview={data.overview} />
          </Reveal>
          <Reveal order={1}>
            <PeopleHighlights birthdays={data.birthdays} />
          </Reveal>
          <Reveal order={2}>
            <TeamsAndRoles
              teams={data.teams}
              onOpenTeam={(id) => router.push({ pathname: '/team/[id]', params: { id } })}
              onOpenMember={(id) => router.push({ pathname: '/team/member/[id]', params: { id } })}
            />
          </Reveal>
        </ScrollView>
      ) : people.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load your people.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void people.refetch()}
              loading={people.isFetching}
            />
          </View>
        </View>
      ) : (
        <ListSkeleton label="Loading people" cardHeight={260} withFilters={false} />
      )}
    </View>
  );
}
