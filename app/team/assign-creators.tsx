import { router } from 'expo-router';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { Reveal } from '@/components/common/Reveal';
import { AssignCreatorsSkeleton } from '@/components/team/AssignCreatorsSkeleton';
import { AssignmentTabs } from '@/components/team/AssignmentTabs';
import { CreatorAssignmentCard } from '@/components/team/CreatorAssignmentCard';
import { TeamHierarchy } from '@/components/team/TeamHierarchy';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useCreatorAssignment } from '@/hooks/useTeam';

// "Assign Creators", opened from Team Management: how the agency's creators are split between
// the team, then each team's members by role with how many creators they look after (tap one for
// their profile and creators). The "Unassigned" tab and the footer button open the creators
// nobody looks after yet, to hand them out.

const openUnassigned = () => router.push('/team/unassigned');

export default function AssignCreatorsScreen() {
  const insets = useSafeAreaInsets();
  const assignment = useCreatorAssignment();
  const pull = usePullToRefresh(assignment);
  const { data } = assignment;

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/team" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Assign Creators
        </Text>
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
            contentContainerStyle={{
              gap: 16,
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: 40,
            }}
          >
            <Reveal order={0}>
              <CreatorAssignmentCard assignment={data} />
            </Reveal>
            <Reveal order={1}>
              <AssignmentTabs
                value="teams"
                onChange={(next) => {
                  if (next === 'unassigned') openUnassigned();
                }}
                unassigned={data.unassigned}
              />
            </Reveal>

            {data.teams.length > 0 ? (
              <View className="gap-6">
                {data.teams.map((entry, i) => (
                  <Reveal key={entry.team.id} order={i + 2}>
                    <TeamHierarchy
                      entry={entry}
                      onOpenMember={(id) =>
                        router.push({ pathname: '/team/assignee/[id]', params: { id } })
                      }
                    />
                  </Reveal>
                ))}
              </View>
            ) : (
              <Text className="py-4 text-center font-inter-medium text-sm leading-5 text-muted">
                No teams yet. Create one from Team Management.
              </Text>
            )}
          </ScrollView>

          <View className="px-9 pt-3" style={{ paddingBottom: insets.bottom + 16 }}>
            <Button
              label="Assign unassigned creators"
              onPress={openUnassigned}
              disabled={data.unassigned === 0}
              disabledReason="Every creator has a POC already"
            />
          </View>
        </>
      ) : assignment.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load your creators.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void assignment.refetch()}
              loading={assignment.isFetching}
            />
          </View>
        </View>
      ) : (
        <AssignCreatorsSkeleton />
      )}
    </View>
  );
}
