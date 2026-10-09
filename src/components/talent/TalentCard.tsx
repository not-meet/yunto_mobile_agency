import { Image } from 'expo-image';
import { MapPin, MessageCircle } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { experienceLine } from '@/components/talent/labels';
import type { TalentListItem } from '@/services/talentService';

// A talent in the browse deck. `TalentCard` is the front card; `StackedCard` is one of the
// tilted, faded cards peeking out behind it (the next profiles).

export const CARD_SHADOW =
  '0px 20px 40px rgba(0, 0, 0, 0.06), 0px 4px 12px rgba(0, 0, 0, 0.04), inset 0px 2px 4px 1px #FFFFFF, inset 0px -2px 6px 1px rgba(0, 0, 0, 0.02)';
const PILL_GRADIENT = 'linear-gradient(100.38deg, #F3EBFF 0%, #EAF5FF 100%)';

function TalentPhoto({ talent, height }: { talent: TalentListItem; height: number }) {
  return (
    <View className="overflow-hidden rounded-[20px] bg-[#EAEAEA]" style={{ height }}>
      {/* No photo yet: the grey tile stays as the placeholder. */}
      {talent.photoUrl ? (
        <Image
          source={{ uri: talent.photoUrl }}
          recyclingKey={talent.id}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
          accessible={false}
          style={{ flex: 1 }}
        />
      ) : null}
    </View>
  );
}

// Hidden when the reply time isn't known.
function ReplyPill({ replyTime }: { replyTime: string | null }) {
  if (!replyTime) return null;
  return (
    <View
      className="flex-row items-center gap-1.5 self-start rounded-2xl border border-white px-3.5 py-2"
      style={{
        experimental_backgroundImage: PILL_GRADIENT,
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.03)',
      }}
    >
      <MessageCircle size={14} color="#1D1D1F" strokeWidth={1.17} />
      <Text className="font-inter-bold text-[13px] leading-4 text-[#1D1D1F]">
        Replies within {replyTime}
      </Text>
    </View>
  );
}

interface TalentCardProps {
  talent: TalentListItem;
  height: number;
  onOpen: () => void;
}

export function TalentCard({ talent, height, onOpen }: TalentCardProps) {
  // The photo gives way first when the screen is short.
  const photoHeight = Math.max(120, Math.min(200, height - 260));

  return (
    <View
      className="rounded-[32px] border border-white/90 bg-white p-4"
      style={{ height, boxShadow: CARD_SHADOW }}
    >
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`${talent.name}, ${talent.specialty}, ${talent.location.state}`}
        accessibilityHint="Opens the profile. Swipe left or right for other profiles."
        className="flex-1"
      >
        <TalentPhoto talent={talent} height={photoHeight} />
        <View className="flex-1 gap-1.5 pt-5">
          <View className="flex-row items-start justify-between gap-2">
            <Text
              numberOfLines={1}
              className="shrink font-inter-extrabold text-[26px] leading-[31px] tracking-[-0.5px] text-[#1D1D1F]"
            >
              {talent.name}
            </Text>
            <View
              className="flex-row items-center gap-1 rounded-xl bg-white/80 px-2.5 py-1.5"
              style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.02), inset 0px 1px 2px #FFFFFF' }}
            >
              <MapPin size={14} color="#6E6E73" strokeWidth={1.17} />
              <Text className="font-inter-bold text-xs leading-[15px] text-[#6E6E73]">
                {talent.location.state}
              </Text>
            </View>
          </View>
          <Text
            numberOfLines={2}
            className="pt-0.5 font-inter-medium text-sm leading-[21px] text-[#6E6E73]"
          >
            {talent.specialty}
            {'\n'}
            {experienceLine(talent.experienceYears, talent.brands)}
          </Text>
          <View className="min-h-[34px] flex-1 justify-end pt-[11px]">
            <ReplyPill replyTime={talent.replyTime} />
          </View>
        </View>
      </Pressable>
      <View className="pt-4">
        <Pressable
          onPress={onOpen}
          accessibilityRole="button"
          accessibilityLabel={`View ${talent.name}'s profile`}
          className="h-[52px] items-center justify-center rounded-3xl bg-cocoa active:opacity-80"
          style={{ boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)' }}
        >
          <Text className="text-center font-inter-bold text-base leading-[19px] text-white">
            View profile
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

interface StackedCardProps {
  talent: TalentListItem;
  height: number;
  // How washed out the contents are: the further back, the fainter.
  fade: number;
}

export function StackedCard({ talent, height, fade }: StackedCardProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="rounded-[32px] border border-white/90 bg-white/70 p-4"
      style={{ height, boxShadow: CARD_SHADOW }}
    >
      <View style={{ opacity: fade }} className="gap-5">
        <TalentPhoto talent={talent} height={Math.max(110, Math.min(190, height - 260))} />
        <Text
          numberOfLines={1}
          className="font-inter-extrabold text-[26px] leading-[31px] tracking-[-0.5px] text-[#1D1D1F]"
        >
          {talent.name}
        </Text>
      </View>
      <View style={{ opacity: fade }} className="flex-1 justify-end pb-2">
        <ReplyPill replyTime={talent.replyTime} />
      </View>
    </View>
  );
}
