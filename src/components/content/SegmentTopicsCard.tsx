import { X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { CardLabel, EditorCard, Pill } from '@/components/content/EditorParts';
import { suggestTopics } from '@/components/content/scriptMarks';
import { TOPICS_MAX } from '@/services/contentService';
import { PLACEHOLDER_COLOR } from '@/utils/constants';
import { sanitizeTopic } from '@/utils/sanitize';

// Who it's for (one segment) and its hashtags: typed in, or picked from ideas taken from the
// script's words.

interface SegmentTopicsCardProps {
  segments: string[];
  segment: string | null;
  topics: string[];
  body: string;
  editable: boolean;
  onSegment: (segment: string | null) => void;
  onTopics: (topics: string[]) => void;
}

export function SegmentTopicsCard({
  segments,
  segment,
  topics,
  body,
  editable,
  onSegment,
  onTopics,
}: SegmentTopicsCardProps) {
  const [draft, setDraft] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  const ideas = suggesting ? suggestTopics(body, topics) : [];
  const full = topics.length >= TOPICS_MAX;

  const add = (topic: string) => {
    if (topic.length > 1 && !topics.includes(topic) && !full) onTopics([...topics, topic]);
  };

  return (
    <EditorCard>
      <CardLabel>Segment</CardLabel>
      <View className="flex-row flex-wrap gap-1.5">
        {segments.map((s) => (
          <Pill
            key={s}
            label={s}
            selected={segment === s}
            onPress={() => onSegment(segment === s ? null : s)}
            disabled={!editable}
          />
        ))}
      </View>

      <View className="pt-2">
        <CardLabel>Topics</CardLabel>
      </View>
      {topics.length > 0 ? (
        <View className="flex-row flex-wrap gap-1.5">
          {topics.map((topic) => (
            <View
              key={topic}
              className="flex-row items-center gap-1 rounded-full bg-[#F1F5F9] py-1.5 pl-3 pr-2"
            >
              <Text className="font-inter-medium text-xs text-[#475569]">{topic}</Text>
              {editable ? (
                <Pressable
                  onPress={() => onTopics(topics.filter((t) => t !== topic))}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${topic}`}
                >
                  <X size={11} color="#94A3B8" />
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      ) : !editable ? (
        <Text className="font-inter text-xs text-[#94A3B8]">No topics yet.</Text>
      ) : null}

      {editable ? (
        <>
          <View className="flex-row items-center gap-2">
            <TextInput
              value={draft}
              onChangeText={(text) => setDraft(sanitizeTopic(text))}
              onSubmitEditing={() => {
                add(draft);
                setDraft('');
              }}
              submitBehavior="submit"
              returnKeyType="done"
              editable={!full}
              placeholder={full ? `Up to ${TOPICS_MAX} topics` : '#addtopic'}
              placeholderTextColor={PLACEHOLDER_COLOR}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Add a topic"
              className="h-9 flex-1 rounded-full border border-[#E2E8F0] px-3 py-0 font-inter text-xs text-[#0F172A]"
            />
            <Pressable
              onPress={() => setSuggesting((on) => !on)}
              accessibilityRole="button"
              accessibilityState={{ expanded: suggesting }}
              className="active:opacity-70"
            >
              <Text className="font-inter-medium text-xs text-[#4F46E5]">+ suggest</Text>
            </Pressable>
          </View>
          {suggesting ? (
            <View className="flex-row flex-wrap gap-1.5">
              {ideas.length === 0 ? (
                <Text className="font-inter text-[11px] text-[#94A3B8]">
                  Write a little more and topics appear here.
                </Text>
              ) : null}
              {ideas.map((idea) => (
                <Pressable
                  key={idea}
                  onPress={() => add(idea)}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${idea}`}
                  className="rounded-full border border-dashed border-[#C7D2FE] px-2.5 py-1 active:bg-[#EEF2FF]"
                >
                  <Text className="font-inter text-xs text-[#4F46E5]">+ {idea}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </EditorCard>
  );
}
