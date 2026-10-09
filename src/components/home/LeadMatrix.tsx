import { router } from 'expo-router';
import { View } from 'react-native';

import { SectionHeader } from '@/components/home/SectionHeader';
import { StatTile } from '@/components/home/StatTile';
import type { LeadFilter } from '@/components/leads/labels';
import type { HomeDashboard } from '@/services/homeService';

// Where the leads stand: four tiles, two to a row. Each opens the leads list filtered to it
// ("Won" is a lead converted into a campaign); "See all" opens it unfiltered.

const pad = (count: number) => String(count).padStart(2, '0');

const openLeads = (filter: LeadFilter) =>
  router.push({ pathname: '/leads', params: filter === 'all' ? {} : { filter } });

export function LeadMatrix({ matrix }: { matrix: HomeDashboard['leadMatrix'] }) {
  const { unattended, newLeads, contacted, won } = matrix;

  return (
    <View className="gap-4">
      <SectionHeader
        title="Lead Matrix"
        action={{ label: 'See all', onPress: () => openLeads('all') }}
      />
      <View className="gap-3">
        <View className="flex-row gap-3">
          <StatTile
            label="Unattended"
            value={pad(unattended.count)}
            caption={unattended.caption}
            tone="bg-[#FEF0F4] border-sand"
            onPress={() => openLeads('needs-response')}
          />
          <StatTile
            label="New Leads"
            value={pad(newLeads.count)}
            caption={newLeads.caption}
            tone="bg-[#E2EBE2] border-sand"
            onPress={() => openLeads('new')}
          />
        </View>
        <View className="flex-row gap-3">
          <StatTile
            label="Contacted"
            value={pad(contacted.count)}
            caption={contacted.caption}
            tone="bg-[#E8F3FF] border-[#DFEEFF]"
            onPress={() => openLeads('contacted')}
          />
          <StatTile
            label="Won"
            value={pad(won.count)}
            caption={won.caption}
            tone="bg-[#E9E1FF] border-sand"
            onPress={() => openLeads('campaign')}
          />
        </View>
      </View>
    </View>
  );
}
