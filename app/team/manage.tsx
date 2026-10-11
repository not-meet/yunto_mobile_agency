import { router } from 'expo-router';
import { ListTree } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { MenuCard } from '@/components/common/MenuCard';
import { Reveal } from '@/components/common/Reveal';
import { pluralMembers } from '@/components/team/labels';
import { TeamRow } from '@/components/team/TeamRow';
import { TeamSheet } from '@/components/team/TeamSheet';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useTeams } from '@/hooks/useTeam';
import type { Team } from '@/services/teamService';
import { showToast } from '@/utils/notifications';

// "Manage Teams", opened from Team Management: every team with its size and who's in today.
// Tap one to open it, its pencil to rename it, or "Create a team" for a new one (which opens
// once it's made).

// The team sheet's subject: a new team, or the team being renamed.
type Editing = { team?: Team } | null;

export default function ManageTeamsScreen() {
  const insets = useSafeAreaInsets();
  const teams = useTeams();
  const pull = usePullToRefresh(teams);
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState<Editing>(null);

  const openTeam = (id: string) => router.push({ pathname: '/team/[id]', params: { id } });

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/team" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Manage Teams
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
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: insets.bottom + 40,
        }}
      >
        <Reveal order={0}>
          <MenuCard
            title="Manage Teams"
            icon={ListTree}
            tone={{ color: '#2563EB', background: '#DBEAFE' }}
            expanded={open}
            onPress={() => setOpen((o) => !o)}
          >
            <View className="gap-4">
              {teams.data ? (
                teams.data.length > 0 ? (
                  teams.data.map((team) => (
                    <TeamRow
                      key={team.id}
                      team={team}
                      subtitle={pluralMembers(team.members)}
                      onRename={() => setEditing({ team })}
                      onOpen={() => openTeam(team.id)}
                    />
                  ))
                ) : (
                  <Text className="py-4 text-center font-inter-medium text-sm leading-5 text-muted">
                    No teams yet. Create your first one.
                  </Text>
                )
              ) : teams.isError ? (
                <View className="gap-3 py-2">
                  <Text className="text-center font-inter-medium text-sm leading-5 text-muted">
                    We couldn’t load your teams.
                  </Text>
                  <Button
                    label="Try again"
                    variant="secondary"
                    onPress={() => void teams.refetch()}
                    loading={teams.isFetching}
                  />
                </View>
              ) : (
                <ActivityIndicator color="#1F1A17" className="py-6" />
              )}
              <Button label="Create a team" onPress={() => setEditing({})} />
            </View>
          </MenuCard>
        </Reveal>
      </ScrollView>

      <TeamSheet
        // Keyed so it opens with the team's current values each time.
        key={editing?.team?.id ?? 'new'}
        visible={editing !== null}
        onClose={() => setEditing(null)}
        team={editing?.team}
        onSaved={(team) => {
          const created = !editing?.team;
          setEditing(null);
          showToast(created ? `${team.name} created` : `${team.name} saved`);
          if (created) openTeam(team.id);
        }}
      />
    </View>
  );
}
