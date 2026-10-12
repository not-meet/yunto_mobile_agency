import { Unplug } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { ConfirmSheet } from '@/components/common/ConfirmSheet';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { Reveal } from '@/components/common/Reveal';
import { IntegrationCard } from '@/components/profile/IntegrationCard';
import { FacebookLogo, GoogleAdsLogo, WordPressLogo } from '@/components/profile/IntegrationLogos';
import { useIntegrations, useSetIntegration } from '@/hooks/useIntegrations';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import type { IntegrationProvider } from '@/services/integrationsService';
import { showToast } from '@/utils/notifications';

// "Integrations", opened from the profile: the platforms leads come in from, each to connect or,
// after asking, disconnect. Platforms this version doesn't know aren't shown.

const PROVIDERS: Record<
  IntegrationProvider,
  { name: string; description: string; logo: ReactNode }
> = {
  facebook: {
    name: 'Facebook',
    description: 'Connect Meta Ads to capture leads into your system',
    logo: <FacebookLogo size={34} />,
  },
  'google-ads': {
    name: 'Google Ads',
    description: 'Track lead conversions from your campaigns',
    logo: <GoogleAdsLogo size={34} />,
  },
  wordpress: {
    name: 'WordPress',
    description: 'Sync contact forms and lead pages',
    logo: <WordPressLogo size={34} />,
  },
};

export default function IntegrationsScreen() {
  const insets = useSafeAreaInsets();
  const integrations = useIntegrations();
  const pull = usePullToRefresh(integrations);
  const toggle = useSetIntegration();
  // Asking before disconnecting `disconnecting`. Kept once the sheet closes, so its title doesn't
  // blank out while it fades away.
  const [asking, setAsking] = useState(false);
  const [disconnecting, setDisconnecting] = useState<IntegrationProvider | null>(null);
  const { data } = integrations;

  const set = (provider: IntegrationProvider, connected: boolean) =>
    toggle.mutate(
      { provider, connected },
      {
        onSuccess: () => {
          setAsking(false);
          showToast(`${PROVIDERS[provider].name} ${connected ? 'connected' : 'disconnected'}`);
        },
        onError: () =>
          showToast(
            `We couldn’t ${connected ? 'connect' : 'disconnect'} ${PROVIDERS[provider].name}`,
          ),
      },
    );

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/profile" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Integrations
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
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: insets.bottom + 40,
          }}
        >
          <View className="gap-4 rounded-[28px] border-t border-black/[0.07] bg-white/[0.52] px-1 py-4">
            {data.map(({ provider, connected }, i) =>
              provider === 'UNKNOWN' ? null : (
                <Reveal key={provider} order={i}>
                  <IntegrationCard
                    {...PROVIDERS[provider]}
                    connected={connected}
                    busy={toggle.isPending && toggle.variables?.provider === provider}
                    onToggle={() => {
                      if (!connected) return set(provider, true);
                      setDisconnecting(provider);
                      setAsking(true);
                    }}
                  />
                </Reveal>
              ),
            )}
          </View>
        </ScrollView>
      ) : integrations.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load your integrations.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void integrations.refetch()}
              loading={integrations.isFetching}
            />
          </View>
        </View>
      ) : (
        <ListSkeleton label="Loading integrations" cardHeight={136} withFilters={false} />
      )}

      <ConfirmSheet
        visible={asking}
        onClose={() => setAsking(false)}
        title={`Disconnect ${disconnecting ? PROVIDERS[disconnecting].name : ''}?`}
        message="New leads from it will stop coming in. Leads already captured stay where they are."
        icon={Unplug}
        tone={{ color: '#9B3232', background: '#FFF1F1' }}
        confirmLabel="Disconnect"
        onConfirm={() => {
          if (disconnecting) set(disconnecting, false);
        }}
        busy={toggle.isPending}
      />
    </View>
  );
}
