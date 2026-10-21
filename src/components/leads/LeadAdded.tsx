import { Banknote, Check, Gift, Tag } from 'lucide-react-native';
import { Text, View } from 'react-native';
import Animated, { useReducedMotion, ZoomIn } from 'react-native-reanimated';

import { Reveal } from '@/components/common/Reveal';
import {
  DEAL_LABELS,
  nicheTone,
  PLATFORM_STYLES,
  PRODUCT_SHIPMENT_LABELS,
} from '@/components/leads/labels';
import { TagChip } from '@/components/leads/TagChip';
import type { CreatedLead } from '@/services/leadsService';
import { mediumDate } from '@/utils/dates';
import { groupDigits } from '@/utils/format';

// Shown once a lead is added: a check mark, the lead's platforms, deal type and niches as
// badges, and everything that was filled in. Blank fields show a dash.

const EMPTY = '—';

const rupees = (amount: number | null) => (amount === null ? EMPTY : `₹${groupDigits(amount)}`);

// "+919812345678" → "+91 98123 45678"; other countries as stored.
function formatPhone(phone: string): string {
  const indian = /^\+91(\d{5})(\d{5})$/.exec(phone);
  return indian ? `+91 ${indian[1]} ${indian[2]}` : phone;
}

function Hero({ brand }: { brand: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <View className="items-center gap-[15px] pb-2">
      <Animated.View
        entering={reduceMotion ? undefined : ZoomIn.springify().damping(14)}
        className="h-[72px] w-[72px] items-center justify-center rounded-full bg-[#EAF5EE]"
        style={{ boxShadow: '0px 8px 32px rgba(74, 160, 100, 0.12)' }}
      >
        <View className="h-[54px] w-[54px] items-center justify-center rounded-full bg-[#D2ECDA]">
          <View
            className="h-10 w-10 items-center justify-center rounded-full bg-[#3E7D52]"
            style={{ boxShadow: '0px 4px 12px rgba(62, 125, 82, 0.3)' }}
          >
            <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </View>
        {/* Confetti dots. */}
        <View className="absolute -right-1.5 -top-1.5 h-5 w-5 rounded-full border-2 border-white bg-[#FDE08B]" />
        <View className="absolute -bottom-1.5 -left-1.5 h-4 w-4 rounded-full border-2 border-white bg-[#E6E1F9]" />
      </Animated.View>

      <View className="items-center gap-[5px] px-6">
        <Text
          accessibilityRole="header"
          className="text-center font-inter-semibold text-[22px] leading-7 tracking-[-0.55px] text-[#111111]"
        >
          Lead Added!
        </Text>
        <Text className="text-center font-inter-medium text-[13px] leading-5 text-[#888888]">
          {brand} is now in your leads
        </Text>
      </View>
    </View>
  );
}

function Row({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}, ${value === EMPTY ? 'not given' : value}`}
      className={`flex-row items-start justify-between gap-4 py-3 ${
        last ? '' : 'border-b border-[#F4F4F4]'
      }`}
    >
      <Text className="shrink-0 pt-0.5 font-inter-semibold text-[11px] uppercase leading-4 tracking-[1.1px] text-[#AAAAAA]">
        {label}
      </Text>
      <Text className="flex-1 text-right font-inter-semibold text-[13px] leading-[18px] text-[#222222]">
        {value}
      </Text>
    </View>
  );
}

export function LeadAdded({ lead }: { lead: CreatedLead }) {
  const barter = lead.campaignType === 'barter';
  const rows: { label: string; value: string }[] = [
    { label: 'Brand Name', value: lead.brand },
    { label: 'Brand Website', value: lead.website ?? EMPTY },
    { label: 'Email Address', value: lead.email ?? EMPTY },
    { label: 'Contact Person', value: lead.contactName },
    { label: 'Phone Number', value: lead.phone ? formatPhone(lead.phone) : EMPTY },
    { label: barter ? 'Barter Value' : 'Campaign Budget', value: rupees(lead.budget) },
    ...(barter
      ? [
          { label: 'Agency Fee', value: rupees(lead.agencyFee) },
          {
            label: 'Product Shipment',
            value:
              lead.productShipment && lead.productShipment !== 'UNKNOWN'
                ? PRODUCT_SHIPMENT_LABELS[lead.productShipment]
                : EMPTY,
          },
        ]
      : []),
    { label: 'Influencers', value: lead.influencers === null ? EMPTY : String(lead.influencers) },
    { label: 'Deliverables', value: lead.deliverables ?? EMPTY },
    { label: 'Submission Date', value: mediumDate(new Date(lead.createdAt)) },
  ];

  return (
    <View className="gap-6">
      <Hero brand={lead.brand} />

      <Reveal order={1}>
        <View className="flex-row flex-wrap justify-center gap-2 px-2">
          {lead.platforms.map((platform) => {
            const { label, icon, tone } = PLATFORM_STYLES[platform];
            return <TagChip key={platform} label={label} icon={icon} tone={tone} size="sm" />;
          })}
          <TagChip
            label={DEAL_LABELS[lead.campaignType]}
            icon={barter ? Gift : Banknote}
            tone="green"
            size="sm"
          />
          {lead.niches.map((niche, i) => (
            <TagChip key={niche} label={niche} icon={Tag} tone={nicheTone(i)} size="sm" />
          ))}
        </View>
      </Reveal>

      <Reveal order={2}>
        <View
          className="rounded-[28px] border border-black/[0.03] bg-white px-5 py-2"
          style={{ boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.05)' }}
        >
          {rows.map((row, i) => (
            <Row key={row.label} {...row} last={i === rows.length - 1} />
          ))}
        </View>
      </Reveal>
    </View>
  );
}
