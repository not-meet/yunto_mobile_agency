import { Image } from 'expo-image';
import { ArrowRight, BadgeCheck, MapPin, MessageCircle } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { GlassCard } from '@/components/common/GlassCard';
import type { CampaignRequest, CampaignRequestStatus } from '@/services/talentCampaignService';
import { groupDigits } from '@/utils/format';

// A talent the creator swiped on for a campaign: photo, name, where they're based, their rate
// and where the request stands. Tapping the talent opens their profile; accepted talents also
// get "Open chat", and "Confirm" to lock them in for the campaign.

export type RequestTab = 'accepted' | 'pending' | 'history';

export const REQUEST_TABS: { key: RequestTab; label: string }[] = [
  { key: 'accepted', label: 'Accepted' },
  { key: 'pending', label: 'Pending' },
  { key: 'history', label: 'History' },
];

export function requestTab(status: CampaignRequestStatus): RequestTab {
  return status === 'accepted' || status === 'pending' ? status : 'history';
}

// The tab lives in the route's `tab` param; anything unrecognised shows accepted talents.
export function parseRequestTab(raw: unknown): RequestTab {
  return REQUEST_TABS.find((t) => t.key === raw)?.key ?? 'accepted';
}

const STATUS_STYLES: Record<
  CampaignRequestStatus,
  { label: string; tint: string; badgeBackground: string; badgeText: string }
> = {
  accepted: {
    label: 'Accepted',
    tint: '#E8F5E9',
    badgeBackground: '#E8F5EE',
    badgeText: '#2D8A55',
  },
  pending: {
    label: 'Shortlisted',
    tint: '#FFF3E0',
    badgeBackground: '#FFF1DC',
    badgeText: '#B26A00',
  },
  declined: {
    label: 'Declined',
    tint: '#F3F3F3',
    badgeBackground: '#F1EFEF',
    badgeText: '#787486',
  },
  completed: {
    label: 'Completed',
    tint: '#E3EEFC',
    badgeBackground: '#E3EEFC',
    badgeText: '#2E60D1',
  },
};

const CONFIRMED_STYLE = {
  label: 'Confirmed',
  tint: '#E8F5E9',
  badgeBackground: '#D5F0DF',
  badgeText: '#1E7A45',
};

interface RequestCardProps {
  request: CampaignRequest;
  // This talent is the one confirmed for the campaign.
  confirmed: boolean;
  // Some talent is already confirmed for the campaign: no one else can be.
  locked: boolean;
  // A confirmation for this card is in flight.
  confirming: boolean;
  onOpenProfile: () => void;
  onOpenChat: () => void;
  onConfirm: () => void;
}

export function RequestCard({
  request,
  confirmed,
  locked,
  confirming,
  onOpenProfile,
  onOpenChat,
  onConfirm,
}: RequestCardProps) {
  const { talent, status } = request;
  const style = confirmed ? CONFIRMED_STYLE : STATUS_STYLES[status];
  const chat = status === 'accepted';

  return (
    <GlassCard tint={style.tint}>
      <View className="gap-4">
        <Pressable
          onPress={onOpenProfile}
          accessibilityRole="button"
          accessibilityLabel={`${talent.name}, ${talent.specialty ? `${talent.specialty}, ` : ''}${style.label}. View profile`}
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
          <View
            className="rounded-3xl px-3 py-[5px]"
            style={{ backgroundColor: style.badgeBackground }}
          >
            <Text
              className="font-inter-semibold text-xs leading-[15px]"
              style={{ color: style.badgeText }}
            >
              {style.label}
            </Text>
          </View>
        </Pressable>

        <View className="gap-2 rounded-2xl border border-white/80 bg-white/60 px-4 py-3.5">
          <View className="flex-row items-center gap-2">
            <MapPin size={15} color="#888888" strokeWidth={1.25} />
            <Text
              numberOfLines={1}
              className="flex-1 font-inter-medium text-[13px] leading-4 text-muted"
            >
              {talent.location.area ? `${talent.location.area}, ` : ''}
              {talent.location.state}
            </Text>
            {request.rate === null ? null : (
              <Text className="font-inter-bold text-[13px] leading-4 text-espresso">
                ₹{groupDigits(request.rate)}
              </Text>
            )}
          </View>
          <Text numberOfLines={1} className="font-inter-semibold text-[13px] leading-4 text-muted">
            {request.note}
          </Text>
        </View>

        <View className="flex-row justify-end gap-2">
          {chat && !locked ? (
            <Pressable
              onPress={onConfirm}
              disabled={confirming}
              accessibilityRole="button"
              accessibilityLabel={`Confirm ${talent.name} for this campaign`}
              accessibilityState={{ busy: confirming }}
              className="flex-row items-center gap-1.5 rounded-[20px] border border-white/80 bg-white/70 px-5 py-2.5 active:opacity-80"
            >
              {confirming ? (
                <ActivityIndicator size="small" color="#1F1A17" />
              ) : (
                <BadgeCheck size={16} color="#1F1A17" strokeWidth={1.33} />
              )}
              <Text className="text-center font-inter-semibold text-sm leading-4 text-espresso">
                Confirm talent
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={chat ? onOpenChat : onOpenProfile}
            accessibilityRole="button"
            accessibilityLabel={
              chat ? `Open chat with ${talent.name}` : `View ${talent.name}’s profile`
            }
            className="flex-row items-center gap-1.5 rounded-[20px] bg-cocoa px-6 py-2.5 active:opacity-80"
          >
            <Text className="text-center font-inter-semibold text-sm leading-4 text-white">
              {chat ? 'Open chat' : 'View profile'}
            </Text>
            {chat ? (
              <MessageCircle size={16} color="#FFFFFF" strokeWidth={1.33} />
            ) : (
              <ArrowRight size={16} color="#FFFFFF" strokeWidth={1.33} />
            )}
          </Pressable>
        </View>
      </View>
    </GlassCard>
  );
}
