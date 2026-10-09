import { View } from 'react-native';

import { SectionHeader } from '@/components/home/SectionHeader';
import { StatTile } from '@/components/home/StatTile';
import type { HomeDashboard } from '@/services/homeService';
import { formatInr } from '@/utils/format';

// Revenue this month against last month.

export function Performance({ performance }: { performance: HomeDashboard['performance'] }) {
  const { thisMonth, lastMonth } = performance;

  return (
    <View className="gap-4">
      <SectionHeader title="Performance" />
      <View className="flex-row gap-3">
        <StatTile
          label="This Month"
          value={formatInr(thisMonth.amount)}
          caption={thisMonth.caption}
          tone="bg-[#F6F3E6] border-sand"
        />
        <StatTile
          label="Last Month"
          value={formatInr(lastMonth.amount)}
          caption={lastMonth.caption}
          tone="bg-[#E4ECF4] border-sand"
        />
      </View>
    </View>
  );
}
