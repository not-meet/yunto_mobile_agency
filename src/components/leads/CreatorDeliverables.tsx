import { Check, Clock } from 'lucide-react-native';
import { Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import type { CreatorDeliverable } from '@/services/leadCreatorsService';
import { dayMonth, fromDateKey } from '@/utils/dates';

// What the creator owes on this lead, with how much is live: a progress bar that fills as
// deliverables go up, and one row each (posted or due date, live or pending).

function DeliverableRow({ deliverable }: { deliverable: CreatorDeliverable }) {
  const { title, done } = deliverable;
  const date = dayMonth(fromDateKey(deliverable.date));

  return (
    <View
      accessible
      accessibilityLabel={`${title}, ${done ? `live, posted ${date}` : `pending, due ${date}`}`}
      className="flex-row items-center gap-3 rounded-[14px] bg-white/70 p-3"
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded-full ${
          done ? 'bg-[#23C16B]' : 'bg-[#E8E5DF]'
        }`}
      >
        {done ? (
          <Check size={10} color="#FAF7F2" strokeWidth={2} />
        ) : (
          <Clock size={10} color="#8C8A84" strokeWidth={2} />
        )}
      </View>
      <View className="flex-1">
        <Text className="font-inter text-xs leading-4 text-[#141311]">{title}</Text>
        <Text className="font-inter text-[9px] leading-[14px] text-[#8C8A84]">
          {done ? `Posted ${date}` : `Due ${date}`}
        </Text>
      </View>
      <View className={`rounded-full px-2 py-0.5 ${done ? 'bg-[#E9F6ED]' : 'bg-[#F7F3EA]'}`}>
        <Text
          className={`font-inter-bold text-[9px] leading-[14px] ${
            done ? 'text-[#23C16B]' : 'text-[#8C8A84]'
          }`}
        >
          {done ? 'Live' : 'Pending'}
        </Text>
      </View>
    </View>
  );
}

export function CreatorDeliverables({ deliverables }: { deliverables: CreatorDeliverable[] }) {
  const reduceMotion = useReducedMotion();
  const done = deliverables.filter((d) => d.done).length;
  const percent = deliverables.length === 0 ? 0 : Math.round((done / deliverables.length) * 100);

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text
          accessibilityRole="header"
          className="font-inter-bold text-sm leading-5 tracking-[-0.35px] text-[#141311]"
        >
          Deliverables
        </Text>
        {deliverables.length > 0 ? (
          <View className="rounded-full bg-[#E9F6ED] px-2.5 py-1">
            <Text className="font-inter-bold text-[10px] leading-[15px] text-[#23C16B]">
              {done} of {deliverables.length} done
            </Text>
          </View>
        ) : null}
      </View>

      {deliverables.length > 0 ? (
        <>
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: percent }}
            className="h-1.5 overflow-hidden rounded-full bg-[#E8E5DF]"
          >
            <Animated.View
              className="h-full rounded-full bg-[#141311]"
              style={{
                width: `${percent}%`,
                ...(reduceMotion ? null : { transitionProperty: 'width', transitionDuration: 400 }),
              }}
            />
          </View>
          <View
            className="gap-2 rounded-[22px] p-4"
            style={{
              experimental_backgroundImage:
                'linear-gradient(135deg, rgba(242, 237, 255, 0.7) 0%, rgba(255, 255, 255, 0.6) 100%)',
              boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.02)',
            }}
          >
            {deliverables.map((deliverable) => (
              <DeliverableRow key={deliverable.id} deliverable={deliverable} />
            ))}
          </View>
        </>
      ) : (
        <Text className="py-2 font-inter-medium text-sm leading-5 text-muted">
          No deliverables agreed yet.
        </Text>
      )}
    </View>
  );
}
