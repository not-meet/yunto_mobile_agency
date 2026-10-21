import { X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { matchesMember, MemberSearch } from '@/components/profile/MemberSearch';
import { ASSIGN_AS_LABELS, memberTint, pluralCreators } from '@/components/team/labels';
import type { Assignee, CreatorAssignment } from '@/services/teamService';

// Everyone on a team, once each, though they may be on several.
export function assigneesOf(assignment: CreatorAssignment): Assignee[] {
  return [
    ...new Map(
      assignment.teams.flatMap(({ members }) => members).map((m) => [m.id, m] as const),
    ).values(),
  ];
}

export const firstName = (name: string) => name.split(/\s+/)[0] ?? name;

// Picking the teammate who looks after some creators: who to assign the unassigned list to, or
// who to move picked creators to. The caller keys it per opening so the pick starts fresh, and
// closes it once the change succeeds (it stays open while `busy`).

interface AssigneePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  // e.g. "Move 2 creators to...".
  title: string;
  members: Assignee[];
  // The button once someone's picked, e.g. "Assign 2 creators to Neha".
  confirmLabel: (member: Assignee) => string;
  onConfirm: (member: Assignee) => void;
  busy?: boolean;
  // Shown above the button when the change failed.
  error?: string | null;
}

export function AssigneePickerSheet({
  visible,
  onClose,
  title,
  members,
  confirmLabel,
  onConfirm,
  busy = false,
  error = null,
}: AssigneePickerSheetProps) {
  const [query, setQuery] = useState('');
  const [pickedId, setPickedId] = useState<string | null>(null);

  const shown = members.filter((m) => matchesMember(m, query));
  const picked = members.find((m) => m.id === pickedId);
  const close = busy ? () => {} : onClose;

  return (
    <BottomSheet visible={visible} onClose={close}>
      <View className="mt-4 flex-row items-start justify-between gap-3 pt-2">
        <Text
          accessibilityRole="header"
          className="flex-1 font-inter-bold text-[19px] leading-[26px] tracking-[-0.475px] text-[#181715]"
        >
          {title}
        </Text>
        <Pressable
          onPress={close}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="h-9 w-9 items-center justify-center rounded-full bg-[#F8F8F8] active:opacity-70"
        >
          <X size={20} color="#555555" strokeWidth={1.67} />
        </Pressable>
      </View>

      <View className="mt-5">
        <MemberSearch value={query} onChange={setQuery} />
      </View>

      <Text className="mt-4 pb-2 font-inter-bold text-[11px] uppercase leading-4 tracking-[0.55px] text-[#A8A29E]">
        Team members
      </Text>
      <ScrollView
        className="max-h-[294px] grow-0"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 10 }}
      >
        {shown.length > 0 ? (
          shown.map((member) => (
            <MemberOption
              key={member.id}
              member={member}
              selected={member.id === pickedId}
              onPick={() => setPickedId(member.id)}
            />
          ))
        ) : (
          <Text className="py-6 text-center font-inter-medium text-[13px] leading-5 text-[#8F8B83]">
            {query.trim() ? `No one matches “${query.trim()}”.` : 'No one else on the team yet.'}
          </Text>
        )}
      </ScrollView>

      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-3 pl-1 font-inter-medium text-[13px] leading-4 text-rose-500"
        >
          {error}
        </Text>
      ) : null}
      <View className="mt-4">
        <Button
          label={picked ? confirmLabel(picked) : 'Pick a team member'}
          onPress={() => {
            if (picked) onConfirm(picked);
          }}
          disabled={!picked}
          disabledReason="Pick who looks after them"
          loading={busy}
        />
      </View>
    </BottomSheet>
  );
}

function MemberOption({
  member,
  selected,
  onPick,
}: {
  member: Assignee;
  selected: boolean;
  onPick: () => void;
}) {
  const tint = memberTint(member.id);
  const subtitle = `${ASSIGN_AS_LABELS[member.assignAs]} · ${pluralCreators(member.creators)}`;

  return (
    <Pressable
      onPress={onPick}
      accessibilityRole="radio"
      accessibilityLabel={`${member.name}, ${subtitle}`}
      accessibilityState={{ checked: selected }}
      className={`flex-row items-center justify-between gap-3 rounded-2xl border p-3 active:opacity-80 ${
        selected ? 'border-[#D0D8FE] bg-[#F4F2FF]' : 'border-[#E5E7EB] bg-white'
      }`}
    >
      <View className="flex-1 flex-row items-center gap-3">
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: tint.background }}
        >
          <Text className="font-inter-semibold text-base leading-6" style={{ color: tint.text }}>
            {member.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="font-inter-semibold text-[15px] leading-[19px] text-[#1C1917]"
          >
            {member.name}
          </Text>
          <Text numberOfLines={1} className="pt-0.5 font-inter text-xs leading-4 text-[#A8A29E]">
            {subtitle}
          </Text>
        </View>
      </View>
      {selected ? (
        <View className="h-5 w-5 items-center justify-center rounded-full bg-[#5E43D8]">
          <View className="h-2 w-2 rounded-full bg-white" />
        </View>
      ) : (
        <View className="h-5 w-5 rounded-full border border-[#D6D3D1] bg-white" />
      )}
    </Pressable>
  );
}
