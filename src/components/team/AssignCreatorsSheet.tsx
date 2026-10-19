import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { SectionTitle, ToggleChip } from '@/components/creators/InviteFields';
import { CreatorPickRow } from '@/components/team/CreatorPickRow';
import { useAssignCreators } from '@/hooks/useTeam';
import {
  type Assignee,
  assignCreatorsRequest,
  type CreatorAssignment,
} from '@/services/teamService';

// Making a teammate the POC of some unassigned creators, from Assign Creators' footer or an
// unassigned creator's row. The caller keys it per opening so the picks start fresh.

interface AssignCreatorsSheetProps {
  visible: boolean;
  onClose: () => void;
  assignment: CreatorAssignment;
  // Ticked when it opens, e.g. the creator whose row was tapped.
  initialCreatorId?: string;
  onAssigned: (count: number, member: Assignee) => void;
}

export function AssignCreatorsSheet({
  visible,
  onClose,
  assignment,
  initialCreatorId,
  onAssigned,
}: AssignCreatorsSheetProps) {
  const assign = useAssignCreators();
  const [picked, setPicked] = useState<string[]>(initialCreatorId ? [initialCreatorId] : []);
  const [memberId, setMemberId] = useState<string | null>(null);

  // Everyone on a team, once each, though they may be on several.
  const assignees = [
    ...new Map(
      assignment.teams.flatMap(({ members }) => members).map((m) => [m.id, m] as const),
    ).values(),
  ];
  // Drops picks someone else assigned meanwhile.
  const creatorIds = picked.filter((id) => assignment.unassignedCreators.some((c) => c.id === id));
  const request = assignCreatorsRequest.safeParse({ creatorIds, memberId });

  const toggle = (id: string) => {
    if (assign.isError) assign.reset();
    setPicked((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
  };

  const submit = () => {
    if (!request.success) return;
    const member = assignees.find((m) => m.id === request.data.memberId);
    assign.mutate(request.data, {
      onSuccess: () => {
        if (member) onAssigned(request.data.creatorIds.length, member);
      },
    });
  };

  const count = creatorIds.length;

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Assign Creators">
      <ScrollView
        className="mt-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
      >
        <View className="flex-row items-center justify-between">
          <SectionTitle>Unassigned creators</SectionTitle>
          <Text className="pt-2 font-inter-medium text-xs leading-4 text-slate">
            {count} of {assignment.unassignedCreators.length} picked
          </Text>
        </View>
        {assignment.unassignedCreators.length > 0 ? (
          <View className="gap-2">
            {assignment.unassignedCreators.map((creator) => (
              <CreatorPickRow
                key={creator.id}
                creator={creator}
                selected={creatorIds.includes(creator.id)}
                onPress={() => toggle(creator.id)}
              />
            ))}
          </View>
        ) : (
          <Text className="py-2 text-center font-inter-medium text-sm leading-5 text-muted">
            Every creator has a POC already.
          </Text>
        )}

        <SectionTitle>Assign to</SectionTitle>
        <View className="flex-row flex-wrap gap-2">
          {assignees.map((member) => (
            <ToggleChip
              key={member.id}
              label={`${member.name} · ${member.creators}`}
              selected={memberId === member.id}
              onPress={() => {
                if (assign.isError) assign.reset();
                setMemberId(member.id);
              }}
            />
          ))}
        </View>
      </ScrollView>

      {assign.isError ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-3 pl-1 font-inter-medium text-[13px] leading-4 text-rose-500"
        >
          We couldn’t assign those creators. Please try again.
        </Text>
      ) : null}
      <View className="mt-6 px-[13px]">
        <Button
          label={count > 1 ? `Assign ${count} creators` : 'Assign creator'}
          onPress={submit}
          disabled={!request.success}
          disabledReason={request.error?.issues[0]?.message ?? null}
          loading={assign.isPending}
        />
      </View>
    </BottomSheet>
  );
}
