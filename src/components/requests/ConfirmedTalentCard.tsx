import { Image } from 'expo-image';
import { BadgeCheck, MapPin, MessageCircle } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { GlassCard } from '@/components/common/GlassCard';
import type { RequestTalent } from '@/services/talentCampaignService';
import { groupDigits } from '@/utils/format';

// The talent confirmed for a campaign: who they are, where they're based and their rate, with
// a way into their profile and chat. Shown on the campaign's requests and on the brand
// campaign it hires for.

interface ConfirmedTalentCardProps {
  // e.g. "Videographer".
  role: string;
  talent: RequestTalent;
  // null when the talent hasn't quoted one (the price is hidden).
  rate: number | null;
  onOpenProfile: () => void;
  onOpenChat: () => void;
}

export function ConfirmedTalentCard({
  role,
  talent,
  rate,
  onOpenProfile,
  onOpenChat,
}: ConfirmedTalentCardProps) {
  return (
    <GlassCard tint="#E8F5E9">
      <View className="gap-4">
        <View className="flex-row items-center gap-1.5">
          <BadgeCheck size={16} color="#2D8A55" strokeWidth={1.67} />
          <Text
            accessibilityRole="header"
            className="flex-1 font-inter-semibold text-[13px] uppercase leading-4 tracking-[0.5px] text-[#2D8A55]"
          >
            Confirmed {role.toLowerCase()}
          </Text>
        </View>

        <Pressable
          onPress={onOpenProfile}
          accessibilityRole="button"
          accessibilityLabel={`${talent.name}${talent.specialty ? `, ${talent.specialty}` : ''}. View profile`}
          className="flex-row items-center gap-3 active:opacity-80"
        >
          <View className="h-14 w-14 overflow-hidden rounded-2xl bg-[#EAEAEA]">
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
          <View className="flex-1 gap-1">
            <Text
              numberOfLines={1}
              className="font-inter-semibold text-lg leading-[22px] text-espresso"
            >
              {talent.name}
            </Text>
            {talent.specialty ? (
              <Text
                numberOfLines={1}
                className="font-inter-medium text-[13px] leading-4 text-muted"
              >
                {talent.specialty}
              </Text>
            ) : null}
          </View>
        </Pressable>

        <View className="flex-row items-center gap-2 rounded-2xl border border-white/80 bg-white/60 px-4 py-3.5">
          <MapPin size={15} color="#888888" strokeWidth={1.25} />
          <Text
            numberOfLines={1}
            className="flex-1 font-inter-medium text-[13px] leading-4 text-muted"
          >
            {talent.location.area ? `${talent.location.area}, ` : ''}
            {talent.location.state}
          </Text>
          {rate === null ? null : (
            <Text className="font-inter-bold text-[13px] leading-4 text-espresso">
              ₹{groupDigits(rate)}
            </Text>
          )}
        </View>

        <Pressable
          onPress={onOpenChat}
          accessibilityRole="button"
          accessibilityLabel={`Open chat with ${talent.name}`}
          className="flex-row items-center gap-1.5 self-end rounded-[20px] bg-cocoa px-6 py-2.5 active:opacity-80"
        >
          <Text className="text-center font-inter-semibold text-sm leading-4 text-white">
            Open chat
          </Text>
          <MessageCircle size={16} color="#FFFFFF" strokeWidth={1.33} />
        </Pressable>
      </View>
    </GlassCard>
  );
}
