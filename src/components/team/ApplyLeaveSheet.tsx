import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { SectionTitle, SheetField, ToggleChip } from '@/components/creators/InviteFields';
import { LEAVE_TYPE_LABELS, pluralDays } from '@/components/team/labels';
import { useApplyLeave } from '@/hooks/useLeaves';
import {
  applyLeaveRequest,
  LEAVE_REASON_MAX,
  type LeaveType,
  leaveTypeSchema,
  type Leaves,
} from '@/services/leaveService';
import { apiErrorCode, newIdempotencyKey } from '@/utils/api';
import { fromDateKey, mediumDate, todayDate, toDateKey } from '@/utils/dates';
import { showToast } from '@/utils/notifications';
import { sanitizeNote } from '@/utils/sanitize';

// Applying for leave, from "Apply for leave" on the Leaves card: the kind (with what's left of
// it), the first and last day, and an optional reason. It can't ask for more days than are left,
// and the card's balance drops by them once it's applied for.

const FIELD_SHADOW = '0px 4px 12px rgba(0, 0, 0, 0.02), inset 0px 2px 4px 1px rgba(0, 0, 0, 0.02)';
const DAY_MS = 24 * 60 * 60 * 1000;

// Both days count: the 3rd to the 4th is two days.
const daysBetween = (from: string, to: string) =>
  Math.round((fromDateKey(to).getTime() - fromDateKey(from).getTime()) / DAY_MS) + 1;

const ERROR_MESSAGES: Record<string, string> = {
  insufficient_balance: 'You don’t have that many days left. Pick fewer days.',
  overlapping_leave: 'You’ve already applied for leave on some of these days.',
};

interface ApplyLeaveSheetProps {
  visible: boolean;
  onClose: () => void;
  balance: Leaves['balance'];
}

export function ApplyLeaveSheet({ visible, onClose, balance }: ApplyLeaveSheetProps) {
  const apply = useApplyLeave();
  const [type, setType] = useState<LeaveType | null>(null);
  // "YYYY-MM-DD", null until picked.
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const today = todayDate();
  const days = from && to ? daysBetween(from, to) : 0;
  const left = type ? balance[type] : 0;
  const request = applyLeaveRequest.safeParse({ type, from, to, reason: reason.trim() || null });

  // What's stopping Apply, in the order the sheet asks for it.
  const blocker = !type
    ? 'Pick the kind of leave'
    : !from
      ? 'Pick the first day'
      : !to
        ? 'Pick the last day'
        : days > left
          ? `Only ${pluralDays(left)} of ${LEAVE_TYPE_LABELS[type].toLowerCase()} left`
          : !request.success
            ? (request.error.issues[0]?.message ?? 'Check the details')
            : null;

  const clearError = () => {
    if (apply.isError) apply.reset();
  };

  const pick = (which: 'from' | 'to') => {
    const current = which === 'from' ? from : to;
    const minimum = which === 'to' && from ? fromDateKey(from) : today;
    DateTimePickerAndroid.open({
      value: current ? fromDateKey(current) : minimum,
      mode: 'date',
      minimumDate: minimum,
      onValueChange: (_, picked) => {
        const key = toDateKey(picked);
        clearError();
        if (which === 'to') return setTo(key);
        setFrom(key);
        // A last day before the new first day no longer makes sense.
        if (!to || to < key) setTo(key);
      },
    });
  };

  const submit = () => {
    if (blocker !== null || !request.success) return;
    apply.mutate(
      { leave: request.data, idempotencyKey: newIdempotencyKey() },
      {
        onSuccess: () => {
          showToast(`Applied for ${pluralDays(days)} of leave`);
          setType(null);
          setFrom(null);
          setTo(null);
          setReason('');
          onClose();
        },
      },
    );
  };

  const errorCode = apiErrorCode(apply.error);

  return (
    <BottomSheet
      visible={visible}
      onClose={apply.isPending ? () => {} : onClose}
      title="Apply for Leave"
    >
      <View className="mt-5 gap-4">
        <SectionTitle>Leave type</SectionTitle>
        <View className="flex-row flex-wrap gap-2">
          {leaveTypeSchema.options.map((option) => (
            <ToggleChip
              key={option}
              label={`${LEAVE_TYPE_LABELS[option]} · ${balance[option]} left`}
              selected={type === option}
              onPress={() => {
                setType(option);
                clearError();
              }}
            />
          ))}
        </View>

        <View className="flex-row gap-3">
          <DateField label="From" value={from} onPress={() => pick('from')} />
          <DateField label="To" value={to} onPress={() => (from ? pick('to') : pick('from'))} />
        </View>

        {type && days > 0 ? (
          <Text
            accessibilityLiveRegion="polite"
            className={`pl-1 font-inter-medium text-[13px] leading-4 ${
              days > left ? 'text-rose-500' : 'text-[#6B7280]'
            }`}
          >
            {days > left
              ? `${pluralDays(days)} asked, only ${pluralDays(left)} left`
              : `${pluralDays(days)} · ${pluralDays(left - days)} left after this`}
          </Text>
        ) : null}

        <SheetField
          label="Reason (optional)"
          value={reason}
          onChangeText={(next) => {
            setReason(sanitizeNote(next).slice(0, LEAVE_REASON_MAX));
            clearError();
          }}
          placeholder="e.g. Family function"
          multiline
        />
      </View>

      {apply.isError ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-3 pl-1 font-inter-medium text-[13px] leading-4 text-rose-500"
        >
          {(errorCode && ERROR_MESSAGES[errorCode]) ??
            'We couldn’t apply for your leave. Please try again.'}
        </Text>
      ) : null}

      <View className="mt-6 px-[13px]">
        <Button
          label="Apply"
          onPress={submit}
          disabled={blocker !== null}
          disabledReason={blocker}
          loading={apply.isPending}
        />
      </View>
    </BottomSheet>
  );
}

function DateField({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string | null;
  onPress: () => void;
}) {
  return (
    <View className="flex-1 gap-2">
      <Text className="pl-1 font-inter-medium text-sm leading-[17px] text-[#6B7280]">{label}</Text>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={value ? `${label}, ${mediumDate(fromDateKey(value))}` : `Pick ${label}`}
        className="h-[52px] flex-row items-center justify-between rounded-[20px] border border-[#E8E8E8] bg-white/80 px-4 active:opacity-80"
        style={{ boxShadow: FIELD_SHADOW }}
      >
        <Text
          numberOfLines={1}
          className={`flex-1 font-inter-medium text-sm leading-4 ${
            value ? 'text-black' : 'text-[#9CA3AF]'
          }`}
        >
          {value ? mediumDate(fromDateKey(value)) : 'Select'}
        </Text>
        <Calendar size={20} color="#6B7280" strokeWidth={1.5} />
      </Pressable>
    </View>
  );
}
