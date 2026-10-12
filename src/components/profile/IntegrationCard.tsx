import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { CARD_SHADOW } from '@/components/home/shared';

// One platform on the Integrations screen: its logo, name and what it brings in, then a button
// to connect it (or disconnect it once it is) beside where it stands.

interface IntegrationCardProps {
  name: string;
  description: string;
  logo: ReactNode;
  connected: boolean;
  busy: boolean;
  onToggle: () => void;
}

export function IntegrationCard({
  name,
  description,
  logo,
  connected,
  busy,
  onToggle,
}: IntegrationCardProps) {
  const action = connected ? 'Disconnect' : 'Connect';

  return (
    <View
      className="flex-row gap-4 rounded-3xl border border-white bg-white/70 py-[18px] pl-4 pr-5"
      style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)' }}
    >
      <View className="h-[34px] w-[34px] items-center justify-center">{logo}</View>
      <View className="flex-1">
        <Text
          accessibilityRole="header"
          className="font-inter-semibold text-[15px] leading-[22px] tracking-[-0.375px] text-[#111111]"
        >
          {name}
        </Text>
        <Text className="mt-2 font-inter-medium text-xs leading-[18px] text-[#999999]">
          {description}
        </Text>
        <View className="mt-2.5 flex-row items-center gap-3">
          <Pressable
            onPress={onToggle}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={`${action} ${name}`}
            accessibilityState={{ busy, disabled: busy }}
            className={`h-7 min-w-[73px] items-center justify-center rounded-full px-3 active:opacity-80 ${
              connected ? 'border border-[#E3E3E3] bg-white' : 'bg-[#111111]'
            }`}
            style={{ boxShadow: CARD_SHADOW }}
          >
            {busy ? (
              <ActivityIndicator size="small" color={connected ? '#111111' : '#F4F6F8'} />
            ) : (
              <Text
                className={`font-inter-medium text-xs leading-4 ${
                  connected ? 'text-[#111111]' : 'text-[#F4F6F8]'
                }`}
              >
                {action}
              </Text>
            )}
          </Pressable>
          <View className="flex-row items-center gap-1.5">
            {connected ? <View className="h-1.5 w-1.5 rounded-full bg-[#05DF72]" /> : null}
            <Text
              className={`font-geist-medium text-[10px] leading-6 ${
                connected ? 'text-[#00A63E]' : 'text-black/70'
              }`}
            >
              {connected ? 'Connected' : 'Not Connected'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
