import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Maximize2, Play, X } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SectionHeading } from '@/components/talent/TalentHighlights';
import type { PastWork as PastWorkItem } from '@/services/talentService';

// A talent's portfolio in two columns. Tapping a piece opens it full screen: clips play, photos
// show at full size.

function Tile({ item, label, onOpen }: { item: PastWorkItem; label: string; onOpen: () => void }) {
  const Icon = item.type === 'video' ? Play : Maximize2;

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="flex-1 overflow-hidden rounded-2xl bg-[#EAEAEA] active:opacity-80"
      style={{ aspectRatio: 161 / 207.5 }}
    >
      <Image
        source={{ uri: item.thumbnailUrl }}
        recyclingKey={item.id}
        contentFit="cover"
        transition={250}
        cachePolicy="memory-disk"
        accessible={false}
        style={{ flex: 1 }}
      />
      <View className="absolute inset-0 items-center justify-center">
        <View className="h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/40">
          <Icon size={18} color="#FFFFFF" strokeWidth={1.5} />
        </View>
      </View>
    </Pressable>
  );
}

function ClipPlayer({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.play();
  });

  return (
    <VideoView
      player={player}
      nativeControls
      contentFit="contain"
      accessibilityLabel="Past work video"
      style={{ flex: 1 }}
    />
  );
}

function Viewer({ item, onClose }: { item: PastWorkItem | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={item !== null}
      onRequestClose={onClose}
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View className="flex-1 bg-black">
        {item?.type === 'video' ? (
          <ClipPlayer uri={item.mediaUrl} />
        ) : item ? (
          <Image
            source={{ uri: item.mediaUrl }}
            placeholder={{ uri: item.thumbnailUrl }}
            contentFit="contain"
            transition={200}
            accessibilityLabel="Past work photo"
            style={{ flex: 1 }}
          />
        ) : null}
        <Pressable
          onPress={onClose}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="absolute right-5 h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/40 active:opacity-70"
          style={{ top: insets.top + 12 }}
        >
          <X size={20} color="#FFFFFF" strokeWidth={1.5} />
        </Pressable>
      </View>
    </Modal>
  );
}

export function PastWork({ items }: { items: PastWorkItem[] }) {
  const [open, setOpen] = useState<PastWorkItem | null>(null);
  if (items.length === 0) return null;

  // Pairs of tiles; an odd one out keeps half the width.
  const rows: PastWorkItem[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));

  return (
    <View className="gap-3">
      <SectionHeading>Past Work</SectionHeading>
      <View className="gap-3">
        {rows.map((row, r) => (
          <View key={row[0]?.id ?? r} className="flex-row gap-3">
            {row.map((item, c) => (
              <Tile
                key={item.id}
                item={item}
                label={`${item.type === 'video' ? 'Play video' : 'View photo'} ${r * 2 + c + 1} of ${items.length}`}
                onOpen={() => setOpen(item)}
              />
            ))}
            {row.length === 1 ? <View className="flex-1" /> : null}
          </View>
        ))}
      </View>
      <Viewer item={open} onClose={() => setOpen(null)} />
    </View>
  );
}
