import '../global.css';

import { Geist_500Medium } from '@expo-google-fonts/geist';
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import { DevRoleSwitcher } from '@/dev/DevRoleSwitcher';
import { useOtaUpdates } from '@/hooks/useOtaUpdates';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  useOtaUpdates();
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Geist_500Medium,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <DevRoleSwitcher>
        <Stack
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F8F5EF' } }}
        />
      </DevRoleSwitcher>
    </QueryClientProvider>
  );
}
