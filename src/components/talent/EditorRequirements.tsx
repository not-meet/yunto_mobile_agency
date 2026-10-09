import { type LucideIcon, Minus, Plus } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, useReducedMotion } from 'react-native-reanimated';

import { ChipGroup, toggle } from '@/components/talent/BookingChips';
import {
  CONTENT_TYPE_LABELS,
  EDITING_STYLE_LABELS,
  SECTION_SHADOW,
  VIDEO_LENGTH_LABELS,
} from '@/components/talent/labels';
import {
  contentTypeSchema,
  editingStyleSchema,
  type EditRequirements as EditRequirementsValue,
  MAX_VIDEOS,
  videoLengthSchema,
} from '@/services/talentService';

// What an editor is booked to deliver: the content type, how many videos, how long they run and
// the editing style (pick any number).

export type EditDraft = Omit<EditRequirementsValue, 'role'>;

export const DEFAULT_EDIT: EditDraft = {
  contentType: 'reel',
  videoCount: 1,
  videoLength: 'medium',
  editingStyles: ['trendy'],
  footageFiles: [],
  footageLink: '',
  notes: '',
  addOns: [],
};

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <Text className="pt-2.5 font-inter-semibold text-[13px] leading-4 text-[#555555]">
      {children}
    </Text>
  );
}

interface StepButtonProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  disabled: boolean;
}

function StepButton({ icon: Icon, label, onPress, disabled }: StepButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      className={`h-8 w-8 items-center justify-center rounded-full bg-white active:opacity-70 ${
        disabled ? 'opacity-40' : ''
      }`}
      style={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)' }}
    >
      <Icon size={16} color="#1A1A1A" strokeWidth={1.33} />
    </Pressable>
  );
}

// −  2  +. The number rolls up on increase and down on decrease.
function VideoCountStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const reduceMotion = useReducedMotion();
  const [rising, setRising] = useState(true);

  const step = (by: 1 | -1) => {
    const next = value + by;
    if (next < 1 || next > MAX_VIDEOS) return;
    setRising(by > 0);
    onChange(next);
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Number of videos"
      accessibilityValue={{ min: 1, max: MAX_VIDEOS, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
      className="flex-row items-center gap-4 rounded-[20px] border border-white/90 bg-white/60 px-3 py-1.5"
    >
      <StepButton
        icon={Minus}
        label="Fewer videos"
        onPress={() => step(-1)}
        disabled={value <= 1}
      />
      <View className="h-[19px] min-w-4 items-center overflow-hidden">
        <Animated.Text
          key={value}
          entering={reduceMotion ? undefined : (rising ? FadeInUp : FadeInDown).duration(180)}
          className="text-center font-inter-bold text-[15px] leading-[18px] text-[#1A1A1A]"
        >
          {value}
        </Animated.Text>
      </View>
      <StepButton
        icon={Plus}
        label="More videos"
        onPress={() => step(1)}
        disabled={value >= MAX_VIDEOS}
      />
    </View>
  );
}

interface EditorRequirementsProps {
  value: EditDraft;
  onChange: (next: EditDraft) => void;
}

export function EditorRequirements({ value, onChange }: EditorRequirementsProps) {
  const set = <K extends keyof EditDraft>(key: K, next: EditDraft[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <View
      className="gap-2.5 rounded-3xl border border-white/90 bg-white/70 p-5"
      style={{ boxShadow: SECTION_SHADOW }}
    >
      <Text
        accessibilityRole="header"
        className="font-inter-bold text-base leading-[19px] text-[#1A1A1A]"
      >
        Edit Requirements
      </Text>

      <FieldLabel>Content Type</FieldLabel>
      <ChipGroup
        options={contentTypeSchema.options}
        labels={CONTENT_TYPE_LABELS}
        selected={[value.contentType]}
        onPress={(next) => set('contentType', next)}
      />

      <View className="flex-row items-center justify-between">
        <FieldLabel>No. of Videos</FieldLabel>
        <View className="pt-2.5">
          <VideoCountStepper value={value.videoCount} onChange={(n) => set('videoCount', n)} />
        </View>
      </View>

      <FieldLabel>Video Length</FieldLabel>
      <ChipGroup
        options={videoLengthSchema.options}
        labels={VIDEO_LENGTH_LABELS}
        selected={[value.videoLength]}
        onPress={(next) => set('videoLength', next)}
      />

      <FieldLabel>Editing Style</FieldLabel>
      <ChipGroup
        options={editingStyleSchema.options}
        labels={EDITING_STYLE_LABELS}
        selected={value.editingStyles}
        onPress={(style) => set('editingStyles', toggle(value.editingStyles, style))}
      />
    </View>
  );
}
