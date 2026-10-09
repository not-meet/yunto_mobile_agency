import { Tag } from 'lucide-react-native';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, LinearTransition, useReducedMotion } from 'react-native-reanimated';

import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { nicheTone } from '@/components/leads/labels';
import { TagChip } from '@/components/leads/TagChip';
import { PLACEHOLDER_COLOR } from '@/utils/constants';
import { splitNiches } from '@/utils/sanitize';

// Custom niches, typed as a comma-separated list: "Food, Films" adds two. What will be added
// shows as chips under the field while typing.

const INPUT_MAX = 300;

interface NicheSheetProps {
  visible: boolean;
  onClose: () => void;
  // Index the first new chip takes in the niche row, so the preview tints match.
  firstIndex: number;
  onAdd: (niches: string[]) => void;
}

export function NicheSheet({ visible, onClose, firstIndex, onAdd }: NicheSheetProps) {
  const reduceMotion = useReducedMotion();
  const [text, setText] = useState('');
  const niches = splitNiches(text);

  const close = () => {
    setText('');
    onClose();
  };

  const submit = () => {
    if (niches.length === 0) return;
    onAdd(niches);
    close();
  };

  return (
    <BottomSheet visible={visible} onClose={close} title="Add Niche">
      <Text className="mt-2 font-inter-medium text-[13px] leading-5 text-[#888888]">
        Separate each niche with a comma, e.g. Food, Films
      </Text>

      <View className="mt-5 flex-row items-center gap-3 rounded-[18px] border border-[#EFEFEF] bg-[#F8F9FA] px-4 py-3.5">
        <Tag size={15} color="#BBBBBB" strokeWidth={1.67} />
        <TextInput
          value={text}
          onChangeText={(next) =>
            setText(next.replace(/[\u0000-\u001F\u007F]/g, '').slice(0, INPUT_MAX))
          }
          onSubmitEditing={submit}
          placeholder="Food, Films"
          placeholderTextColor={PLACEHOLDER_COLOR}
          autoFocus
          autoCapitalize="words"
          returnKeyType="done"
          accessibilityLabel="Niches, separated by commas"
          className="flex-1 py-0 font-inter-medium text-sm leading-[21px] text-[#222222]"
        />
      </View>

      {niches.length > 0 ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(180)}
          layout={reduceMotion ? undefined : LinearTransition.duration(200)}
          className="mt-4 flex-row flex-wrap gap-2"
        >
          {niches.map((niche, i) => (
            <TagChip key={niche} label={niche} tone={nicheTone(firstIndex + i)} size="md" />
          ))}
        </Animated.View>
      ) : null}

      <View className="mt-6">
        <Button
          label={niches.length > 1 ? `Add ${niches.length} Niches` : 'Add Niche'}
          onPress={submit}
          disabled={niches.length === 0}
          disabledReason="Type a niche first"
        />
      </View>
    </BottomSheet>
  );
}
