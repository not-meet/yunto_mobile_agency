import { router, useLocalSearchParams } from 'expo-router';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { Reveal } from '@/components/common/Reveal';
import { comingSoon } from '@/components/home/shared';
import { AssignedCreatorsCard } from '@/components/team/AssignedCreatorsCard';
import { MemberHeader } from '@/components/team/MemberHeader';
import { MemberInfo } from '@/components/team/MemberInfo';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useMember, useMemberCreators } from '@/hooks/useTeam';

// A teammate's profile from Assign Creators, opened with their `id`: their team, who they are,
// their details, and the creators they're the POC of.
export default function AssigneeScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const member = useMember(id);
  const creators = useMemberCreators(id);
  const pull = usePullToRefresh(member, creators);
  const { data } = member;

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/team/assign-creators" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Member Profile
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
            <MemberHeader
              member={data}
              onOpenTeam={(teamId) =>
                router.push({ pathname: '/team/[id]', params: { id: teamId } })
              }
              // TODO(team): open attendance once its screen exists.
              onAttendance={() => comingSoon('Attendance & leaves')}
            />
          </Reveal>
          <Reveal order={1}>
            {/* TODO(team): edit these once the API takes changes to them. */}
            <MemberInfo member={data} onAdd={() => comingSoon('Adding information')} />
          </Reveal>
          <Reveal order={2}>
            <AssignedCreatorsCard
              creators={creators.data}
              failed={creators.isError}
              onRetry={() => void creators.refetch()}
              retrying={creators.isFetching}
            />
          </Reveal>
        </ScrollView>
      ) : member.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load this member.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void member.refetch()}
              loading={member.isFetching}
            />
          </View>
        </View>
      ) : (
        <ListSkeleton label="Loading member" cardHeight={260} withFilters={false} />
      )}
    </View>
  );
}
