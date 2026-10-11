import { useState } from 'react';
import { Text, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { SectionTitle, SheetField, ToggleChip } from '@/components/creators/InviteFields';
import { FOCUS_OPTIONS } from '@/components/team/labels';
import { useCreateTeam, useUpdateTeam } from '@/hooks/useTeam';
import {
  createTeamRequest,
  type Team,
  type TeamDetails,
  type TeamFocus,
  TEAM_NAME_MAX,
} from '@/services/teamService';
import { newIdempotencyKey } from '@/utils/api';
import { sanitizeLeadText } from '@/utils/sanitize';

// Naming a team and what it works on: a new one from "Create a team", or an existing one from
// its pencil or "Edit team". The caller keys it by team so it opens with that team's values.

interface TeamSheetProps {
  visible: boolean;
  onClose: () => void;
  // Left out, the sheet creates a team.
  team?: Team;
  onSaved: (team: TeamDetails) => void;
}

export function TeamSheet({ visible, onClose, team, onSaved }: TeamSheetProps) {
  const create = useCreateTeam();
  const update = useUpdateTeam(team?.id ?? '');
  const save = team ? update : create;
  const [name, setName] = useState(team?.name ?? '');
  const [focus, setFocus] = useState<TeamFocus | null>(
    team && team.focus !== 'UNKNOWN' ? team.focus : null,
  );
  const request = createTeamRequest.safeParse({ name, focus });

  const clearError = () => {
    if (save.isError) save.reset();
  };

  const submit = () => {
    if (!request.success) return;
    const done = {
      onSuccess: (saved: TeamDetails) => {
        if (!team) {
          setName('');
          setFocus(null);
        }
        onSaved(saved);
      },
    };
    if (team) update.mutate(request.data, done);
    else create.mutate({ team: request.data, idempotencyKey: newIdempotencyKey() }, done);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={team ? 'Edit Team' : 'Create Team'}>
      <View className="mt-5 gap-4">
        <SheetField
          label="Team name"
          value={name}
          onChangeText={(next) => {
            setName(sanitizeLeadText(next, TEAM_NAME_MAX));
            clearError();
          }}
          placeholder="e.g. Operations"
          autoCapitalize="words"
        />
        <SectionTitle>Works on</SectionTitle>
        <View className="flex-row flex-wrap gap-2">
          {FOCUS_OPTIONS.map((option) => (
            <ToggleChip
              key={option.value}
              label={option.label}
              selected={focus === option.value}
              onPress={() => {
                setFocus(option.value);
                clearError();
              }}
            />
          ))}
        </View>
      </View>

      {save.isError ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-3 pl-1 font-inter-medium text-[13px] leading-4 text-rose-500"
        >
          We couldn’t save the team. Please try again.
        </Text>
      ) : null}
      <View className="mt-6 px-[13px]">
        <Button
          label={team ? 'Save Changes' : 'Create a team'}
          onPress={submit}
          disabled={!request.success}
          disabledReason={request.error?.issues[0]?.message ?? null}
          loading={save.isPending}
        />
      </View>
    </BottomSheet>
  );
}
