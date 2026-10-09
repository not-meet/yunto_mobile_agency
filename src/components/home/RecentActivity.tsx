import { Text, View } from 'react-native';

import { SectionHeader } from '@/components/home/SectionHeader';
import { CARD_SHADOW } from '@/components/home/shared';
import type { HomeDashboard } from '@/services/homeService';
import { formatRelativeTime } from '@/utils/format';

// A timeline of the latest agency events. Older ones fade, and the card fades out at the bottom.

const MARKERS = ['bg-[#E6E1F9]', 'bg-[#FCF4D9]', 'bg-sand'];
const FRESH = 2;

export function RecentActivity({ activity }: { activity: HomeDashboard['activity'] }) {
  return (
    <View className="gap-4">
      <SectionHeader title="Recent Activity" />
      <View
        className="overflow-hidden rounded-[28px] border border-sand bg-white/40 py-5 pl-9 pr-5"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <View className="gap-[22px] border-l border-[rgba(232,226,217,0.8)] pb-4">
          {activity.map((event, index) => {
            const fresh = index < FRESH;
            return (
              <View key={event.id} className={`gap-0.5 pl-6 ${fresh ? '' : 'opacity-60'}`}>
                <View
                  className={`absolute -left-[13px] top-px h-6 w-6 items-center justify-center rounded-full border-2 border-[#F9F6EE] ${MARKERS[Math.min(index, MARKERS.length - 1)]}`}
                  style={fresh ? { boxShadow: CARD_SHADOW } : undefined}
                >
                  <View
                    className={`h-1.5 w-1.5 rounded-full ${fresh ? 'bg-charcoal' : 'bg-charcoal/50'}`}
                  />
                </View>
                <Text className="font-inter-bold text-[15px] leading-[19px] text-charcoal">
                  {event.title}
                </Text>
                <Text className="font-inter-medium text-xs leading-4 text-charcoal/60">
                  {event.body}
                </Text>
                <Text className="pt-0.5 font-inter-bold text-[10px] uppercase leading-[15px] tracking-[0.5px] text-charcoal/40">
                  {formatRelativeTime(event.at)}
                </Text>
              </View>
            );
          })}
        </View>
        <View
          pointerEvents="none"
          className="absolute bottom-px left-px right-px h-24"
          style={{
            experimental_backgroundImage:
              'linear-gradient(0deg, rgba(249, 246, 238, 0.8) 0%, rgba(249, 246, 238, 0) 100%)',
          }}
        />
      </View>
    </View>
  );
}
