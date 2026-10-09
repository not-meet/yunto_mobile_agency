import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Calendar, Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, useReducedMotion } from 'react-native-reanimated';

import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { useScheduleLeadFollowUp } from '@/hooks/useLeadActivity';
import { type FollowUpUpdate, followUpUpdateSchema } from '@/services/leadActivityService';
import { addDays, fromDateKey, shortDate, todayDate, toDateKey } from '@/utils/dates';
import { showToast } from '@/utils/notifications';

// Bottom sheet for scheduling the next follow-up on a lead, opened from "Add" on the follow-up
// block or the Follow Up button: a day (quick pick or calendar) and where the deal should be by
// then.

const FOLLOW_UP_LABELS: Record<FollowUpUpdate, string> = {
  discussion: 'Discussion',
  negotiations: 'Negotiations',
  signing: 'Signing',
};
const UPDATES = followUpUpdateSchema.options;

const QUICK_PICKS = [
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: 'Next Week', days: 7 },
];

const FIELD_SHADOW = '0px 4px 12px rgba(0, 0, 0, 0.02), inset 0px 2px 4px 1px rgba(0, 0, 0, 0.02)';

// "06/19/2026".
function numericDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

interface FollowUpSheetProps {
  leadId: string;
  visible: boolean;
  onClose: () => void;
}

export function FollowUpSheet({ leadId, visible, onClose }: FollowUpSheetProps) {
  const reduceMotion = useReducedMotion();
  const schedule = useScheduleLeadFollowUp(leadId);
  // "YYYY-MM-DD", null until picked.
  const [date, setDate] = useState<string | null>(null);
  const [update, setUpdate] = useState<FollowUpUpdate | null>(null);
  const [picking, setPicking] = useState(false);

  const today = todayDate();

  const pickDate = (next: string) => {
    setDate(next);
    if (schedule.isError) schedule.reset();
  };

  const openCalendar = () => {
    setPicking(false);
    DateTimePickerAndroid.open({
      value: date ? fromDateKey(date) : today,
      mode: 'date',
      minimumDate: today,
      onValueChange: (_, picked) => pickDate(toDateKey(picked)),
    });
  };

  const submit = () => {
    if (!date || !update) return;
    schedule.mutate(
      { date, update },
      {
        onSuccess: () => {
          showToast(`Follow-up set for ${shortDate(fromDateKey(date))}`);
          setDate(null);
          setUpdate(null);
          onClose();
        },
      },
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Schedule Follow - Up">
      <View className="mt-4 flex-row gap-[5px]">
        {QUICK_PICKS.map(({ label, days }) => {
          const day = addDays(today, days);
          const key = toDateKey(day);
          const selected = key === date;
          return (
            <Pressable
              key={label}
              onPress={() => pickDate(key)}
              accessibilityRole="button"
              accessibilityLabel={`${label}, ${shortDate(day)}`}
              accessibilityState={{ selected }}
              className={`h-[69px] flex-1 items-center justify-center gap-1 rounded-lg border active:opacity-70 ${
                selected ? 'border-[#E4E4E4] bg-[#FAFAFA]' : 'border-transparent'
              }`}
            >
              <Text className="font-inter-medium text-[11.9px] leading-5 text-[#374151]">
                {label}
              </Text>
              <Text className="font-inter text-[10.2px] leading-4 text-[#6B7280]">
                {shortDate(day)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={openCalendar}
        accessibilityRole="button"
        accessibilityLabel={
          date ? `Follow-up date, ${shortDate(fromDateKey(date))}` : 'Pick a date'
        }
        className="mt-[18px] h-[52px] flex-row items-center justify-between rounded-[20px] border border-[#E8E8E8] bg-white/80 px-5 active:opacity-80"
        style={{ boxShadow: FIELD_SHADOW }}
      >
        <Text
          className={`font-inter-medium text-sm leading-4 ${date ? 'text-black' : 'text-[#9CA3AF]'}`}
        >
          {date ? numericDate(fromDateKey(date)) : 'mm/dd/yyyy'}
        </Text>
        <Calendar size={24} color="#6B7280" strokeWidth={1.5} />
      </Pressable>

      <View className="mt-[18px] gap-2">
        <Text className="pl-1 font-inter-medium text-sm leading-[17px] text-[#6B7280]">
          Set an Update
        </Text>
        <Pressable
          onPress={() => setPicking((open) => !open)}
          accessibilityRole="button"
          accessibilityLabel={update ? `Update, ${FOLLOW_UP_LABELS[update]}` : 'Select an update'}
          accessibilityState={{ expanded: picking }}
          className="h-[52px] flex-row items-center rounded-[20px] border border-[#E5E5E5] bg-white/80 px-5 active:opacity-80"
          style={{ boxShadow: FIELD_SHADOW }}
        >
          <Text className="flex-1 font-inter-medium text-[15px] leading-[18px] text-[#111827]">
            {update ? FOLLOW_UP_LABELS[update] : 'Select an Update'}
          </Text>
          <Animated.View
            style={{
              transform: [{ rotate: picking ? '180deg' : '0deg' }],
              ...(reduceMotion
                ? null
                : { transitionProperty: 'transform', transitionDuration: 200 }),
            }}
          >
            <ChevronDown size={20} color="#6B7280" strokeWidth={1.67} />
          </Animated.View>
        </Pressable>
        {picking ? (
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.duration(180)}
            exiting={reduceMotion ? undefined : FadeOut.duration(120)}
            className="overflow-hidden rounded-[20px] border border-[#E5E5E5] bg-white"
          >
            {UPDATES.map((key) => (
              <Pressable
                key={key}
                onPress={() => {
                  setUpdate(key);
                  setPicking(false);
                  if (schedule.isError) schedule.reset();
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: key === update }}
                className="h-12 flex-row items-center px-5 active:bg-[#F8F8F8]"
              >
                <Text className="flex-1 font-inter-medium text-[15px] leading-[18px] text-[#111827]">
                  {FOLLOW_UP_LABELS[key]}
                </Text>
                {key === update ? <Check size={18} color="#312B28" strokeWidth={2} /> : null}
              </Pressable>
            ))}
          </Animated.View>
        ) : null}
      </View>

      {schedule.isError ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-3 pl-1 font-inter-medium text-[13px] leading-4 text-rose-500"
        >
          We couldn’t schedule the follow-up. Please try again.
        </Text>
      ) : null}

      <View className="mt-6 px-[13px]">
        <Button
          label="Add"
          onPress={submit}
          disabled={!date || !update}
          disabledReason={!date ? 'Pick a follow-up date' : 'Select an update'}
          loading={schedule.isPending}
        />
      </View>
    </BottomSheet>
  );
}
