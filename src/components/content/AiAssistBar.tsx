import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { CHIPS } from '@/components/content/labels';
import type { Intent } from '@/components/content/scriptAssist';
import { PLACEHOLDER_COLOR } from '@/utils/constants';

// Under the script: the assistant's proposal waiting to be accepted (nothing changes until it
// is), quick chips, and a box to ask in your own words.

export interface Suggestion {
  text: string;
  note: string;
  intent: Intent | null;
  attempt: number;
  label: string;
}

interface AiAssistBarProps {
  suggestion: Suggestion | null;
  refining: boolean;
  onAsk: (label: string) => void;
  onAccept: () => void;
  onAnother: () => void;
  onReject: () => void;
}

export function AiAssistBar({
  suggestion,
  refining,
  onAsk,
  onAccept,
  onAnother,
  onReject,
}: AiAssistBarProps) {
  const [prompt, setPrompt] = useState('');

  const submit = () => {
    if (!prompt.trim() || refining) return;
    onAsk(prompt.trim());
    setPrompt('');
  };

  return (
    <View className="gap-3 border-t border-[#F1F5F9] pt-4">
      {suggestion || refining ? (
        <View className="gap-2 rounded-2xl border border-[#E9D5FF] bg-[#FAF9FF] p-4">
          <View className="flex-row items-center justify-between gap-2">
            <Text className="font-inter-medium text-[11px] tracking-[0.3px] text-[#5B42F3]">
              ✦ AI SUGGESTION — NOT APPLIED YET
            </Text>
            {suggestion ? (
              <Text numberOfLines={1} className="shrink font-inter text-[11px] text-[#94A3B8]">
                {suggestion.label}
              </Text>
            ) : null}
          </View>
          {refining || !suggestion ? (
            <Text className="py-2 font-inter text-[13px] text-[#6D5BD0]">✦ Working on it…</Text>
          ) : (
            <>
              <ScrollView nestedScrollEnabled className="max-h-44">
                <Text selectable className="font-inter text-[13px] leading-[21px] text-[#334155]">
                  {suggestion.text}
                </Text>
              </ScrollView>
              <View className="flex-row flex-wrap gap-2 pt-1">
                <ActionButton label="Accept as new version" dark onPress={onAccept} />
                {suggestion.intent ? (
                  <ActionButton label="Try another" onPress={onAnother} />
                ) : null}
                <ActionButton label="Reject" onPress={onReject} />
              </View>
            </>
          )}
        </View>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
        keyboardShouldPersistTaps="handled"
      >
        {CHIPS.map((chip) => {
          const active = suggestion?.label === chip;
          return (
            <Pressable
              key={chip}
              onPress={() => onAsk(chip)}
              disabled={refining}
              accessibilityRole="button"
              accessibilityState={{ selected: active, disabled: refining }}
              className={`rounded-full border px-3 py-1.5 active:opacity-70 ${
                active ? 'border-[#C7D2FE] bg-[#E0E7FF]' : 'border-[#EEF0F3] bg-[#F8FAFC]'
              }`}
            >
              <Text
                className={`font-inter-medium text-[11.5px] ${active ? 'text-[#4338CA]' : 'text-[#475569]'}`}
              >
                {chip}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="flex-row items-center gap-2">
        <View className="h-11 flex-1 flex-row items-center rounded-full bg-[#F4F6F9] px-4">
          <Text className="pr-2 text-xs text-[#6366F1]">✦</Text>
          <TextInput
            value={prompt}
            onChangeText={(text) => setPrompt(text.slice(0, 200))}
            onSubmitEditing={submit}
            returnKeyType="send"
            placeholder="Ask AI to draft, tighten, or rewrite…"
            placeholderTextColor={PLACEHOLDER_COLOR}
            accessibilityLabel="Ask AI"
            className="flex-1 p-0 font-inter text-xs text-[#334155]"
          />
        </View>
        <Pressable
          onPress={submit}
          disabled={!prompt.trim() || refining}
          accessibilityRole="button"
          accessibilityLabel="Refine"
          accessibilityState={{ disabled: !prompt.trim() || refining }}
          className={`h-11 justify-center rounded-full bg-[#5B44F2] px-5 active:opacity-80 ${
            !prompt.trim() || refining ? 'opacity-40' : ''
          }`}
        >
          <Text className="font-inter-semibold text-xs text-white">
            {refining ? 'Refining…' : 'Refine'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  dark = false,
}: {
  label: string;
  onPress: () => void;
  dark?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`rounded-full px-4 py-1.5 active:opacity-80 ${
        dark ? 'bg-black' : 'border border-[#E2E8F0] bg-white'
      }`}
    >
      <Text className={`font-inter-medium text-xs ${dark ? 'text-white' : 'text-[#334155]'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
