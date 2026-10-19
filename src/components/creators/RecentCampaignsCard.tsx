import { Megaphone } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { CAMPAIGN_STATUS_STYLES } from '@/components/creators/labels';
import { ProfilePanel } from '@/components/creators/ProfilePanel';
import type { RecentCampaign } from '@/services/creatorsService';
import { fromDateKey, mediumDate } from '@/utils/dates';

// The creator's latest campaigns with the agency, as on the web profile: name, date, what
// they're delivering, and where it stands.

function CampaignRow({ campaign, last }: { campaign: RecentCampaign; last: boolean }) {
  const status = CAMPAIGN_STATUS_STYLES[campaign.status];
  const date = mediumDate(fromDateKey(campaign.date));

  return (
    <View
      accessible
      accessibilityLabel={`${campaign.name}, ${date}, ${campaign.deliverables}, ${status.label}`}
      className={`flex-row items-center gap-3 py-3.5 ${last ? '' : 'border-b border-black/5'}`}
    >
      <View className="h-8 w-8 items-center justify-center rounded-full bg-[rgba(230,215,245,0.7)]">
        <Megaphone size={14} color="#6A3A7E" strokeWidth={1.75} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text
          numberOfLines={1}
          className="font-inter-semibold text-sm leading-[21px] text-[#111111]"
        >
          {campaign.name}
        </Text>
        <Text numberOfLines={1} className="font-inter-medium text-xs leading-[18px] text-black/40">
          {date} · {campaign.deliverables}
        </Text>
      </View>
      <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: status.background }}>
        <Text className="font-inter-bold text-[11px] leading-4" style={{ color: status.color }}>
          {status.label}
        </Text>
      </View>
    </View>
  );
}

export function RecentCampaignsCard({ campaigns }: { campaigns: RecentCampaign[] }) {
  return (
    <ProfilePanel glow="230, 215, 245">
      <Text
        accessibilityRole="header"
        className="px-5 pt-4 font-inter-semibold text-[15px] leading-[22px] tracking-[-0.375px] text-[#111111]"
      >
        Recent Campaigns
      </Text>
      <View className="px-5 pb-2">
        {campaigns.length > 0 ? (
          campaigns.map((campaign, i) => (
            <CampaignRow key={campaign.id} campaign={campaign} last={i === campaigns.length - 1} />
          ))
        ) : (
          <Text className="py-3.5 font-inter-medium text-[13px] leading-5 text-black/40">
            No campaigns with this creator yet.
          </Text>
        )}
      </View>
    </ProfilePanel>
  );
}
