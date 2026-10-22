import { type LucideIcon, Mail, MessageCircle, Phone } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

import { callNumber, sendEmail, textNumber } from '@/components/leads/contact';
import { DEAL_LABELS, STATUS_STYLES } from '@/components/leads/labels';
import { LeadIntentControl } from '@/components/leads/LeadIntentControl';
import { usePressScale } from '@/hooks/usePressScale';
import type { LeadDetails } from '@/services/leadsService';
import { formatInr } from '@/utils/format';

// Top card of a lead, tinted by its status: the brand (or the client, without one), then the
// client and campaign, the budget, deal type and status
// badges with the intent bar, and quick contacts. The status badge pops in again when it changes (e.g. converted).

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

export function LeadHero({ lead }: { lead: LeadDetails }) {
  const reduceMotion = useReducedMotion();
  const status = STATUS_STYLES[lead.status];
  const title = lead.brand ?? lead.name;
  const subtitle =
    [lead.brand ? lead.name : null, lead.campaign].filter(Boolean).join(' · ') || 'No campaign yet';

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
          {lead.budget === null ? '—' : formatInr(lead.budget)}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        <Badge label={DEAL_LABELS[lead.dealType]} />
        <Animated.View key={lead.status} entering={reduceMotion ? undefined : FadeIn.duration(300)}>
          <Badge label={status.label} />
        </Animated.View>
        <LeadIntentControl leadId={lead.id} intent={lead.intent} />
      </View>

      <View className="flex-row gap-3 pt-3">
        <ContactButton
          label={`Call ${lead.name}`}
          icon={Phone}
          onPress={() => callNumber(lead.phone, lead.name)}
        />
        <ContactButton
          label={`Message ${lead.name}`}
          icon={MessageCircle}
          onPress={() => textNumber(lead.phone, lead.name)}
        />
        <ContactButton
          label={`Email ${lead.brand ?? lead.name}`}
          icon={Mail}
          onPress={() => sendEmail(lead.email, lead.brand ?? lead.name)}
        />
      </View>
    </View>
  );
}
