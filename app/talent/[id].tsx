import { router, useLocalSearchParams } from 'expo-router';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import {
  bookingTargetParams,
  parseBookingTarget,
  parseTalentRole,
  ROLE_LABELS,
} from '@/components/talent/labels';
import { TalentHeader } from '@/components/talent/TalentHeader';
import { TalentProfile } from '@/components/talent/TalentProfile';
import {
  PROFILE_ACTIONS_HEIGHT,
  TalentProfileActions,
} from '@/components/talent/TalentProfileActions';
import { TalentProfileSkeleton } from '@/components/talent/TalentSkeletons';
import { useTalent } from '@/hooks/useTalents';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { selectionKey, useTalentStore } from '@/store/talentStore';
import { dayMonth } from '@/utils/dates';
import { showToast } from '@/utils/notifications';

// A videographer's or editor's full profile, opened from the browse deck with the talent's
// `id`, their `role` and the `leadId` or `campaignId` they'd be booked for.

export default function TalentProfileScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id: string;
    role?: string;
    leadId?: string;
    campaignId?: string;
  }>();
  const target = parseBookingTarget(params);
  const talent = useTalent(params.id);
  const pull = usePullToRefresh(talent);
  const { data } = talent;
  const role = data?.role ?? parseTalentRole(params.role);
  const state = useTalentStore((s) => s.state);
  const tier = useTalentStore((s) => s.tier);
  const selectedId = useTalentStore((s) =>
    target ? s.selections[selectionKey(target.id, role)]?.id : undefined,
  );
  const deselect = useTalentStore((s) => s.deselect);

  const skip = () =>
    router.canGoBack()
      ? router.back()
      : router.replace({ pathname: '/talent', params: { role, ...bookingTargetParams(target) } });

  return (
    <View className="flex-1 bg-[#FAF9F6]" style={{ paddingTop: insets.top }}>
      <TalentHeader
        title={ROLE_LABELS[role].plural}
        context={`${dayMonth(new Date())} | ${state}`}
      />

      {data ? (
        <>
          <ScrollView
            refreshControl={<RefreshControl {...pull} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + PROFILE_ACTIONS_HEIGHT + 16,
            }}
          >
            <TalentProfile talent={data} tier={tier} />
          </ScrollView>
          <TalentProfileActions
            name={data.name}
            selected={selectedId === data.id}
            canSelect={target !== null}
            onSkip={skip}
            onSelect={() => {
              if (!target) return;
              // Selected once the booking is confirmed.
              router.push({
                pathname: '/talent/book',
                params: { id: data.id, role, ...bookingTargetParams(target) },
              });
            }}
            onDeselect={() => {
              if (!target) return;
              deselect(target.id, role);
              showToast(`${data.name} removed`);
            }}
          />
        </>
      ) : talent.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load this profile.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void talent.refetch()}
              loading={talent.isFetching}
            />
          </View>
        </View>
      ) : (
        <TalentProfileSkeleton />
      )}
    </View>
  );
}
