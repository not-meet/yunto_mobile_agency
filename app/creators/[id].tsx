import { router, useLocalSearchParams } from 'expo-router';
import { CalendarDays } from 'lucide-react-native';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { Reveal } from '@/components/common/Reveal';
import { CommercialsCard } from '@/components/creators/CommercialsCard';
import { ContactCard } from '@/components/creators/ContactCard';
import { PlatformStatsCard } from '@/components/creators/PlatformStatsCard';
import { ProfileCard } from '@/components/creators/ProfileCard';
import { ProfileSkeleton } from '@/components/creators/ProfileSkeleton';
import { RecentCampaignsCard } from '@/components/creators/RecentCampaignsCard';
import { useCreatorActionsBarClearance } from '@/components/leads/CreatorActionsBar';
import { LeadCreatorProfileActions } from '@/components/leads/LeadCreatorProfileActions';
import { useCreator } from '@/hooks/useCreators';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

// One creator's profile, after the web's: who they are and how to reach them, each platform's
// numbers, their rates, their recent campaigns and contact details. Opened from a creator card or
// the roster with the creator's `id`, and right after inviting someone. The header opens their
// content calendar: "Manage" for the agency's own creators, "View" for anyone else's. Opened from a
// lead's creators (with its `leadId`), the calendar and shortlisting are pinned to the bottom instead.
export default function CreatorProfileScreen() {
  const insets = useSafeAreaInsets();
  const actionsClearance = useCreatorActionsBarClearance();
  const { id, leadId } = useLocalSearchParams<{ id: string; leadId?: string }>();
  const creator = useCreator(id);
  const pull = usePullToRefresh(creator);
  const { data } = creator;

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/creators" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Creator Profile
        </Text>
        {data && !leadId ? (
          <Pressable
            onPress={() => router.push({ pathname: '/creators/calendar', params: { id: data.id } })}
            accessibilityRole="button"
            accessibilityLabel={`${data.rosterStatus === null ? 'View' : 'Manage'} ${data.name}’s calendar`}
            className="h-9 flex-row items-center gap-1.5 rounded-full bg-espresso px-3.5 active:opacity-80"
            style={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)' }}
          >
            <CalendarDays size={14} color="#FFFCFC" strokeWidth={1.75} />
            <Text className="font-inter-semibold text-xs leading-4 text-snow">
              {data.rosterStatus === null ? 'View Calendar' : 'Manage Calendar'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {data ? (
        <>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={pull.refreshing}
                onRefresh={pull.onRefresh}
                colors={['#1F1A17']}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              gap: 16,
              paddingHorizontal: 20,
              paddingTop: 4,
              paddingBottom: leadId ? actionsClearance : insets.bottom + 24,
            }}
          >
            <Reveal order={0}>
              <ProfileCard creator={data} />
            </Reveal>
            {data.platforms.map((stats, i) => (
              <Reveal key={stats.platform} order={i + 1}>
                <PlatformStatsCard stats={stats} />
              </Reveal>
            ))}
            <Reveal order={data.platforms.length + 1}>
              <CommercialsCard
                commercials={data.commercials}
                editable={data.rosterStatus !== null}
              />
            </Reveal>
            <Reveal order={data.platforms.length + 2}>
              <RecentCampaignsCard campaigns={data.recentCampaigns} />
            </Reveal>
            <Reveal order={data.platforms.length + 3}>
              <ContactCard creator={data} />
            </Reveal>
          </ScrollView>
          {leadId ? <LeadCreatorProfileActions leadId={leadId} creatorId={data.id} /> : null}
        </>
      ) : creator.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load this creator.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void creator.refetch()}
              loading={creator.isFetching}
            />
          </View>
        </View>
      ) : (
        <ProfileSkeleton />
      )}
    </View>
  );
}
