import { Equal, Star, Trash2 } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

import { DistributionCard } from '@/components/profile/DistributionCard';
import { AssignAsChip, MemberInitial } from '@/components/profile/MemberInitial';
import { SortableList } from '@/components/profile/SortableList';
import type { DistributionMember } from '@/services/leadDistributionService';

// Who gets priority leads (or campaigns) before the sequence, in order: Add picks them, the
// handle drags them into a new order, the bin takes one off. With no one set, the card offers
// to pick someone.

const ROW = 72;
const GAP = 10;

interface PriorityRecipientCardProps {
  recipients: DistributionMember[];
  // "leads" / "campaigns".
  noun: string;
  onAdd: () => void;
  onReorder: (ids: string[]) => void;
  onRemove: (id: string) => void;
}

const ORDINALS = ['First', '2nd', '3rd'];
const inLine = (index: number) => `${ORDINALS[index] ?? `${index + 1}th`} in line`;

export function PriorityRecipientCard({
  recipients,
  noun,
  onAdd,
  onReorder,
  onRemove,
}: PriorityRecipientCardProps) {
  const reduceMotion = useReducedMotion();
  const count = recipients.length;
  const ids = recipients.map((r) => r.id);

  const moveBy = (from: number, by: -1 | 1) => {
    const next = [...ids];
    const [id] = next.splice(from, 1);
    if (id !== undefined) next.splice(from + by, 0, id);
    onReorder(next);
  };

  return (
    <DistributionCard
      title="Priority recipients"
      subtitle={
        count > 1
          ? `Priority ${noun} go to these people first, in this order. Drag to reorder.`
          : `Priority ${noun} skip the sequence and go to these people first.`
      }
      onAdd={onAdd}
      addLabel="Add priority recipients"
    >
      {count > 0 ? (
        <SortableList
          items={recipients}
          rowHeight={ROW}
          gap={GAP}
          reorderable
          numbered={count > 1}
          onReorder={onReorder}
          renderItem={(recipient, { index, handle }) => {
            const position = index + 1;
            return (
              <View
                accessible
                accessibilityLabel={`${recipient.name}, priority ${position} of ${count}`}
                accessibilityActions={[
                  ...(position > 1 ? [{ name: 'moveUp', label: 'Move up' }] : []),
                  ...(position < count ? [{ name: 'moveDown', label: 'Move down' }] : []),
                  { name: 'remove', label: 'Remove' },
                ]}
                onAccessibilityAction={(event) => {
                  const action = event.nativeEvent.actionName;
                  if (action === 'remove') onRemove(recipient.id);
                  else moveBy(index, action === 'moveUp' ? -1 : 1);
                }}
                className="flex-1 flex-row items-center rounded-2xl border border-[#FBEAC4] bg-[#FFF9ED] py-3 pl-3"
              >
                <MemberInitial member={recipient} size={36} />
                <View className="ml-3 flex-1">
                  <View className="flex-row items-center">
                    <Text
                      numberOfLines={1}
                      className="shrink font-inter-bold text-[13px] leading-[18px] text-[#1E1B18]"
                    >
                      {recipient.name}
                    </Text>
                    <View className="ml-1.5">
                      <AssignAsChip assignAs={recipient.assignAs} />
                    </View>
                  </View>
                  <View className="mt-1.5 flex-row">
                    <View className="flex-row items-center gap-1 rounded-md bg-[#FCECC0] px-1.5 py-0.5">
                      <Star size={9} color="#9A650C" fill="#9A650C" strokeWidth={2} />
                      <Text className="font-inter-bold text-[9px] uppercase leading-[14px] tracking-[0.225px] text-[#9A650C]">
                        {inLine(index)}
                      </Text>
                    </View>
                  </View>
                </View>

                <Pressable
                  onPress={() => onRemove(recipient.id)}
                  hitSlop={10}
                  accessible={false}
                  className="pl-2 pr-1 active:opacity-60"
                >
                  <Trash2 size={16} color="#D94C4C" strokeWidth={1.5} />
                </Pressable>
                {count > 1 ? (
                  <View {...handle} className="h-full w-10 items-center justify-center">
                    <Equal size={16} color="#B89A5E" strokeWidth={2} />
                  </View>
                ) : (
                  <View className="w-3" />
                )}
              </View>
            );
          }}
        />
      ) : (
        <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(220)}>
          <Pressable
            onPress={onAdd}
            accessibilityRole="button"
            accessibilityLabel="Pick priority recipients"
            className="items-center gap-1 rounded-2xl border border-dashed border-[#E3DCCF] px-4 py-4 active:bg-[#FAF8F5]"
          >
            <Text className="font-inter-semibold text-xs leading-4 text-[#1E1B18]">
              No priority recipients
            </Text>
            <Text className="text-center font-inter text-[11px] leading-[15px] text-[#7B766D]">
              Priority {noun} go through the sequence like the rest.
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </DistributionCard>
  );
}
