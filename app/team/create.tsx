import { router } from 'expo-router';
import { Trash2, Users, UsersRound } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { ConfirmSheet } from '@/components/common/ConfirmSheet';
import { MenuCard } from '@/components/common/MenuCard';
import { Reveal } from '@/components/common/Reveal';
import { AddMemberSheet } from '@/components/team/AddMemberSheet';
import { pluralMembers, ROLE_LABELS } from '@/components/team/labels';
import { PersonRow } from '@/components/team/PersonRow';
import { PillButton } from '@/components/team/PillButton';
import { TeamRow } from '@/components/team/TeamRow';
import { TeamSheet } from '@/components/team/TeamSheet';
import { useDeleteTeam, useMembers, useTeams } from '@/hooks/useTeam';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import type { Team } from '@/services/teamService';
import { useSessionStore } from '@/store/sessionStore';
import { showToast } from '@/utils/notifications';

// "Create Teams", opened from Team Management: the agency's teams, each renamed or deleted from
// its menu, "Create a team" for a new one, and everyone in the agency with "Add Members" to
// invite someone.

// The team sheet's subject: a new team, or the team being edited.
type Editing = { team?: Team } | null;

export default function CreateTeamsScreen() {
  const insets = useSafeAreaInsets();
  const agency = useSessionStore((s) => s.agency);
  const teams = useTeams();
  const members = useMembers();
  const pull = usePullToRefresh(teams, members);
  const remove = useDeleteTeam();

  const [teamsOpen, setTeamsOpen] = useState(true);
  const [editing, setEditing] = useState<Editing>(null);
  // Kept after the confirm sheet closes so it fades out intact.
  const [deleting, setDeleting] = useState<Team | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  const openMember = (id: string) => router.push({ pathname: '/team/member/[id]', params: { id } });

  const confirmDelete = () => {
    if (!deleting) return;
    remove.mutate(deleting.id, {
      onSuccess: () => {
        showToast(`${deleting.name} deleted`);
        setConfirmOpen(false);
      },
    });
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/team" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Create Teams
        </Text>
      </View>

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
          gap: 12,
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: insets.bottom + 40,
        }}
      >
        <Reveal order={0}>
          <MenuCard
            title="Team"
            icon={UsersRound}
            tone={{ color: '#9333EA', background: '#F3E8FF' }}
            expanded={teamsOpen}
            onPress={() => setTeamsOpen((o) => !o)}
          >
            <View className="gap-4">
              {teams.data ? (
                teams.data.map((team) => (
                  <TeamRow
                    key={team.id}
                    team={team}
                    subtitle={agency?.name ?? pluralMembers(team.members)}
                    onRename={() => setEditing({ team })}
                    onDelete={() => {
                      remove.reset();
                      setDeleting(team);
                      setConfirmOpen(true);
                    }}
                  />
                ))
              ) : teams.isError ? (
                <Text className="py-4 text-center font-inter-medium text-sm leading-5 text-muted">
                  We couldn’t load your teams. Pull down to try again.
                </Text>
              ) : (
                <ActivityIndicator color="#1F1A17" className="py-6" />
              )}
              <Button label="Create a team" onPress={() => setEditing({})} />
            </View>
          </MenuCard>
        </Reveal>

        <Reveal order={1}>
          <View
            className="gap-3 rounded-[28px] border border-white/90 bg-white/55 p-3"
            style={{ boxShadow: '0px 12px 32px -8px rgba(0, 0, 0, 0.04)' }}
          >
            <View className="flex-row items-center gap-4">
              <Text
                accessibilityRole="header"
                className="flex-1 pl-1 font-inter-semibold text-base leading-[19px] text-[#111827]"
              >
                Team Members
              </Text>
              <PillButton label="Add Members" onPress={() => setAdding(true)} />
            </View>
            <View className="flex-row items-center gap-[5px] pl-1">
              <Users size={16} color="#000000" strokeWidth={2} />
              <Text className="font-inter-medium text-[10px] leading-6 text-black/70">
                {members.data ? pluralMembers(members.data.length) : ' '}
              </Text>
            </View>
            {members.data ? (
              members.data.map((member) => (
                <PersonRow
                  key={member.id}
                  member={member}
                  subtitle={ROLE_LABELS[member.role]}
                  onOpen={() => openMember(member.id)}
                />
              ))
            ) : members.isError ? (
              <Text className="py-4 text-center font-inter-medium text-sm leading-5 text-muted">
                We couldn’t load your members. Pull down to try again.
              </Text>
            ) : (
              <ActivityIndicator color="#1F1A17" className="py-6" />
            )}
          </View>
        </Reveal>
      </ScrollView>

      <TeamSheet
        // Keyed so it opens with the team's current values each time.
        key={editing?.team?.id ?? 'new'}
        visible={editing !== null}
        onClose={() => setEditing(null)}
        team={editing?.team}
        onSaved={(team) => {
          setEditing(null);
          showToast(editing?.team ? `${team.name} saved` : `${team.name} created`);
        }}
      />
      <AddMemberSheet
        visible={adding}
        onClose={() => setAdding(false)}
        teamId={null}
        onAdded={(member) => {
          setAdding(false);
          showToast(`Invite sent to ${member.name}`);
        }}
      />
      <ConfirmSheet
        visible={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete this team?"
        message={`${deleting?.name ?? 'The team'} will be removed. Its members stay in the agency.`}
        icon={Trash2}
        tone={{ color: '#E74C3C', background: 'rgba(231, 76, 60, 0.12)' }}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        busy={remove.isPending}
        error={remove.isError ? 'Couldn’t delete this team. Please try again.' : null}
      />
    </View>
  );
}
