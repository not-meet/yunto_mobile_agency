import type { ReactNode } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { DayStrip } from '@/components/reminders/DayStrip';
import {
  GLASS_SHADOW,
  GREEN_GRADIENT,
  GREEN_SHADOW,
  monthDay,
  PRIORITIES,
  PRIORITY_STYLES,
} from '@/components/reminders/labels';
import {
  type CreateReminderInput,
  REMINDER_DETAILS_MAX,
  REMINDER_TITLE_MAX,
} from '@/services/reminderService';
import { addDays, todayDate, toDateKey } from '@/utils/dates';
import { PLACEHOLDER_COLOR } from '@/utils/constants';

// The frosted card on Add Reminder: title, details, priority, then a quick day or one from the
// strip. Both day pickers set the same `dueDate`.

const FIELD_SHADOW = 'inset 0px 2px 6px 1px rgba(30, 20, 50, 0.03)';
const OPTION_SHADOW = '0px 4px 12px rgba(0, 0, 0, 0.02)';

const QUICK_DAYS = [
  { label: 'Today', offset: 0 },
  { label: 'Tomorrow', offset: 1 },
  { label: 'Next Week', offset: 7 },
];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="gap-2.5">
      <Text className="pl-1 font-inter-bold text-[15px] leading-[18px] tracking-[-0.2px] text-[#2B2240]">
        {label}
      </Text>
      {children}
    </View>
  );
}

interface ReminderFormProps {
  draft: CreateReminderInput;
  onChange: (patch: Partial<CreateReminderInput>) => void;
}

export function ReminderForm({ draft, onChange }: ReminderFormProps) {
  const today = todayDate();

  return (
    <View
      className="gap-7 overflow-hidden rounded-[32px] border border-white/80 bg-white/55 px-[15px] py-5"
      style={{ boxShadow: GLASS_SHADOW }}
    >
      <Field label="Task Title">
        <TextInput
          value={draft.title}
          onChangeText={(title) => onChange({ title })}
          placeholder="What’s the task?"
          placeholderTextColor={PLACEHOLDER_COLOR}
          maxLength={REMINDER_TITLE_MAX}
          accessibilityLabel="Task title"
          className="h-[54px] rounded-[20px] border border-white/90 bg-white/70 px-5 py-0 font-inter-regular text-base text-[#2B2240]"
          style={{ boxShadow: FIELD_SHADOW }}
        />
      </Field>

      <Field label="Task Details">
        <TextInput
          value={draft.details}
          onChangeText={(details) => onChange({ details })}
          placeholder="Add notes or a description…"
          placeholderTextColor={PLACEHOLDER_COLOR}
          maxLength={REMINDER_DETAILS_MAX}
          multiline
          textAlignVertical="top"
          accessibilityLabel="Task details"
          className="h-[120px] rounded-3xl border border-white/90 bg-white/70 px-5 py-4 font-inter-regular text-base leading-[22px] text-[#2B2240]"
          style={{ boxShadow: FIELD_SHADOW }}
        />
      </Field>

      <Field label="Priority">
        <View accessibilityRole="radiogroup" className="flex-row gap-3">
          {PRIORITIES.map((priority) => {
            const style = PRIORITY_STYLES[priority];
            const active = priority === draft.priority;
            return (
              <Pressable
                key={priority}
                onPress={() => onChange({ priority })}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                className={`h-[47px] flex-1 items-center justify-center rounded-[20px] border active:opacity-70 ${
                  active ? 'border-white' : 'border-white/80 bg-white/60'
                }`}
                style={
                  active
                    ? {
                        experimental_backgroundImage: style.gradient,
                        boxShadow: `${style.shadow}, inset 0px 2px 4px 1px rgba(255, 255, 255, 0.8)`,
                      }
                    : { boxShadow: OPTION_SHADOW }
                }
              >
                <Text
                  className="font-inter-bold text-sm leading-[17px]"
                  style={{ color: active ? style.color : '#6B627A' }}
                >
                  {style.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Field>

      <Field label="Date">
        <View className="flex-row gap-3">
          {QUICK_DAYS.map(({ label, offset }) => {
            const date = addDays(today, offset);
            const key = toDateKey(date);
            const active = key === draft.dueDate;
            return (
              <Pressable
                key={label}
                onPress={() => onChange({ dueDate: key })}
                accessibilityRole="button"
                accessibilityLabel={`${label}, ${monthDay(date)}`}
                accessibilityState={{ selected: active }}
                className={`h-[87px] flex-1 items-center justify-center gap-1 rounded-[20px] border px-2 active:opacity-70 ${
                  active ? 'border-white' : 'border-white/80 bg-white/60'
                }`}
                style={
                  active
                    ? { experimental_backgroundImage: GREEN_GRADIENT, boxShadow: GREEN_SHADOW }
                    : { boxShadow: OPTION_SHADOW }
                }
              >
                <Text
                  className={`text-center font-inter-bold text-sm leading-[17px] ${
                    active ? 'text-[#1F4D33]' : 'text-[#2B2240]'
                  }`}
                >
                  {label}
                </Text>
                <Text
                  className={`font-inter-semibold text-xs leading-[15px] ${
                    active ? 'text-[#1F4D33]' : 'text-[#6B627A]'
                  }`}
                >
                  {monthDay(date)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Field>

      <Field label="Or Select Date">
        <DayStrip selected={draft.dueDate} onSelect={(dueDate) => onChange({ dueDate })} />
      </Field>
    </View>
  );
}
