import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { EditorCard } from '@/components/content/EditorParts';
import { PROMPTS } from '@/components/content/labels';
import { ago } from '@/components/content/scriptMarks';
import type { ContentVersion } from '@/services/contentService';

// The web's right-hand panel: what to ask the assistant, the script's numbers, and its saved
// versions (each can be put back into the editor).

const TABS = ['AI Assistant', 'Insights', 'Versions'] as const;
type Tab = (typeof TABS)[number];

// Reading at 165 words a minute; speaking at about 3 words a second.
const readSecs = (words: number) => Math.round((words / 165) * 60);
const speakSecs = (words: number) => Math.round(words / 3);

interface AssistantTabsProps {
  body: string;
  scriptType: string;
  versions: ContentVersion[];
  editable: boolean;
  refining: boolean;
  onAsk: (prompt: string) => void;
  onRestore: (version: ContentVersion) => void;
}

export function AssistantTabs({
  body,
  scriptType,
  versions,
  editable,
  refining,
  onAsk,
  onRestore,
}: AssistantTabsProps) {
  const [tab, setTab] = useState<Tab>(editable ? 'AI Assistant' : 'Insights');
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  const current = versions[0]?.n ?? 0;
  // "5m ago" moves on once a minute.
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(tick);
  }, []);
  const tabs = editable ? TABS : TABS.filter((t) => t !== 'AI Assistant');

  return (
    <EditorCard>
      <View accessibilityRole="tablist" className="flex-row rounded-full bg-[#F1F5F9] p-1">
        {tabs.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            accessibilityRole="tab"
            accessibilityState={{ selected: t === tab }}
            className={`flex-1 items-center rounded-full py-1.5 ${t === tab ? 'bg-white' : ''}`}
          >
            <Text
              className={`font-inter-semibold text-xs ${t === tab ? 'text-[#0F172A]' : 'text-[#64748B]'}`}
            >
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'AI Assistant' ? (
        !body.trim() ? (
          <Text className="rounded-2xl border border-[#F1F5F9] bg-[#FAFBFC] p-4 font-inter text-[12.5px] leading-[19px] text-[#94A3B8]">
            Start writing — or ask AI — and predictions appear here.
          </Text>
        ) : (
          <View className="gap-2">
            <Text className="font-inter-bold text-[12.5px] text-[#0F172A]">
              What would you like to improve?
            </Text>
            {PROMPTS.map((prompt) => (
              <Pressable
                key={prompt}
                onPress={() => onAsk(prompt)}
                disabled={refining}
                accessibilityRole="button"
                className="rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] px-4 py-3 active:bg-[#F1F5F9]"
              >
                <Text className="font-inter text-xs text-[#334155]">{prompt}</Text>
              </Pressable>
            ))}
            <Text className="font-inter text-[10px] leading-[15px] text-[#94A3B8]">
              Every suggestion arrives as a proposal under the script — accept, try another, or
              reject.
            </Text>
          </View>
        )
      ) : tab === 'Insights' ? (
        <View className="gap-3">
          <View className="gap-2 rounded-2xl border border-[#EDE9FE] bg-[#F5F3FF] p-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-inter-semibold text-xs text-[#5D44F6]">
                Performance prediction
              </Text>
              <Text className="font-inter-medium text-[11px] text-[#94A3B8]">Not scored</Text>
            </View>
            <Text className="font-inter text-xs leading-[18px] text-[#8B83B8]">
              This post has not been scored yet.
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            <Stat label="Word count" value={String(words)} />
            <Stat label="Reading time" value={`${readSecs(words)}s`} />
            <Stat label="Video length" value={`~${speakSecs(words)}s`} />
            <Stat label="Script type" value={scriptType} />
          </View>
        </View>
      ) : (
        <View className="gap-2">
          {versions.length === 0 ? (
            <Text className="font-inter text-xs text-[#94A3B8]">
              No versions yet — your first save becomes v1.
            </Text>
          ) : null}
          {versions.map((v) => (
            <View key={v.n} className="gap-1 rounded-2xl border border-[#F1F5F9] p-3">
              <View className="flex-row items-center justify-between">
                <Text className="font-inter-bold text-xs text-[#0F172A]">
                  v{v.n}
                  {v.n === current ? ' — current' : ''}
                </Text>
                <Text className="font-inter text-[11px] text-[#94A3B8]">{ago(v.at, now)}</Text>
              </View>
              <Text className="font-inter text-[11px] text-[#64748B]">{v.note}</Text>
              <Text numberOfLines={2} className="font-inter text-[11px] text-[#94A3B8]">
                {v.body}
              </Text>
              {v.n !== current && editable ? (
                <Pressable
                  onPress={() => onRestore(v)}
                  accessibilityRole="button"
                  accessibilityLabel={`Restore v${v.n}`}
                  className="self-start active:opacity-70"
                >
                  <Text className="font-inter-medium text-[11px] text-[#6D28D9]">Restore</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </EditorCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[45%] flex-1 gap-0.5 rounded-xl bg-[#F8FAFC] p-2.5">
      <Text className="font-inter-medium text-[11px] text-[#94A3B8]">{label}</Text>
      <Text numberOfLines={1} className="font-inter-bold text-sm text-[#1E293B]">
        {value}
      </Text>
    </View>
  );
}
