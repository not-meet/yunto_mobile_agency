import { Fragment } from 'react';
import { Text, View } from 'react-native';

import type { CalendarPost } from '@/services/creatorCalendarService';

// The month at a glance above the creator calendar, as on the web: how many pieces, how many are
// scheduled or still drafts, and how many days carry a brand collab.

export function CalendarSummary({ posts }: { posts: CalendarPost[] }) {
  const collabDays = new Set(posts.filter((p) => p.brand !== null).map((p) => p.date)).size;
  const stats = [
    { label: 'Pieces', value: posts.length, color: '#141311' },
    {
      label: 'Scheduled',
      value: posts.filter((p) => p.status === 'scheduled').length,
      color: '#3E7D52',
    },
    { label: 'Drafts', value: posts.filter((p) => p.status === 'draft').length, color: '#B7791F' },
    { label: 'Collab Days', value: collabDays, color: '#059669' },
  ];

  return (
    <View
      className="flex-row items-center rounded-2xl border border-white/70 bg-white/55 p-2.5"
      style={{ boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)' }}
    >
      {stats.map((stat, i) => (
        <Fragment key={stat.label}>
          {i > 0 ? <View className="h-6 w-px bg-[rgba(20,19,17,0.06)]" /> : null}
          <View
            accessible
            accessibilityLabel={`${stat.label}, ${stat.value}`}
            className="flex-1 items-center"
          >
            <Text className="font-inter text-[9px] uppercase leading-[14px] tracking-[0.45px] text-[#8C8A84]">
              {stat.label}
            </Text>
            <Text className="font-inter-extrabold text-sm leading-5" style={{ color: stat.color }}>
              {stat.value}
            </Text>
          </View>
        </Fragment>
      ))}
    </View>
  );
}
