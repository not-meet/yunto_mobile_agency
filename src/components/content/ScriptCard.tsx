import * as Clipboard from 'expo-clipboard';
import { Check, Copy, RotateCw } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { ContentCanvas } from '@/components/content/ContentCanvas';
import { EditorCard } from '@/components/content/EditorParts';
import { MARKS } from '@/components/content/labels';
import type { Marked } from '@/components/content/scriptMarks';

// The script: written on the canvas with the formatting bar, or, after Analyze, read back with
// its hook, highlights and CTA marked and a post-ready caption to copy. `children` (the AI
// assistant) sits at the bottom of the card, as on the web.

export type ScriptMode = 'write' | 'analyzing' | 'analyzed';

interface ScriptCardProps {
  kind: string;
  title: string;
  body: string;
  editable: boolean;
  mode: ScriptMode;
  marked: Marked | null;
  // "Instagram Reel", or "Post" when not set.
  cutLabel: string;
  caption: string;
  topics: string[];
  onChange: (patch: { title?: string; body?: string }) => void;
  onAnalyze: () => void;
  onWrite: () => void;
  onAddCta: () => void;
  children?: ReactNode;
}

export function ScriptCard({
  kind,
  title,
  body,
  editable,
  mode,
  marked,
  cutLabel,
  caption,
  topics,
  onChange,
  onAnalyze,
  onWrite,
  onAddCta,
  children,
}: ScriptCardProps) {
  return (
    <EditorCard>
      <View className="flex-row items-center justify-between gap-2">
        <View className="shrink rounded-full bg-[#C2185B] px-3 py-1">
          <Text numberOfLines={1} className="font-inter-semibold text-xs leading-4 text-white">
            {kind}
          </Text>
        </View>
        <View className="flex-row items-center rounded-full bg-[#F8FAFC] p-[3px]">
          {editable ? (
            <ModeButton label="Write" active={mode === 'write'} onPress={onWrite} />
          ) : null}
          <ModeButton
            label="✦ Analyze"
            active={mode !== 'write'}
            onPress={onAnalyze}
            disabled={mode === 'analyzing'}
          />
        </View>
      </View>
      <Text className="font-inter text-xs leading-4 text-[#64748B]">
        Write your idea — AI marks the hook, highlights and CTA
      </Text>

      {mode === 'write' ? (
        <ContentCanvas
          title={title}
          body={body}
          onChange={onChange}
          minHeight={320}
          editable={editable}
        />
      ) : mode === 'analyzing' ? (
        <View className="items-center gap-3 py-16">
          <ActivityIndicator color="#5B44F2" />
          <Text className="text-center font-inter-medium text-sm leading-5 text-[#5B44F2]">
            ✦ Reading your script for the hook, highlights and CTA…
          </Text>
        </View>
      ) : marked ? (
        <AnalyzedScript
          marked={marked}
          cutLabel={cutLabel}
          caption={caption}
          topics={topics}
          editable={editable}
          onRerun={onAnalyze}
          onAddCta={onAddCta}
        />
      ) : null}

      {children}
    </EditorCard>
  );
}

function ModeButton({
  label,
  active,
  onPress,
  disabled = false,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active, disabled }}
      className={`rounded-full px-3.5 py-1.5 active:opacity-70 ${active ? 'bg-black' : ''}`}
    >
      <Text
        className={`font-inter-semibold text-xs leading-4 ${active ? 'text-white' : 'text-[#475569]'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className="h-2 w-2 rounded-sm" style={{ backgroundColor: color }} />
      <Text className="font-inter text-[11px] leading-4 text-[#475569]">{label}</Text>
    </View>
  );
}

interface AnalyzedScriptProps {
  marked: Marked;
  cutLabel: string;
  caption: string;
  topics: string[];
  editable: boolean;
  onRerun: () => void;
  onAddCta: () => void;
}

function AnalyzedScript({
  marked,
  cutLabel,
  caption,
  topics,
  editable,
  onRerun,
  onAddCta,
}: AnalyzedScriptProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await Clipboard.setStringAsync(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <View className="gap-4">
      <View className="flex-row flex-wrap gap-x-4 gap-y-1">
        <Legend color={MARKS.hook.edge} label="Hook" />
        <Legend color={MARKS.highlight.edge} label="Highlight" />
        <Legend color={MARKS.cta.edge} label="Call to action" />
      </View>

      <Text className="font-inter text-[13.5px] leading-[22px] text-[#1E293B]">
        {marked.parts.map((part, i) => {
          const mark = part.tag ? MARKS[part.tag] : null;
          return (
            <Text
              key={i}
              style={mark ? { backgroundColor: mark.background } : undefined}
              className={part.tag === 'hook' ? 'font-inter-semibold' : ''}
            >
              {part.text}
              {mark ? (
                <Text
                  className="font-inter-bold text-[9.5px] tracking-[0.5px]"
                  style={{ color: mark.tagColor, backgroundColor: mark.tagBackground }}
                >
                  {` ${mark.tag} `}
                </Text>
              ) : null}{' '}
            </Text>
          );
        })}
      </Text>

      <View className="gap-3 rounded-2xl border border-[#EEF0F3] p-4">
        <View className="gap-2">
          <Text className="font-inter text-xs leading-4 text-[#94A3B8]">
            <Text className="font-inter-bold text-[#5B21B6]">✦ POST-READY CUT</Text> · {cutLabel} ·{' '}
            {marked.highlights.length + 2} lines
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={onRerun}
              accessibilityRole="button"
              accessibilityLabel="Re-run Analyze"
              className="flex-row items-center gap-1 rounded-full border border-[#E2E8F0] px-3 py-1.5 active:opacity-70"
            >
              <RotateCw size={12} color="#0F172A" />
              <Text className="font-inter-medium text-[11.5px] text-[#0F172A]">Re-run</Text>
            </Pressable>
            <Pressable
              onPress={() => void copy()}
              accessibilityRole="button"
              accessibilityLabel="Copy caption"
              className="flex-row items-center gap-1 rounded-full bg-black px-3 py-1.5 active:opacity-80"
            >
              {copied ? <Check size={12} color="#FFFFFF" /> : <Copy size={12} color="#FFFFFF" />}
              <Text className="font-inter-medium text-[11.5px] text-white">
                {copied ? 'Copied' : 'Copy caption'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-1">
          <Text className="font-inter-bold text-[10px] tracking-[0.5px] text-[#6D28D9]">HOOK</Text>
          <Text className="font-inter-semibold text-xs leading-[17px] text-[#0F172A]">
            {marked.hook}
          </Text>
        </View>
        {marked.highlights.length > 0 ? (
          <View className="gap-1">
            <Text className="font-inter-bold text-[10px] tracking-[0.5px] text-[#B45309]">
              HIGHLIGHTS TO POST
            </Text>
            {marked.highlights.map((line) => (
              <Text key={line} className="font-inter text-xs leading-[17px] text-[#475569]">
                {line}
              </Text>
            ))}
          </View>
        ) : null}
        <View className="gap-1">
          <View className="flex-row flex-wrap items-center gap-1.5">
            <Text className="font-inter-bold text-[10px] tracking-[0.5px] text-[#166534]">CTA</Text>
            {!marked.cta ? (
              <Text className="rounded border border-[#FDE68A] bg-[#FFFBEB] px-1 font-inter-medium text-[10px] text-[#B45309]">
                AI suggested — not in your script
              </Text>
            ) : null}
          </View>
          <Text className="font-inter-semibold text-xs leading-[17px] text-[#0F172A]">
            {marked.cta ?? marked.suggestedCta}
          </Text>
          {!marked.cta && marked.suggestedCta && editable ? (
            <Pressable onPress={onAddCta} accessibilityRole="button" className="active:opacity-70">
              <Text className="font-inter-semibold text-[11px] text-[#4F46E5]">
                + Add this CTA to the script
              </Text>
            </Pressable>
          ) : null}
        </View>
        {topics.length > 0 ? (
          <View className="flex-row flex-wrap gap-1.5">
            {topics.map((topic) => (
              <Text
                key={topic}
                className="rounded-md bg-[#F1F5F9] px-2 py-0.5 font-inter text-[11px] text-[#475569]"
              >
                {topic}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}
