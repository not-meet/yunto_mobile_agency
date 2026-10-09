import { ArrowRight, Calendar, LayoutTemplate, type LucideIcon } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { NO_STATUS_TINT, STATUS_STYLES } from '@/components/requests/labels';
import { GlassCard } from '@/components/common/GlassCard';
import { ROLE_LABELS } from '@/components/talent/labels';
import type { TalentCampaign } from '@/services/talentCampaignService';
import { fromDateKey, mediumDate } from '@/utils/dates';

// A campaign the creator is hiring for: role and status badges, the brand campaign and deadline,
// and how far the swiping has got. Talents only the creator has shortlisted show in amber;
// ones accepted from both ends in green.

const ACCEPTED = {
  label: 'Accepted',
  text: '#2E7D32',
  bar: 'linear-gradient(90deg, #4CAF50 0%, #81C784 100%)',
};
const SHORTLISTED = {
  label: 'Shortlisted',
  text: '#B26A00',
  bar: 'linear-gradient(90deg, #FFA726 0%, #FFCC80 100%)',
};

function Badge({ label, background, color }: { label: string; background: string; color: string }) {
  return (
    <View className="rounded-3xl px-3 py-[5px]" style={{ backgroundColor: background }}>
      <Text className="font-inter-semibold text-xs leading-[15px]" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

function InfoRow({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Icon size={15} color="#888888" strokeWidth={1.25} />
      <Text numberOfLines={1} className="flex-1 font-inter-medium text-[13px] leading-4 text-muted">
        {text}
      </Text>
    </View>
  );
}

function ProgressRow({
  label,
  count,
  countColor,
  fraction,
  bar,
}: {
  label: string;
  count: number;
  countColor: string;
  fraction: number;
  bar: string;
}) {
  return (
    <>
      <View className="flex-row items-center justify-between">
        <Text className="font-inter-semibold text-[13px] leading-4 text-muted">{label}</Text>
        <Text className="font-inter-bold text-[13px] leading-4" style={{ color: countColor }}>
          {count}
        </Text>
      </View>
      <View className="h-1.5 overflow-hidden rounded-[3px] bg-black/5">
        <View
          className="h-full rounded-[3px]"
          style={{ width: `${Math.min(fraction, 1) * 100}%`, experimental_backgroundImage: bar }}
        />
      </View>
    </>
  );
}

interface TalentCampaignCardProps {
  campaign: TalentCampaign;
  onView: () => void;
}

export function TalentCampaignCard({ campaign, onView }: TalentCampaignCardProps) {
  const { title, role, status, stage, swiped, pool } = campaign;
  const statusStyle = status === 'UNKNOWN' ? null : STATUS_STYLES[status];
  const hired = stage === 'shortlisted' ? SHORTLISTED : ACCEPTED;
  const hiredCount = stage === 'shortlisted' ? campaign.shortlisted : campaign.accepted;

  return (
    <GlassCard tint={statusStyle?.tint ?? NO_STATUS_TINT}>
      <View className="gap-4">
        <View className="gap-2">
          <Text
            numberOfLines={1}
            className="font-inter-semibold text-lg leading-[22px] text-espresso"
          >
            {title}
          </Text>
          <View className="flex-row gap-1.5">
            <Badge label={ROLE_LABELS[role].singular} background="#E9E1F3" color="#9333EA" />
            {statusStyle ? (
              <Badge
                label={statusStyle.label}
                background={statusStyle.badgeBackground}
                color={statusStyle.badgeText}
              />
            ) : null}
          </View>
        </View>

        <View className="gap-2">
          <InfoRow icon={LayoutTemplate} text={`Campaign: ${campaign.campaign}`} />
          {campaign.deadline ? (
            <InfoRow
              icon={Calendar}
              text={`Deadline: ${mediumDate(fromDateKey(campaign.deadline))}`}
            />
          ) : null}
        </View>

        <View className="gap-2 rounded-2xl border border-white/80 bg-white/60 px-4 pb-3.5 pt-[22px]">
          <ProgressRow
            label="Swiped"
            count={swiped}
            countColor="#1F1A17"
            fraction={swiped / pool}
            bar="linear-gradient(90deg, #B0BEC5 0%, #B0BEC5 100%)"
          />
          <View className="pt-1" />
          <ProgressRow
            label={hired.label}
            count={hiredCount}
            countColor={hired.text}
            fraction={swiped > 0 ? hiredCount / swiped : 0}
            bar={hired.bar}
          />
        </View>

        <Pressable
          onPress={onView}
          accessibilityRole="button"
          accessibilityLabel={`View requests for ${title}`}
          className="flex-row items-center gap-1.5 self-end rounded-[20px] bg-cocoa px-6 py-2.5 active:opacity-80"
        >
          <Text className="text-center font-inter-semibold text-sm leading-4 text-white">View</Text>
          <ArrowRight size={16} color="#FFFFFF" strokeWidth={1.33} />
        </Pressable>
      </View>
    </GlassCard>
  );
}
