import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Calendar, Clock } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { CardLabel, EditorCard, SelectField, ToggleRow } from '@/components/content/EditorParts';
import { PLATFORM_FORMATS } from '@/components/content/labels';
import { CONTENT_TYPE_LABELS, CREATOR_PLATFORM_STYLES } from '@/components/creators/labels';
import type { AutoPost } from '@/services/contentService';
import type { ContentType } from '@/services/creatorCalendarService';
import { type CreatorPlatform, creatorPlatformSchema } from '@/services/creatorsService';
import { fromDateKey, mediumDate, todayDate, toDateKey } from '@/utils/dates';

// When and where it goes out: the day and time (IST), the platform and its format, and, for
// Instagram with auto-post set up, whether to publish it for the creator.

const PLATFORM_OPTIONS = creatorPlatformSchema.options.map((value) => ({
  value,
  label: CREATOR_PLATFORM_STYLES[value].label,
}));

const AUTOPOST_STATUS = {
  scheduled: 'Queued to post',
  processing: 'Posting to Instagram now',
  published: 'Posted on Instagram',
  failed: 'Couldn’t post',
  UNKNOWN: 'Auto-post set up',
} as const;

// "09:00" → "9:00 am".
function timeText(time: string): string {
  const [h = 0, m = 0] = time.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

interface ScheduleCardProps {
  date: string;
  time: string;
  platform: CreatorPlatform | null;
  contentType: ContentType | null;
  autopost: boolean;
  autoPost: AutoPost;
  // Why auto-post couldn't be set up on the last save.
  instagramNote: string | null;
  editable: boolean;
  onChange: (patch: {
    date?: string;
    time?: string;
    platform?: CreatorPlatform;
    contentType?: ContentType;
    autopost?: boolean;
  }) => void;
}

export function ScheduleCard({
  date,
  time,
  platform,
  contentType,
  autopost,
  autoPost,
  instagramNote,
  editable,
  onChange,
}: ScheduleCardProps) {
  const formats = platform ? PLATFORM_FORMATS[platform] : [];

  const pickDate = () =>
    DateTimePickerAndroid.open({
      value: date ? fromDateKey(date) : todayDate(),
      mode: 'date',
      onValueChange: (_, picked) => onChange({ date: toDateKey(picked) }),
    });

  const pickTime = () => {
    const [h = 9, m = 0] = time.split(':').map(Number);
    const value = new Date();
    value.setHours(h, m, 0, 0);
    DateTimePickerAndroid.open({
      value,
      mode: 'time',
      is24Hour: false,
      onValueChange: (_, picked) =>
        onChange({
          time: `${String(picked.getHours()).padStart(2, '0')}:${String(picked.getMinutes()).padStart(2, '0')}`,
        }),
    });
  };

  const changePlatform = (next: CreatorPlatform) => {
    const allowed = PLATFORM_FORMATS[next];
    onChange({
      platform: next,
      ...(contentType && allowed.includes(contentType) ? {} : { contentType: allowed[0] }),
    });
  };

  const job = autoPost?.job ?? null;
  const locked = job?.status === 'processing' || job?.status === 'published';

  return (
    <EditorCard>
      <CardLabel right={<Text className="font-inter-semibold text-xs text-[#1E293B]">IST</Text>}>
        Schedule
      </CardLabel>

      <View className="flex-row gap-2">
        <PickerBox
          label="Date"
          value={date ? mediumDate(fromDateKey(date)) : 'Pick a date'}
          icon="date"
          onPress={pickDate}
          disabled={!editable}
        />
        <PickerBox
          label="Time"
          value={timeText(time)}
          icon="time"
          onPress={pickTime}
          disabled={!editable}
        />
      </View>

      <View className="flex-row gap-2">
        <SelectField
          label="Platform"
          value={platform}
          options={PLATFORM_OPTIONS}
          onChange={changePlatform}
          disabled={!editable}
        />
        <SelectField
          label="Content type"
          value={contentType}
          options={formats.map((value) => ({ value, label: CONTENT_TYPE_LABELS[value] }))}
          onChange={(next) => onChange({ contentType: next })}
          placeholder={platform ? 'Format…' : 'Pick a platform'}
          disabled={!editable || !platform}
        />
      </View>

      {autoPost && platform === 'instagram' ? (
        <View className="gap-1.5 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] p-3">
          {autoPost.allowed ? (
            <>
              <ToggleRow
                label="Auto-post to Instagram"
                value={autopost}
                onChange={(next) => onChange({ autopost: next })}
                disabled={!editable || locked}
              />
              <Text className="font-inter text-[11px] leading-4 text-[#94A3B8]">
                Publishes to @{autoPost.handle} at the date and time above, with the caption from
                Analyze.
              </Text>
            </>
          ) : (
            <Text className="font-inter text-[11px] leading-4 text-[#64748B]">
              {autoPost.handle
                ? `@${autoPost.handle} hasn’t allowed the agency to post for them.`
                : 'Connect the creator’s Instagram on the web to auto-post.'}
            </Text>
          )}
          {job && job.status !== 'failed' ? (
            <Text className="font-inter text-[11px] leading-4 text-[#64748B]">
              {AUTOPOST_STATUS[job.status]}
            </Text>
          ) : null}
          {(instagramNote ?? (job?.status === 'failed' ? job.error : null)) ? (
            <Text className="font-inter text-[11px] leading-4 text-[#B42318]">
              {instagramNote ?? job?.error}
            </Text>
          ) : null}
        </View>
      ) : null}
    </EditorCard>
  );
}

function PickerBox({
  label,
  value,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  value: string;
  icon: 'date' | 'time';
  onPress: () => void;
  disabled: boolean;
}) {
  const Icon = icon === 'date' ? Calendar : Clock;
  return (
    <View className="flex-1 gap-1">
      <Text className="font-inter text-[11px] leading-4 text-[#94A3B8]">{label}</Text>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${value}`}
        className="h-11 flex-row items-center gap-2 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] px-3 active:opacity-80"
      >
        <Text
          numberOfLines={1}
          className="flex-1 font-inter-semibold text-[13px] leading-4 text-[#1E293B]"
        >
          {value}
        </Text>
        <Icon size={14} color="#94A3B8" strokeWidth={1.75} />
      </Pressable>
    </View>
  );
}
