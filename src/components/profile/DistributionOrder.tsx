import { Equal } from 'lucide-react-native';
import { type GestureResponderHandlers, Pressable, Text, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { AssignAsChip, MemberInitial } from '@/components/profile/MemberInitial';
import { SortableList } from '@/components/profile/SortableList';
import { ROLE_LABELS } from '@/components/team/labels';
import type { DistributionMember } from '@/services/leadDistributionService';

// The people in a sequence, one card per row. With `reorderable` (round by round), rows are
// numbered, the first is marked next in line, and each card's handle drags it to a new place;
// screen readers get Move up / Move down instead. Tapping a card asks to take that person out.

const ROW = 56;
const GAP = 10;

interface DistributionOrderProps {
  members: DistributionMember[];
  reorderable: boolean;
  onChange: (ids: string[]) => void;
  onPressMember: (member: DistributionMember) => void;
}

function moved(ids: string[], from: number, to: number) {
  const next = [...ids];
  const [id] = next.splice(from, 1);
  if (id !== undefined) next.splice(to, 0, id);
  return next;
}

export function DistributionOrder({
  members,
  reorderable,
  onChange,
  onPressMember,
}: DistributionOrderProps) {
  const ids = members.map((m) => m.id);
  return (
    <SortableList
      items={members}
      rowHeight={ROW}
      gap={GAP}
      reorderable={reorderable}
      numbered={reorderable}
      onReorder={onChange}
      renderItem={(member, { index, handle, slot }) => (
        <SequenceCard
          member={member}
          index={index}
          count={members.length}
          reorderable={reorderable}
          handle={handle}
          slot={slot}
          onPress={() => onPressMember(member)}
          onMoveBy={(by) => onChange(moved(ids, index, index + by))}
        />
      )}
    />
  );
}

interface SequenceCardProps {
  member: DistributionMember;
  index: number;
  count: number;
  reorderable: boolean;
  handle: GestureResponderHandlers;
  slot: SharedValue<number>;
  onPress: () => void;
  onMoveBy: (by: -1 | 1) => void;
}

function SequenceCard({
  member,
  index,
  count,
  reorderable,
  handle,
  slot,
  onPress,
  onMoveBy,
}: SequenceCardProps) {
  const next = reorderable && index === 0;
  const position = index + 1;

  // Green for whoever's in the first slot, following the drag rather than the last save.
  const tint = useAnimatedStyle(() => {
    const first = reorderable && slot.value === 0;
    return {
      backgroundColor: withTiming(first ? '#F0F8F3' : '#FFFFFF', { duration: 180 }),
      borderColor: withTiming(first ? '#D0EADB' : '#EBE6DC', { duration: 180 }),
    };
  });

  return (
    <Animated.View
      accessible
      accessibilityLabel={reorderable ? `${member.name}, ${position} of ${count}` : member.name}
      accessibilityHint="Opens the option to remove them"
      accessibilityActions={[
        { name: 'activate' },
        ...(reorderable && position > 1 ? [{ name: 'moveUp', label: 'Move up' }] : []),
        ...(reorderable && position < count ? [{ name: 'moveDown', label: 'Move down' }] : []),
      ]}
      onAccessibilityAction={(event) => {
        const action = event.nativeEvent.actionName;
        if (action === 'activate') onPress();
        else onMoveBy(action === 'moveUp' ? -1 : 1);
      }}
      className="flex-1 flex-row items-center rounded-2xl border"
      style={[{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }, tint]}
    >
      <Pressable
        onPress={onPress}
        accessible={false}
        className="flex-1 flex-row items-center py-2.5 pl-2.5 active:opacity-70"
      >
        <MemberInitial member={member} size={32} />
        <View className="ml-2.5 flex-1">
          <View className="flex-row items-center">
            <Text
              numberOfLines={1}
              className="shrink font-inter-bold text-xs leading-[15px] text-[#1E1B18]"
            >
              {member.name}
            </Text>
            <View className="ml-1.5">
              <AssignAsChip assignAs={member.assignAs} />
            </View>
          </View>
          <Text
            numberOfLines={1}
            className={`pt-0.5 text-[10px] leading-[13px] ${
              next ? 'font-inter-medium text-[#698875]' : 'font-inter text-[#7A756C]'
            }`}
          >
            {ROLE_LABELS[member.role]}
            {next ? ' · next in line' : ''}
          </Text>
        </View>
      </Pressable>
      {reorderable && count > 1 ? (
        <View {...handle} className="h-full w-11 items-center justify-center">
          <Equal size={16} color={next ? '#6F8677' : '#A29C91'} strokeWidth={2} />
        </View>
      ) : (
        <View className="w-2.5" />
      )}
    </Animated.View>
  );
}
