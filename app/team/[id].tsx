import { router, useLocalSearchParams } from 'expo-router';
import { UserMinus } from 'lucide-react-native';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { ConfirmSheet } from '@/components/common/ConfirmSheet';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { Reveal } from '@/components/common/Reveal';
import { AddMemberSheet } from '@/components/team/AddMemberSheet';
import { ROLE_LABELS } from '@/components/team/labels';
import { MemberRow } from '@/components/team/MemberRow';
import { PillButton } from '@/components/team/PillButton';
import { TeamOverview } from '@/components/team/TeamOverview';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useRemoveFromTeam, useTeam, useUpdateTeam } from '@/hooks/useTeam';
import type { Member } from '@/services/teamService';
import { showToast } from '@/utils/notifications';

// One team: where its leads stand and whether new ones are handed out to it automatically, then
// its members. Tap a member for their leads in this team; their menu opens their details or
// takes them off the team. Opened from Manage Teams and People with the team's `id`.

type MemberAction = 'details' | 'remove';
const MEMBER_MENU: { value: MemberAction; label: string }[] = [
  { value: 'details', label: 'View details' },
  { value: 'remove', label: 'Remove from team' },
];

export default function TeamDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const team = useTeam(id);
  const pull = usePullToRefresh(team);
  const update = useUpdateTeam(id);
  const remove = useRemoveFromTeam(id);
  const [adding, setAdding] = useState(false);
  // Kept after the confirm sheet closes so it fades out intact.
  const [removing, setRemoving] = useState<Member | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data } = team;

  const act = (member: Member, action: MemberAction) => {
    if (action === 'details') {
      router.push({ pathname: '/team/member/[id]', params: { id: member.id } });
    } else {
      remove.reset();
      setRemoving(member);
      setConfirmOpen(true);
    }
  };

  const confirmRemove = () => {
    if (!removing) return;
    remove.mutate(removing.id, {
      onSuccess: () => {
        showToast(`${removing.name} removed from the team`);
        setConfirmOpen(false);
      },
    });
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/team/manage" />
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          {data?.name ?? 'Team'}
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
            <TeamOverview
              team={data}
              onAutoAssign={(autoAssign) =>
                update.mutate(
                  { autoAssign },
                  { onError: () => showToast('Couldn’t change auto-assign. Please try again.') },
                )
              }
              pendingAutoAssign={update.isPending ? update.variables.autoAssign : undefined}
            />
          </Reveal>

          <Reveal order={1}>
            <View className="gap-4">
              <View className="flex-row items-center justify-between pt-1">
                <Text
                  accessibilityRole="header"
                  className="font-inter-semibold text-base leading-6 text-[#111111]"
                >
                  Members
                </Text>
                <PillButton label="Add Members" onPress={() => setAdding(true)} />
              </View>
              {data.members.length > 0 ? (
                data.members.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    subtitle={ROLE_LABELS[member.role]}
                    onOpen={() =>
                      router.push({
                        pathname: '/team/pipeline',
                        params: { team: data.id, member: member.id },
                      })
                    }
                    menu={{ options: MEMBER_MENU, onSelect: (action) => act(member, action) }}
                  />
                ))
              ) : (
                <Text className="py-8 text-center font-inter-medium text-sm leading-5 text-muted">
                  No one’s on this team yet. Add your first member.
                </Text>
              )}
            </View>
          </Reveal>
        </ScrollView>
      ) : team.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load this team.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void team.refetch()}
              loading={team.isFetching}
            />
          </View>
        </View>
      ) : (
        <ListSkeleton label="Loading team" cardHeight={160} withFilters={false} />
      )}

      <AddMemberSheet
        visible={adding}
        onClose={() => setAdding(false)}
        teamId={id}
        onAdded={(member) => {
          setAdding(false);
          showToast(`Invite sent to ${member.name}`);
        }}
      />
      <ConfirmSheet
        visible={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Remove from team?"
        message={`${removing?.name ?? 'They'} will leave ${data?.name ?? 'this team'}, but stay in the agency.`}
        icon={UserMinus}
        tone={{ color: '#E74C3C', background: 'rgba(231, 76, 60, 0.12)' }}
        confirmLabel="Remove"
        onConfirm={confirmRemove}
        busy={remove.isPending}
        error={remove.isError ? 'Couldn’t remove them. Please try again.' : null}
      />
    </View>
  );
}
