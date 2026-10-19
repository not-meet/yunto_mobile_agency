import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { SectionTitle, SheetField, ToggleChip } from '@/components/creators/InviteFields';
import { CONTENT_TYPE_LABELS, CREATOR_PLATFORM_STYLES } from '@/components/creators/labels';
import { useAddCalendarPost } from '@/hooks/useCreatorCalendar';
import {
  addCalendarPostRequest,
  BRAND_NAME_MAX,
  contentTypeSchema,
  type ContentType,
  POST_TITLE_MAX,
} from '@/services/creatorCalendarService';
import { type CreatorPlatform, creatorPlatformSchema } from '@/services/creatorsService';
import { newIdempotencyKey } from '@/utils/api';
import { fromDateKey, mediumDate, todayDate, toDateKey } from '@/utils/dates';
import { showToast } from '@/utils/notifications';
import { sanitizeLeadText } from '@/utils/sanitize';

// Planning a piece on the creator's calendar, as the web's "Add post to this day": a title, the
// platform and kind, the day (today or later), and the brand when it's a paid collab. Keyed on
// the day it's opened for, so each opening starts a fresh form.

const FIELD_SHADOW = '0px 4px 12px rgba(0, 0, 0, 0.02), inset 0px 2px 4px 1px rgba(0, 0, 0, 0.02)';

interface AddContentSheetProps {
  creatorId: string;
  // "YYYY-MM-DD" to open on, or null when closed.
  date: string | null;
  onClose: () => void;
}

export function AddContentSheet({ creatorId, date, onClose }: AddContentSheetProps) {
  const add = useAddCalendarPost(creatorId);
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<CreatorPlatform | null>(null);
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [day, setDay] = useState<string | null>(date);
  const [brand, setBrand] = useState('');

  const request = addCalendarPostRequest.safeParse({
    title,
    platform,
    contentType,
    date: day,
    brand: brand.trim() || null,
  });

  // What's stopping Add, in the order the sheet asks for it.
  const blocker = !title.trim()
    ? 'Add a title'
    : !platform
      ? 'Pick a platform'
      : !contentType
        ? 'Pick the kind of content'
        : !request.success
          ? (request.error.issues[0]?.message ?? 'Check the details')
          : null;

  const pickDay = () =>
    DateTimePickerAndroid.open({
      value: day ? fromDateKey(day) : todayDate(),
      mode: 'date',
      minimumDate: todayDate(),
      onValueChange: (_, picked) => setDay(toDateKey(picked)),
    });

  const submit = () => {
    if (blocker !== null || !request.success) return;
    add.mutate(
      { post: request.data, idempotencyKey: newIdempotencyKey() },
      {
        onSuccess: () => {
          showToast(`Added to ${mediumDate(fromDateKey(request.data.date))}`);
          onClose();
        },
      },
    );
  };

  return (
    <BottomSheet
      visible={date !== null}
      onClose={add.isPending ? () => {} : onClose}
      title="Add Content"
    >
      <ScrollView
        className="mt-5 shrink grow-0"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 16, paddingBottom: 4 }}
      >
        <SheetField
          label="Title"
          value={title}
          onChangeText={(next) => setTitle(sanitizeLeadText(next, POST_TITLE_MAX))}
          placeholder="e.g. Get ready with me: date night"
        />

        <SectionTitle>Platform</SectionTitle>
        <View className="flex-row flex-wrap gap-2">
          {creatorPlatformSchema.options.map((option) => (
            <ToggleChip
              key={option}
              label={CREATOR_PLATFORM_STYLES[option].label}
              selected={platform === option}
              onPress={() => setPlatform(option)}
            />
          ))}
        </View>

        <SectionTitle>Content type</SectionTitle>
        <View className="flex-row flex-wrap gap-2">
          {contentTypeSchema.options.map((option) => (
            <ToggleChip
              key={option}
              label={CONTENT_TYPE_LABELS[option]}
              selected={contentType === option}
              onPress={() => setContentType(option)}
            />
          ))}
        </View>

        <View className="gap-2">
          <Text className="pl-1 font-inter-medium text-sm leading-[17px] text-[#6B7280]">Date</Text>
          <Pressable
            onPress={pickDay}
            accessibilityRole="button"
            accessibilityLabel={day ? `Date, ${mediumDate(fromDateKey(day))}` : 'Pick a date'}
            className="h-[52px] flex-row items-center justify-between rounded-[20px] border border-[#E8E8E8] bg-white/80 px-4 active:opacity-80"
            style={{ boxShadow: FIELD_SHADOW }}
          >
            <Text
              className={`flex-1 font-inter-medium text-sm leading-4 ${
                day ? 'text-black' : 'text-[#9CA3AF]'
              }`}
            >
              {day ? mediumDate(fromDateKey(day)) : 'Select'}
            </Text>
            <Calendar size={20} color="#6B7280" strokeWidth={1.5} />
          </Pressable>
        </View>

        <SheetField
          label="Brand collab (optional)"
          value={brand}
          onChangeText={(next) => setBrand(sanitizeLeadText(next, BRAND_NAME_MAX))}
          placeholder="e.g. Nykaa"
        />
      </ScrollView>

      {add.isError ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-3 pl-1 font-inter-medium text-[13px] leading-4 text-rose-500"
        >
          We couldn’t add this. Please try again.
        </Text>
      ) : null}

      <View className="mt-6 px-[13px]">
        <Button
          label="Add"
          onPress={submit}
          disabled={blocker !== null}
          disabledReason={blocker}
          loading={add.isPending}
        />
      </View>
    </BottomSheet>
  );
}
