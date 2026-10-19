import { router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { Reveal } from '@/components/common/Reveal';
import { AssignCreatorsSheet } from '@/components/team/AssignCreatorsSheet';
import { AssignCreatorsSkeleton } from '@/components/team/AssignCreatorsSkeleton';
import { type AssignmentTab, AssignmentTabs } from '@/components/team/AssignmentTabs';
import { CreatorAssignmentCard } from '@/components/team/CreatorAssignmentCard';
import { CreatorPickRow } from '@/components/team/CreatorPickRow';
import { TeamHierarchy } from '@/components/team/TeamHierarchy';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useCreatorAssignment } from '@/hooks/useTeam';
import { showToast } from '@/utils/notifications';

// "Assign Creators", opened from Team Management: how the agency's creators are split between
// the team. "Teams & Roles" shows each team's members by role with how many creators they look
// after (tap one for their profile and creators); "Unassigned" the creators nobody does yet.
// The footer button, or an unassigned creator's row, opens the sheet that hands them out.

// The assign sheet's opening: with a creator already ticked, or none.
type Assigning = { creatorId?: string } | null;

export default function AssignCreatorsScreen() {
  const insets = useSafeAreaInsets();
  const assignment = useCreatorAssignment();
  const pull = usePullToRefresh(assignment);
  const [tab, setTab] = useState<AssignmentTab>('teams');
  const [assigning, setAssigning] = useState<Assigning>(null);
  // Bumped per opening so the sheet's picks start fresh.
  const [sheetKey, setSheetKey] = useState(0);
  const { data } = assignment;

  const openSheet = (creatorId?: string) => {
    setSheetKey((k) => k + 1);
    setAssigning({ creatorId });
  };

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
              <AssignmentTabs value={tab} onChange={setTab} unassigned={data.unassigned} />
            </Reveal>

            {tab === 'teams' ? (
              data.teams.length > 0 ? (
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
              )
            ) : data.unassignedCreators.length > 0 ? (
              <View className="gap-2">
                {data.unassignedCreators.map((creator, i) => (
                  <Reveal key={creator.id} order={i + 2}>
                    <CreatorPickRow
                      creator={creator}
                      action="Assign"
                      onPress={() => openSheet(creator.id)}
                    />
                  </Reveal>
                ))}
              </View>
            ) : (
              <Text className="py-4 text-center font-inter-medium text-sm leading-5 text-muted">
                Every creator has a POC already.
              </Text>
            )}
          </ScrollView>

          <View className="px-9 pt-3" style={{ paddingBottom: insets.bottom + 16 }}>
            <Button
              label="Assign unassigned creators"
              onPress={() => openSheet()}
              disabled={data.unassigned === 0}
              disabledReason="Every creator has a POC already"
            />
          </View>

          <AssignCreatorsSheet
            key={sheetKey}
            visible={assigning !== null}
            onClose={() => setAssigning(null)}
            assignment={data}
            initialCreatorId={assigning?.creatorId}
            onAssigned={(count, member) => {
              setAssigning(null);
              showToast(
                `${count} ${count === 1 ? 'creator' : 'creators'} assigned to ${member.name}`,
              );
            }}
          />
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
