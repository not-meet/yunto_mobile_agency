import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { ActivityTimeline } from '@/components/leads/ActivityTimeline';
import { FollowUpBlock } from '@/components/leads/FollowUpBlock';
import { NotesSheet } from '@/components/leads/NotesSheet';
import { NotesSkeleton } from '@/components/leads/NotesSkeleton';
import { QuickNote } from '@/components/leads/QuickNote';
import { useLeadActivity } from '@/hooks/useLeadActivity';

// The "Notes & Activity" tab of a lead: next follow-up, a quick note field and the activity
// timeline. Follow-ups are scheduled in the screen's sheet (the Follow Up button opens it too).

interface NotesAndActivityProps {
  leadId: string;
  onAddFollowUp: () => void;
}

export function NotesAndActivity({ leadId, onAddFollowUp }: NotesAndActivityProps) {
  const activity = useLeadActivity(leadId);
  const { data } = activity;
  const [notesOpen, setNotesOpen] = useState(false);

  if (!data) {
    return activity.isError ? (
      <View className="items-center gap-4 py-10">
        <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
          We couldn’t load notes and activity.
        </Text>
        <View className="self-stretch">
          <Button
            label="Try again"
            variant="secondary"
            onPress={() => void activity.refetch()}
            loading={activity.isFetching}
          />
        </View>
      </View>
    ) : (
      <NotesSkeleton />
    );
  }

  return (
    <View className="gap-3">
      <FollowUpBlock followUp={data.followUp} onAdd={onAddFollowUp} />
      <QuickNote
        leadId={leadId}
        noteCount={data.notes.length}
        onSeeAll={() => setNotesOpen(true)}
      />
      <ActivityTimeline activity={data.activity} />
      <NotesSheet visible={notesOpen} onClose={() => setNotesOpen(false)} notes={data.notes} />
    </View>
  );
}
