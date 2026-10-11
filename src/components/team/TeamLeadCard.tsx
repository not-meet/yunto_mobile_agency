import { type LucideIcon, Mail, MessageCircle, Phone } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { CARD_SHADOW } from '@/components/home/shared';
import { callNumber, openWhatsApp, sendEmail } from '@/components/leads/contact';
import { DEAL_LABELS } from '@/components/leads/labels';
import { LEAD_STATUS_STYLES, leadTint } from '@/components/team/labels';
import type { TeamLead } from '@/services/teamService';
import { formatInr } from '@/utils/format';

// One of a member's leads: how it's paid and where it stands, one-tap call / email / WhatsApp,
// and who it is, for which brand, for how much and whose it is. Cards take a pastel in turn,
// down the list (`index`).

function Chip({
  label,
  background,
  border,
  color,
}: {
  label: string;
  background: string;
  border: string;
  color: string;
}) {
  return (
    <View
      className="rounded-full border px-2.5 py-1"
      style={{ backgroundColor: background, borderColor: border }}
    >
      <Text className="font-inter-semibold text-xs leading-4" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

function ContactButton({
  icon: Icon,
  label,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-white/60 active:opacity-70"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <Icon size={13} color="#64748B" strokeWidth={1.5} />
    </Pressable>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1">
      <Text className="font-inter text-xs leading-4 text-slate">{label}</Text>
      <Text numberOfLines={1} className="font-inter-semibold text-sm leading-[18px] text-[#111111]">
        {value}
      </Text>
    </View>
  );
}

export function TeamLeadCard({ lead, index }: { lead: TeamLead; index: number }) {
  const tint = leadTint(index);
  const status = LEAD_STATUS_STYLES[lead.status];
  const budget = lead.budget === null ? '—' : formatInr(lead.budget);

  return (
    <View
      className="gap-3 rounded-3xl border border-white/70 p-4"
      style={{ backgroundColor: tint.card, boxShadow: CARD_SHADOW }}
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="shrink flex-row gap-2">
          <Chip
            label={DEAL_LABELS[lead.dealType]}
            background={tint.chip}
            border={tint.border}
            color={tint.text}
          />
          <Chip
            label={status.label}
            background={status.background}
            border={status.border}
            color={status.text}
          />
        </View>
        <View className="flex-row gap-2">
          <ContactButton
            icon={Phone}
            label={`Call ${lead.name}`}
            onPress={() => callNumber(lead.phone, lead.name)}
          />
          <ContactButton
            icon={Mail}
            label={`Email ${lead.name}`}
            onPress={() => sendEmail(lead.email, lead.name)}
          />
          <ContactButton
            icon={MessageCircle}
            label={`WhatsApp ${lead.name}`}
            onPress={() => openWhatsApp(lead.phone, lead.name)}
          />
        </View>
      </View>

      <View className="gap-[5px]">
        <View className="flex-row gap-4">
          <Field label="Name" value={lead.name} />
          <Field label="Company" value={lead.company} />
        </View>
        <View className="flex-row gap-4">
          <Field label="Budget" value={budget} />
          <Field label="Lead Owner" value={lead.owner} />
        </View>
      </View>
    </View>
  );
}
