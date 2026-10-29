import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Avatar } from '@/components/common/Avatar';
import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { ROLE_LABELS } from '@/components/team/labels';
import { useMembers } from '@/hooks/useTeam';
import { ASSIGNEES_MAX } from '@/services/leadsService';

// Picking who works a lead or runs a campaign, as on the web: tick teammates on or off, in the
// order picked (the first is the primary), then save. The caller keys it per opening so the picks
// start from its current assignees, and closes it once the save succeeds.

interface AssigneesSheetProps {
  visible: boolean;
  onClose: () => void;
  initialIds: string[];
  onSave: (memberIds: string[]) => void;
  busy: boolean;
  error: string | null;
}

export function AssigneesSheet({
  visible,
  onClose,
  initialIds,
  onSave,
  busy,
  error,
}: AssigneesSheetProps) {
  const members = useMembers();
  const [picked, setPicked] = useState(initialIds);
  const close = busy ? () => {} : onClose;
  const unchanged = picked.join() === initialIds.join();

  const toggle = (id: string) =>
    setPicked((current) =>
      current.includes(id)
        ? current.filter((m) => m !== id)
        : current.length < ASSIGNEES_MAX
          ? [...current, id]
          : current,
    );

  return (
    <BottomSheet visible={visible} onClose={close} title="Assignees">
      {members.data ? (
        <ScrollView
          className="max-h-[340px] grow-0"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
        >
          {members.data
            .filter((m) => m.status !== 'invited')
            .map((member) => {
              const index = picked.indexOf(member.id);
              const selected = index >= 0;
              return (
                <Pressable
                  key={member.id}
                  onPress={() => toggle(member.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={`${member.name}${index === 0 ? ', primary' : ''}`}
                  className={`flex-row items-center gap-3 rounded-2xl border px-3 py-2.5 active:opacity-80 ${
                    selected ? 'border-[#312B28] bg-[#F7F4EE]' : 'border-[#F2F2F7] bg-white'
                  }`}
                >
                  <Avatar name={member.name} url={member.avatarUrl} size={32} />
                  <View className="flex-1">
                    <Text
                      numberOfLines={1}
                      className="font-inter-semibold text-sm leading-[17px] text-[#1D1D1F]"
                    >
                      {member.name}
                    </Text>
                    <Text className="font-inter text-xs leading-4 text-[#8A8A8E]">
                      {index === 0 ? 'Primary' : ROLE_LABELS[member.role]}
                    </Text>
                  </View>
                  <View
                    className={`h-6 w-6 items-center justify-center rounded-full ${
                      selected ? 'bg-[#141311]' : 'border border-[rgba(20,19,17,0.15)]'
                    }`}
                  >
                    {selected ? <Check size={12} color="#FAF7F2" strokeWidth={2} /> : null}
                  </View>
                </Pressable>
              );
            })}
        </ScrollView>
      ) : (
        <View className="items-center gap-3 py-8">
          <Text className="text-center font-inter-medium text-sm leading-5 text-muted">
            {members.isError ? 'We couldn’t load your team.' : 'Loading your team…'}
          </Text>
          {members.isError ? (
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void members.refetch()}
              loading={members.isFetching}
            />
          ) : null}
        </View>
      )}

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
          label="Save assignees"
          onPress={() => onSave(picked)}
          disabled={unchanged || !members.data}
          disabledReason={unchanged ? 'Tick or untick someone first' : null}
          loading={busy}
        />
      </View>
    </BottomSheet>
  );
}
