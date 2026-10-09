import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { ReminderForm } from '@/components/reminders/ReminderForm';
import { RemindersHeader } from '@/components/reminders/RemindersHeader';
import { useCreateReminder } from '@/hooks/useReminders';
import { type CreateReminderInput, reminderProblem } from '@/services/reminderService';
import { newIdempotencyKey } from '@/utils/api';
import { todayKey } from '@/utils/dates';
import { showToast } from '@/utils/notifications';

// "Add Reminder" on the reminders screen. Create stays off until there's a title, and says so.

export default function AddReminderScreen() {
  const insets = useSafeAreaInsets();
  const create = useCreateReminder();
  const [draft, setDraft] = useState<CreateReminderInput>(() => ({
    title: '',
    details: '',
    priority: 'medium',
    dueDate: todayKey(),
  }));
  const problem = reminderProblem(draft);

  const submit = () => {
    if (problem) return;
    create.mutate(
      { input: draft, idempotencyKey: newIdempotencyKey() },
      {
        onSuccess: () => {
          showToast('Reminder added');
          router.back();
        },
        onError: () => showToast('Couldn’t add that reminder. Please try again.'),
      },
    );
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <RemindersHeader title="Add Reminder" fallbackHref="/reminders" />

      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 15, paddingTop: 4, paddingBottom: 24 }}
        >
          <ReminderForm draft={draft} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} />
        </ScrollView>

        <View className="px-5 pt-3" style={{ paddingBottom: insets.bottom + 16 }}>
          <Button
            label="Create Reminder"
            onPress={submit}
            disabled={problem !== null}
            disabledReason={problem}
            loading={create.isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
