import { Star, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { ZoomIn, useReducedMotion } from 'react-native-reanimated';

import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { firstName, memberSubtitle } from '@/components/profile/distributionLabels';
import { MemberInitial } from '@/components/profile/MemberInitial';
import { matchesMember, MemberSearch } from '@/components/profile/MemberSearch';
import type { DistributionMember } from '@/services/leadDistributionService';

// "Priority recipients": tick who gets priority leads (or campaigns) first. Each tick shows its
// place in line: those already set keep theirs, new ones join the end in the order ticked. Opens
// on whoever's set now; the parent remounts it (by key) on each open.

interface PriorityRecipientSheetProps {
  visible: boolean;
  onClose: () => void;
  members: DistributionMember[];
  current: string[];
  // "leads" / "campaigns".
  noun: string;
  onPick: (ids: string[]) => void;
}

export function PriorityRecipientSheet({
  visible,
  onClose,
  members,
  current,
  noun,
  onPick,
}: PriorityRecipientSheetProps) {
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState(current);

  const shown = members.filter((m) => matchesMember(m, query));
  const only = picked.length === 1 ? members.find((m) => m.id === picked[0]) : undefined;

  const toggle = (id: string) =>
    setPicked((now) => (now.includes(id) ? now.filter((p) => p !== id) : [...now, id]));

  const label =
    picked.length > 1
      ? `Set ${picked.length} priority recipients`
      : only
        ? `Set ${firstName(only.name)} as priority recipient`
        : current.length > 0
          ? 'Remove priority recipients'
          : 'Set priority recipients';

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View className="mt-4 flex-row items-start justify-between gap-3 pt-2">
        <View className="flex-1 flex-row items-start gap-3.5">
          <View className="mt-0.5 h-11 w-11 items-center justify-center rounded-2xl bg-[#FDEBB3]">
            <Star size={20} color="#886208" strokeWidth={1.83} />
          </View>
          <View className="flex-1">
            <Text
              accessibilityRole="header"
              className="font-inter-bold text-[19px] leading-[26px] tracking-[-0.475px] text-[#181715]"
            >
              Priority recipients
            </Text>
            <Text className="pt-0.5 font-inter text-[13px] leading-[18px] text-[#696F79]">
              Priority {noun} go to these people first, before the sequence.
            </Text>
          </View>
        </View>
        <Pressable
          onPress={onClose}
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

      <ScrollView
        className="mt-4 max-h-[290px] grow-0"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 10 }}
      >
        {shown.length > 0 ? (
          shown.map((member) => (
            <RecipientOption
              key={member.id}
              member={member}
              place={picked.indexOf(member.id) + 1}
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
          label={label}
          onPress={() => onPick(picked)}
          disabled={picked.length === 0 && current.length === 0}
          disabledReason={`Pick who gets priority ${noun}`}
        />
      </View>
    </BottomSheet>
  );
}

function RecipientOption({
  member,
  place,
  onToggle,
}: {
  member: DistributionMember;
  // Their place in line once set, 0 when not ticked.
  place: number;
  onToggle: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const selected = place > 0;

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityLabel={`${member.name}, ${memberSubtitle(member)}${selected ? `, priority ${place}` : ''}`}
      accessibilityState={{ checked: selected }}
      className="active:opacity-80"
    >
      <Animated.View
        className="h-[62px] flex-row items-center justify-between rounded-2xl border px-3 py-2.5"
        style={{
          backgroundColor: selected ? '#FFF9ED' : '#FFFFFF',
          borderColor: selected ? '#FBE8B7' : '#EBEBEB',
          transitionProperty: ['backgroundColor', 'borderColor'],
          transitionDuration: reduceMotion ? 0 : 180,
        }}
      >
        <View className="flex-1 flex-row items-center gap-3">
          <MemberInitial member={member} size={40} />
          <View className="flex-1 gap-0.5">
            <Text
              numberOfLines={1}
              className="font-inter-bold text-[14.5px] leading-[18px] text-[#181715]"
            >
              {member.name}
            </Text>
            <Text
              numberOfLines={1}
              className="font-inter-medium text-xs leading-[15px] text-[#6E737B]"
            >
              {memberSubtitle(member)}
            </Text>
          </View>
        </View>

        <View className="pl-2 pr-1">
          {selected ? (
            <Animated.View
              entering={reduceMotion ? undefined : ZoomIn.duration(160)}
              className="h-[22px] w-[22px] items-center justify-center rounded-md bg-[#181715]"
            >
              <Text className="font-inter-bold text-[11px] leading-[14px] text-white">{place}</Text>
            </Animated.View>
          ) : (
            <View className="h-[22px] w-[22px] rounded-md border border-[#CBCBCB]" />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}
