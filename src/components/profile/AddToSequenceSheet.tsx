import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { ZoomIn, useReducedMotion } from 'react-native-reanimated';

import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { memberSubtitle } from '@/components/profile/distributionLabels';
import { MemberInitial } from '@/components/profile/MemberInitial';
import { matchesMember, MemberSearch } from '@/components/profile/MemberSearch';
import type { DistributionMember } from '@/services/leadDistributionService';

// "Add to sequence": tick anyone not in the sequence yet; they join the end of the line in the
// order they were ticked. Those already in it are listed last, greyed out. The parent remounts
// it (by key) on each open, so it starts with nothing ticked.

interface AddToSequenceSheetProps {
  visible: boolean;
  onClose: () => void;
  members: DistributionMember[];
  inSequence: string[];
  onAdd: (ids: string[]) => void;
}

export function AddToSequenceSheet({
  visible,
  onClose,
  members,
  inSequence,
  onAdd,
}: AddToSequenceSheetProps) {
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);

  const taken = new Set(inSequence);
  const available = members.filter((m) => !taken.has(m.id));
  const shown = [...available, ...members.filter((m) => taken.has(m.id))].filter((m) =>
    matchesMember(m, query),
  );

  const toggle = (id: string) =>
    setPicked((current) =>
      current.includes(id) ? current.filter((p) => p !== id) : [...current, id],
    );

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Add to sequence">
      <Text className="mt-1 font-inter text-[13px] leading-[18px] text-[#71717A]">
        {available.length > 0
          ? 'New people join the end of the line.'
          : 'Everyone on the team is already in the sequence.'}
      </Text>

      <View className="mt-4">
        <MemberSearch value={query} onChange={setQuery} />
      </View>

      <ScrollView
        className="mt-4 max-h-[350px] grow-0"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 10 }}
      >
        {shown.length > 0 ? (
          shown.map((member) => (
            <MemberOption
              key={member.id}
              member={member}
              inSequence={taken.has(member.id)}
              selected={picked.includes(member.id)}
              onToggle={() => toggle(member.id)}
            />
          ))
        ) : (
          <Text className="py-6 text-center font-inter-medium text-[13px] leading-5 text-[#8F8B83]">
            No one matches “{query.trim()}”.
          </Text>
        )}
      </ScrollView>

      <View className="mt-4">
        <Button
          label={picked.length > 0 ? `Add ${picked.length} to sequence` : 'Add to sequence'}
          onPress={() => onAdd(picked)}
          disabled={picked.length === 0}
          disabledReason={available.length > 0 ? 'Pick who to add' : 'Everyone’s already in'}
        />
      </View>
    </BottomSheet>
  );
}

function MemberOption({
  member,
  inSequence,
  selected,
  onToggle,
}: {
  member: DistributionMember;
  inSequence: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <Pressable
      onPress={onToggle}
      disabled={inSequence}
      accessibilityRole="checkbox"
      accessibilityLabel={`${member.name}, ${memberSubtitle(member)}${inSequence ? ', in sequence' : ''}`}
      accessibilityState={{ checked: selected, disabled: inSequence }}
      className="active:opacity-80"
    >
      <Animated.View
        className={`h-[62px] flex-row items-center justify-between rounded-[18px] border p-2.5 ${
          inSequence ? 'opacity-70' : ''
        }`}
        style={{
          backgroundColor: selected ? '#FAF8F5' : '#FFFFFF',
          borderColor: inSequence ? '#F2EFE8' : selected ? '#DDD7CD' : '#EDEAE3',
          transitionProperty: ['backgroundColor', 'borderColor'],
          transitionDuration: reduceMotion ? 0 : 180,
        }}
      >
        <View className="flex-1 flex-row items-center gap-3">
          <MemberInitial member={member} size={40} />
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className={`text-sm leading-[18px] ${
                inSequence ? 'font-inter-semibold text-[#666666]' : 'font-inter-bold text-[#1A1A1A]'
              }`}
            >
              {member.name}
            </Text>
            <Text
              numberOfLines={1}
              className={`text-xs leading-[18px] ${
                inSequence ? 'font-inter text-[#A29F98]' : 'font-inter-medium text-[#6E6C68]'
              }`}
            >
              {memberSubtitle(member)}
            </Text>
          </View>
        </View>

        {inSequence ? (
          <Text className="pl-2 pr-1.5 font-inter-medium text-xs leading-[18px] text-[#A6A29A]">
            In sequence
          </Text>
        ) : (
          <View className="pl-2 pr-1">
            {selected ? (
              <Animated.View
                entering={reduceMotion ? undefined : ZoomIn.duration(160)}
                className="h-[22px] w-[22px] items-center justify-center rounded-md bg-[#1A1A1A]"
              >
                <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
              </Animated.View>
            ) : (
              <View className="h-[22px] w-[22px] rounded-md border border-[#CCC8BF]" />
            )}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}
