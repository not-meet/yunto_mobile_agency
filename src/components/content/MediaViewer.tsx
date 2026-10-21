import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { ChevronLeft, ChevronRight, Film, X } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ContentMedia } from '@/services/contentService';

// A slide full screen on black, with previous/next and the strip of slides under it.

interface MediaViewerProps {
  media: ContentMedia[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
}

function Clip({ url }: { url: string }) {
  const player = useVideoPlayer(url, (p) => p.play());
  return <VideoView player={player} nativeControls contentFit="contain" style={{ flex: 1 }} />;
}

export function MediaViewer({ media, index, onIndex, onClose }: MediaViewerProps) {
  const insets = useSafeAreaInsets();
  const item = media[index];
  const go = (step: number) => onIndex((index + step + media.length) % media.length);
  if (!item) return null;

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View className="flex-1 bg-[#0B0B0F]" style={{ paddingTop: insets.top }}>
        <View className="flex-1">
          {item.mime.startsWith('image/') ? (
            <Image source={{ uri: item.url }} contentFit="contain" style={{ flex: 1 }} />
          ) : (
            <Clip key={item.id} url={item.url} />
          )}
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            className="absolute right-4 top-4 h-9 w-9 items-center justify-center rounded-full bg-white"
          >
            <X size={16} color="#0F172A" />
          </Pressable>
          {media.length > 1 ? (
            <>
              <Pressable
                onPress={() => go(-1)}
                accessibilityRole="button"
                accessibilityLabel="Previous"
                className="absolute left-3 top-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/90"
              >
                <ChevronLeft size={18} color="#0F172A" />
              </Pressable>
              <Pressable
                onPress={() => go(1)}
                accessibilityRole="button"
                accessibilityLabel="Next"
                className="absolute right-3 top-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/90"
              >
                <ChevronRight size={18} color="#0F172A" />
              </Pressable>
            </>
          ) : null}
          <Text className="absolute bottom-3 left-3 rounded-md bg-black/50 px-2 py-0.5 font-inter text-xs text-white">
            {index + 1} / {media.length}
          </Text>
        </View>

        <View className="bg-white" style={{ paddingBottom: insets.bottom + 12 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, padding: 12, alignItems: 'center' }}
          >
            {media.map((m, i) => (
              <Pressable
                key={m.id}
                onPress={() => onIndex(i)}
                accessibilityRole="button"
                accessibilityLabel={`Show ${m.name}`}
                className={`h-[52px] w-[52px] overflow-hidden rounded-lg ${i === index ? '' : 'opacity-60'}`}
                style={i === index ? { boxShadow: '0px 0px 0px 2px #101828' } : undefined}
              >
                {m.mime.startsWith('image/') ? (
                  <Image source={{ uri: m.url }} contentFit="cover" style={{ flex: 1 }} />
                ) : (
                  <View className="flex-1 items-center justify-center bg-[#0F172A]">
                    <Film size={16} color="#FFFFFF" />
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
          <Text numberOfLines={1} className="px-4 font-inter text-xs text-[#667085]">
            {item.name}
          </Text>
        </View>
      </View>
    </Modal>
  );
}
