import { Pencil, Plus } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated, { LinearTransition, useReducedMotion } from 'react-native-reanimated';

import { CONTENT_STYLES } from '@/components/leads/labels';
import type { Deliverable } from '@/services/leadsService';

// What the brand wants made, on a lead or its campaign: + adds to the scope, and tapping a
// deliverable edits it (its quantity and title, or removes it). On a campaign each one also shows
// how many of its pieces are in, e.g. "1/2".

// A campaign's deliverables count their pieces instead of carrying a quantity.
type DeliverableItem = Omit<Deliverable, 'quantity'> & {
  quantity?: number;
  done?: number;
  total?: number;
};

function DeliverableRow({
  deliverable,
  last,
  onEdit,
}: {
  deliverable: DeliverableItem;
  last: boolean;
  onEdit: () => void;
}) {
  const { done, total } = deliverable;
  const counted = done !== undefined && total !== undefined;
  const { icon: Icon, color, background } = CONTENT_STYLES[deliverable.type];

  return (
    <Pressable
      onPress={onEdit}
      accessibilityRole="button"
      accessibilityLabel={`${deliverable.title}${deliverable.note ? `, ${deliverable.note}` : ''}${
        counted ? `, ${done} of ${total} in` : ''
      }`}
      accessibilityHint="Edits this deliverable"
      className={`flex-row items-center active:opacity-70 ${last ? 'pt-3' : 'border-b border-[#F2F2F7] py-3'}`}
    >
      <View
        className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: background }}
      >
        <Icon size={20} color={color} strokeWidth={1.67} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text
          numberOfLines={1}
          className="font-inter-semibold text-[15px] leading-[18px] text-[#1D1D1F]"
        >
          {deliverable.title}
        </Text>
        {deliverable.note ? (
          <Text numberOfLines={1} className="font-inter text-[13px] leading-4 text-[#8A8A8E]">
            {deliverable.note}
          </Text>
        ) : null}
      </View>
      {counted ? (
        <Text
          className={`pl-3 font-inter text-[15px] leading-[22px] tracking-[1px] ${
            done >= total ? 'text-[#2B9A57]' : 'text-black/70'
          }`}
        >
          {done}/{total}
        </Text>
      ) : null}
      <View className="ml-3 h-7 w-7 items-center justify-center rounded-full bg-[#F4F4F6]">
        <Pencil size={12} color="#1D1D1F" strokeWidth={1.67} />
      </View>
    </Pressable>
  );
}

interface DeliverablesCardProps<T extends DeliverableItem> {
  deliverables: T[];
  onAdd: () => void;
  onEdit: (deliverable: T) => void;
}

export function DeliverablesCard<T extends DeliverableItem>({
  deliverables,
  onAdd,
  onEdit,
}: DeliverablesCardProps<T>) {
  const reduceMotion = useReducedMotion();

  return (
    <Animated.View
      layout={reduceMotion ? undefined : LinearTransition.duration(250)}
      className="gap-4 rounded-[20px] border border-[rgba(232,226,217,0.5)] bg-white px-5 pb-5 pt-6"
    >
      <View className="flex-row items-center justify-between">
        <Text className="font-inter-semibold text-base leading-5 text-[#1D1D1F]">Deliverables</Text>
        <Pressable
          onPress={onAdd}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Add deliverables"
          className="h-8 w-8 items-center justify-center rounded-full bg-[#F4F4F6] active:opacity-70"
        >
          <Plus size={14} color="#1D1D1F" strokeWidth={1.67} />
        </Pressable>
      </View>

      {deliverables.length > 0 ? (
        <View>
          {deliverables.map((deliverable, i) => (
            <DeliverableRow
              key={deliverable.id}
              deliverable={deliverable}
              last={i === deliverables.length - 1}
              onEdit={() => onEdit(deliverable)}
            />
          ))}
        </View>
      ) : (
        <Text className="font-inter text-sm leading-[21px] text-[#6E6E73]">
          No deliverables agreed yet.
        </Text>
      )}
    </Animated.View>
  );
}
