import { Building2, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { MenuCard } from '@/components/common/MenuCard';
import { Reveal } from '@/components/common/Reveal';
import { AgencyForm } from '@/components/profile/AgencyForm';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { useProfile } from '@/hooks/useProfile';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

// "Profile & Agency Info", opened from the profile: the member's own details and the agency's,
// each a card that opens into its form in place.

type Section = 'profile' | 'agency';

export default function ProfileDetailsScreen() {
  const insets = useSafeAreaInsets();
  const profile = useProfile();
  const pull = usePullToRefresh(profile);
  const [open, setOpen] = useState<Section | null>(null);
  const { data } = profile;

  const toggle = (section: Section) => setOpen((current) => (current === section ? null : section));

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/profile" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Profile
        </Text>
      </View>

      {data ? (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={pull.refreshing}
              onRefresh={pull.onRefresh}
              colors={['#1F1A17']}
            />
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            gap: 12,
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: insets.bottom + 40,
          }}
        >
          <Reveal order={0}>
            <MenuCard
              title="Profile Info"
              icon={UserRound}
              tone={{ color: '#9333EA', background: '#F3E8FF' }}
              expanded={open === 'profile'}
              onPress={() => toggle('profile')}
            >
              <ProfileForm profile={data.profile} />
            </MenuCard>
          </Reveal>
          <Reveal order={1}>
            <MenuCard
              title="Agency Info"
              icon={Building2}
              tone={{ color: '#2563EB', background: '#DBEAFE' }}
              expanded={open === 'agency'}
              onPress={() => toggle('agency')}
            >
              <AgencyForm agency={data.agency} />
            </MenuCard>
          </Reveal>
        </ScrollView>
      ) : profile.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load your details.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void profile.refetch()}
              loading={profile.isFetching}
            />
          </View>
        </View>
      ) : (
        <ProfileSkeleton rowsOnly />
      )}
    </View>
  );
}
