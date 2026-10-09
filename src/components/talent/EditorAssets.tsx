import { getDocumentAsync } from 'expo-document-picker';
import { CloudUpload, FileVideo, X } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import type { EditDraft } from '@/components/talent/EditorRequirements';
import { SECTION_SHADOW } from '@/components/talent/labels';
import { footageLinkSchema, MAX_FOOTAGE_FILES } from '@/services/talentService';
import {
  normalizeLink,
  sanitizeEditorNotes,
  sanitizeFileName,
  sanitizeLinkInput,
} from '@/utils/sanitize';
import { PLACEHOLDER_COLOR } from '@/utils/constants';

// The footage an editor works from: files picked from the device, a shared-drive link, or both,
// plus notes. All optional.

const ACCEPTED_TYPES = ['video/*', 'image/*', 'application/zip'];
const FIELD_SHADOW = 'inset 0px 2px 4px 1px rgba(0, 0, 0, 0.01)';

// A frosted input box whose border tints blue while focused.
function Field({
  focused,
  className,
  children,
}: {
  focused: boolean;
  className: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <Animated.View
      className={`self-stretch rounded-2xl border bg-white/60 px-4 ${className}`}
      style={{
        borderColor: focused ? '#BBDEFB' : 'rgba(255, 255, 255, 0.9)',
        boxShadow: FIELD_SHADOW,
        transitionProperty: 'borderColor',
        transitionDuration: reduceMotion ? 0 : 180,
      }}
    >
      {children}
    </Animated.View>
  );
}

interface EditorAssetsProps {
  value: EditDraft;
  onChange: (next: EditDraft) => void;
}

export function EditorAssets({ value, onChange }: EditorAssetsProps) {
  const [focus, setFocus] = useState<'link' | 'notes' | null>(null);
  const [pickError, setPickError] = useState<string>();
  const set = <K extends keyof EditDraft>(key: K, next: EditDraft[K]) =>
    onChange({ ...value, [key]: next });

  const full = value.footageFiles.length >= MAX_FOOTAGE_FILES;
  const linkInvalid = focus !== 'link' && !footageLinkSchema.safeParse(value.footageLink).success;

  const pick = async () => {
    const result = await getDocumentAsync({
      type: ACCEPTED_TYPES,
      multiple: true,
      copyToCacheDirectory: false,
    });
    if (result.canceled) return;
    const names = result.assets.map((asset) => sanitizeFileName(asset.name)).filter(Boolean);
    const next = [...new Set([...value.footageFiles, ...names])];
    setPickError(
      next.length > MAX_FOOTAGE_FILES
        ? `Only the first ${MAX_FOOTAGE_FILES} files were added.`
        : undefined,
    );
    set('footageFiles', next.slice(0, MAX_FOOTAGE_FILES));
  };

  return (
    <View
      className="gap-4 rounded-3xl border border-white/90 bg-white/70 p-5"
      style={{ boxShadow: SECTION_SHADOW }}
    >
      <Text
        accessibilityRole="header"
        className="font-inter-bold text-base leading-[19px] text-[#1A1A1A]"
      >
        Assets & Input
      </Text>

      <View className="gap-3">
        <Pressable
          onPress={() => void pick()}
          disabled={full}
          accessibilityRole="button"
          accessibilityLabel="Upload footage"
          accessibilityHint="Pick videos, photos or a zip from your phone"
          accessibilityState={{ disabled: full }}
          className={`items-center gap-2 rounded-2xl border border-dashed border-black/10 bg-white/40 p-6 active:opacity-70 ${
            full ? 'opacity-50' : ''
          }`}
        >
          <View className="h-11 w-11 items-center justify-center rounded-full bg-[#E3F2FD]">
            <CloudUpload size={20} color="#1565C0" strokeWidth={1.67} />
          </View>
          <Text className="pt-2 text-center font-inter-semibold text-base leading-[19px] text-[#333333]">
            Upload Footage
          </Text>
          <Text className="text-center font-inter-regular text-xs leading-[15px] text-[#666666]">
            Videos, photos or a ZIP
          </Text>
        </Pressable>

        {value.footageFiles.length > 0 ? (
          <View className="gap-2">
            {value.footageFiles.map((name) => (
              <View
                key={name}
                className="flex-row items-center gap-2 rounded-xl border border-[#F0F0F0] bg-white px-3 py-2"
              >
                <FileVideo size={14} color="#1565C0" strokeWidth={1.33} />
                <Text
                  numberOfLines={1}
                  className="flex-1 font-inter-medium text-[13px] leading-4 text-[#333333]"
                >
                  {name}
                </Text>
                <Pressable
                  onPress={() =>
                    set(
                      'footageFiles',
                      value.footageFiles.filter((file) => file !== name),
                    )
                  }
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${name}`}
                  className="active:opacity-60"
                >
                  <X size={14} color="#888888" strokeWidth={1.5} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
        {pickError ? (
          <Text className="pl-1 font-inter-medium text-xs leading-[15px] text-rose-500">
            {pickError}
          </Text>
        ) : null}

        <Field focused={focus === 'link'} className="py-3.5">
          <TextInput
            value={value.footageLink}
            onChangeText={(next) => set('footageLink', sanitizeLinkInput(next))}
            onFocus={() => setFocus('link')}
            onBlur={() => {
              setFocus(null);
              // "drive.google.com/…" becomes a full https link; anything else is left to flag.
              const normalized = value.footageLink && normalizeLink(value.footageLink);
              if (normalized) set('footageLink', normalized);
            }}
            placeholder="Paste a Drive or Dropbox link"
            placeholderTextColor={PLACEHOLDER_COLOR}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="done"
            accessibilityLabel="Footage link"
            className="p-0 font-inter-regular text-sm leading-[17px] text-[#1A1A1A]"
          />
        </Field>
        {linkInvalid ? (
          <Text
            accessibilityLiveRegion="polite"
            className="-mt-1 pl-1 font-inter-medium text-xs leading-[15px] text-rose-500"
          >
            Enter a valid https link.
          </Text>
        ) : null}

        <Field focused={focus === 'notes'} className="min-h-[90px] pb-4 pt-3.5">
          <TextInput
            value={value.notes}
            onChangeText={(next) => set('notes', sanitizeEditorNotes(next))}
            onFocus={() => setFocus('notes')}
            onBlur={() => setFocus(null)}
            placeholder="Notes for the editor: music, captions, references or anything else..."
            placeholderTextColor={PLACEHOLDER_COLOR}
            multiline
            textAlignVertical="top"
            accessibilityLabel="Notes for the editor"
            className="min-h-[51px] p-0 font-inter-regular text-sm leading-[17px] text-[#1A1A1A]"
          />
        </Field>
      </View>
    </View>
  );
}
