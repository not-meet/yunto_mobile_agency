import { getDocumentAsync } from 'expo-document-picker';
import { Image } from 'expo-image';
import { ChevronLeft, ChevronRight, Film, Maximize2, Plus, Star, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { CardLabel, EditorCard } from '@/components/content/EditorParts';
import { MediaViewer } from '@/components/content/MediaViewer';
import { type ContentMedia, MEDIA_MAX, type UploadMediaRequest } from '@/services/contentService';
import { sanitizeFileName } from '@/utils/sanitize';

// The piece's photos and clips, in slide order (slide 1 is the cover). Tap one to pick it, then
// move it, make it the cover, view it full screen or take it off.

interface MediaCardProps {
  media: ContentMedia[];
  uploading: boolean;
  editable: boolean;
  onUpload: (files: UploadMediaRequest['files']) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, to: number) => void;
}

export function MediaCard({
  media,
  uploading,
  editable,
  onUpload,
  onRemove,
  onMove,
}: MediaCardProps) {
  const [picked, setPicked] = useState<number | null>(null);
  const [viewer, setViewer] = useState<number | null>(null);
  const current = picked !== null && picked < media.length ? picked : null;
  const selected = current !== null ? media[current] : undefined;
  const room = MEDIA_MAX - media.length;

  const pick = async () => {
    const result = await getDocumentAsync({
      type: ['image/*', 'video/*'],
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const files = result.assets
      .filter((a) => /^(image|video)\//.test(a.mimeType ?? ''))
      .slice(0, room)
      .map((a) => ({
        uri: a.uri,
        name: sanitizeFileName(a.name) || 'media',
        mime: a.mimeType ?? 'image/jpeg',
        size: a.size ?? 0,
      }));
    if (files.length > 0) onUpload(files);
  };

  const move = (to: number) => {
    if (!selected) return;
    onMove(selected.id, to);
    setPicked(to);
  };

  return (
    <EditorCard>
      <CardLabel
        right={
          <Text className="font-inter-medium text-[11px] text-[#94A3B8]">
            {media.length} attached
          </Text>
        }
      >
        Media
      </CardLabel>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {media.map((item, i) => (
          <Pressable
            key={item.id}
            onPress={() => setPicked(current === i ? null : i)}
            onLongPress={() => setViewer(i)}
            accessibilityRole="button"
            accessibilityLabel={`Slide ${i + 1}${i === 0 ? ', cover' : ''}, ${item.name}`}
            accessibilityState={{ selected: current === i }}
            className={`h-24 w-[72px] overflow-hidden rounded-xl bg-[#F1F5F9] ${
              i === 0 ? 'border-[1.5px] border-[#818CF8]' : 'border border-[#E2E8F0]'
            }`}
            style={current === i ? { boxShadow: '0px 0px 0px 2px #C7D2FE' } : undefined}
          >
            {item.mime.startsWith('image/') ? (
              <Image source={{ uri: item.url }} contentFit="cover" style={{ flex: 1 }} />
            ) : (
              <View className="flex-1 items-center justify-center bg-[#0F172A]">
                <Film size={20} color="#FFFFFF" strokeWidth={1.5} />
              </View>
            )}
            <View className="absolute left-1.5 top-1.5 h-4 w-4 items-center justify-center rounded-full bg-[#334155]">
              <Text className="font-inter-bold text-[8px] text-white">{i + 1}</Text>
            </View>
            {editable ? (
              <Pressable
                onPress={() => onRemove(item.id)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove slide ${i + 1}`}
                className="absolute right-1.5 top-1.5 h-4 w-4 items-center justify-center rounded-full bg-black/60"
              >
                <X size={9} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
            ) : null}
          </Pressable>
        ))}

        {editable && room > 0 ? (
          <Pressable
            onPress={() => void pick()}
            disabled={uploading}
            accessibilityRole="button"
            accessibilityLabel="Upload media"
            accessibilityState={{ busy: uploading }}
            className="h-24 w-[72px] items-center justify-center gap-1 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] active:opacity-70"
          >
            {uploading ? (
              <ActivityIndicator color="#475569" />
            ) : (
              <>
                <Plus size={16} color="#94A3B8" />
                <Text className="font-inter-semibold text-[10px] text-[#475569]">Upload</Text>
              </>
            )}
          </Pressable>
        ) : null}
      </ScrollView>

      {selected && current !== null ? (
        <View className="flex-row flex-wrap gap-2">
          <SlideAction icon={Maximize2} label="View" onPress={() => setViewer(current)} />
          {editable ? (
            <>
              <SlideAction
                icon={ChevronLeft}
                label="Earlier"
                onPress={() => move(current - 1)}
                disabled={current === 0}
              />
              <SlideAction
                icon={ChevronRight}
                label="Later"
                onPress={() => move(current + 1)}
                disabled={current === media.length - 1}
              />
              <SlideAction
                icon={Star}
                label="Make cover"
                onPress={() => move(0)}
                disabled={current === 0}
              />
            </>
          ) : null}
        </View>
      ) : (
        <View className="flex-row items-center gap-2 rounded-xl border border-[#E0E7FF] bg-[rgba(238,242,255,0.7)] px-3 py-2">
          <View className="flex-row items-center gap-0.5">
            <View className="h-1 w-2 rounded-full bg-[#4F46E5]" />
            <View className="h-1 w-1 rounded-full bg-[#818CF8]" />
            <View className="h-1 w-1 rounded-full bg-[#A5B4FC]" />
          </View>
          <Text className="flex-1 font-inter-medium text-[11px] text-[#334155]">
            Slide order · 1 = cover. Tap a slide to move it; hold to view.
          </Text>
        </View>
      )}

      {viewer !== null && media[viewer] ? (
        <MediaViewer
          media={media}
          index={viewer}
          onIndex={setViewer}
          onClose={() => setViewer(null)}
        />
      ) : null}
    </EditorCard>
  );
}

function SlideAction({
  icon: Icon,
  label,
  onPress,
  disabled = false,
}: {
  icon: typeof Star;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      className={`flex-row items-center gap-1 rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 active:opacity-70 ${
        disabled ? 'opacity-40' : ''
      }`}
    >
      <Icon size={12} color="#0F172A" strokeWidth={2} />
      <Text className="font-inter-medium text-[11.5px] text-[#0F172A]">{label}</Text>
    </Pressable>
  );
}
