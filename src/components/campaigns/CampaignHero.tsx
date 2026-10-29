import { type LucideIcon, Mail, MessageCircle, Phone } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

import { ProgressRing } from '@/components/campaigns/ProgressRing';
import { STATUS_STYLES } from '@/components/campaigns/labels';
import { callNumber, sendEmail, textNumber } from '@/components/leads/contact';
import { DEAL_LABELS } from '@/components/leads/labels';
import { usePressScale } from '@/hooks/usePressScale';
import type { CampaignDetails } from '@/services/campaignsService';
import { formatInr } from '@/utils/format';

// Top card of a campaign, tinted by its status: the brand, the campaign and its contact, the
// budget, deal type and status badges, quick contacts and the progress ring. The status badge
// pops in again when it changes (e.g. completed).

function ContactButton({
  label,
  icon: Icon,
  onPress,
}: {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
}) {
  const press = usePressScale(0.9);
  return (
    <Animated.View style={press.style}>
      <Pressable
        {...press.handlers}
        onPress={onPress}
        hitSlop={4}
        accessibilityRole="button"
        accessibilityLabel={label}
        className="h-11 w-11 items-center justify-center rounded-full bg-white"
        style={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.04)' }}
      >
        <Icon size={20} color="#1D1D1F" strokeWidth={1.67} />
      </Pressable>
    </Animated.View>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View className="rounded-3xl bg-white/75 px-3 py-1.5">
      <Text className="font-inter text-xs leading-[15px] text-[#8C8A84]">{label}</Text>
    </View>
  );
}

export function CampaignHero({ campaign }: { campaign: CampaignDetails }) {
  const reduceMotion = useReducedMotion();
  const status = STATUS_STYLES[campaign.status];
  const title = campaign.brand ?? campaign.name;
  const subtitle = [campaign.brand ? campaign.name : null, campaign.contactName]
    .filter(Boolean)
    .join(' · ');

  return (
    <View
      className="gap-3 rounded-3xl p-6"
      style={{ backgroundColor: status.tint, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text
            numberOfLines={1}
            className="font-inter-bold text-2xl leading-[29px] text-[#1D1D1F]"
          >
            {title}
          </Text>
          <Text
            numberOfLines={1}
            className="font-inter-medium text-sm leading-[17px] text-[#6E6E73]"
          >
            {subtitle}
          </Text>
        </View>
        <Text className="font-inter-bold text-lg leading-[22px] text-[#1D1D1F]">
          {campaign.budget === null ? '—' : formatInr(campaign.budget)}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        <Badge label={DEAL_LABELS[campaign.dealType]} />
        <Animated.View
          key={campaign.status}
          entering={reduceMotion ? undefined : FadeIn.duration(300)}
        >
          <Badge label={status.label} />
        </Animated.View>
      </View>

      <View className="flex-row items-end justify-between gap-3 pt-3">
        <View className="flex-row gap-3">
          <ContactButton
            label={`Call ${campaign.contactName}`}
            icon={Phone}
            onPress={() => callNumber(campaign.phone, campaign.contactName)}
          />
          <ContactButton
            label={`Message ${campaign.contactName}`}
            icon={MessageCircle}
            onPress={() => textNumber(campaign.phone, campaign.contactName)}
          />
          <ContactButton
            label={`Email ${title}`}
            icon={Mail}
            onPress={() => sendEmail(campaign.email, title)}
          />
        </View>
        <View
          accessible
          accessibilityLabel={`Progress ${campaign.progress}%`}
          className="flex-row items-center gap-3"
        >
          <ProgressRing percent={campaign.progress} />
          <View>
            <Text className="font-inter-semibold text-[10px] leading-[15px] text-[#94A3B8]">
              Progress
            </Text>
            <Text className="font-inter-semibold text-base leading-4 text-[#0F172A]">
              {campaign.progress}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
