import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { Reveal } from '@/components/common/Reveal';
import { AddCreatorButton } from '@/components/creators/CreatorsToolbar';
import { InviteCreatorSheet } from '@/components/creators/InviteCreatorSheet';
import { pluralCreators } from '@/components/creators/labels';
import { RosterRow } from '@/components/creators/RosterRow';
import { useCreators } from '@/hooks/useCreators';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { NO_CREATOR_FILTERS } from '@/services/creatorsService';
import { showToast } from '@/utils/notifications';

// The agency's roster, opened from "Add Creator" on the Creators list: everyone on it with
// whether they've joined yet, and "Add Creator" to invite someone new. Once the invite is sent
// their profile opens.

const ROSTER = {
  scope: 'ours',
  query: '',
  sort: 'newest',
  filters: NO_CREATOR_FILTERS,
  listedOnly: false,
  hiddenOnly: false,
} as const;

export default function AddCreatorsScreen() {
  const insets = useSafeAreaInsets();
  const roster = useCreators(ROSTER);
  const pull = usePullToRefresh(roster);
  const [inviting, setInviting] = useState(false);
  const { data } = roster;

  const open = (id: string) => router.push({ pathname: '/creators/[id]', params: { id } });

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/creators" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Add Creators
        </Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={pull.refreshing}
            onRefresh={pull.onRefresh}
            colors={['#1F1A17']}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: insets.bottom + 24 }}
      >
        <Reveal order={0}>
          <View
            className="gap-[18px] overflow-hidden rounded-[28px] border border-black/[0.07] bg-white/50 pb-5"
            style={{
              boxShadow: '0px 12px 40px rgba(130, 110, 200, 0.09), 0px 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <View className="flex-row items-center gap-3 px-5 py-4">
              <View className="flex-1">
                <Text className="font-inter-semibold text-[15px] leading-[22px] tracking-[-0.375px] text-[#111111]">
                  Creator
                </Text>
                <Text className="font-inter-medium text-xs leading-[18px] text-[#888888]">
                  {data ? pluralCreators(data.total) : ' '}
                </Text>
              </View>
              <AddCreatorButton onPress={() => setInviting(true)} />
            </View>

            <View className="gap-3 px-[21px]">
              {data ? (
                data.creators.length > 0 ? (
                  data.creators.map((creator) => (
                    <RosterRow key={creator.id} creator={creator} onOpen={() => open(creator.id)} />
                  ))
                ) : (
                  <Text className="py-8 text-center font-inter-medium text-sm leading-5 text-muted">
                    No creators yet. Invite your first one.
                  </Text>
                )
              ) : roster.isError ? (
                <View className="gap-3 py-4">
                  <Text className="text-center font-inter-medium text-sm leading-5 text-muted">
                    We couldn’t load your roster.
                  </Text>
                  <Button
                    label="Try again"
                    variant="secondary"
                    onPress={() => void roster.refetch()}
                    loading={roster.isFetching}
                  />
                </View>
              ) : (
                <ActivityIndicator color="#1F1A17" className="py-8" />
              )}
            </View>
          </View>
        </Reveal>
      </ScrollView>

      <InviteCreatorSheet
        visible={inviting}
        onClose={() => setInviting(false)}
        onInvited={(creator) => {
          setInviting(false);
          showToast(`Invite sent to ${creator.name}`);
          open(creator.id);
        }}
      />
    </View>
  );
}
