import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Reveal } from '@/components/common/Reveal';
import { LogoutPanel } from '@/components/profile/LogoutPanel';
import { useProfile } from '@/hooks/useProfile';
import { useSessionStore } from '@/store/sessionStore';

// "Log Out", opened from the profile: who's signed in and what logging out means, then Log Out
// or Stay Logged In (back to the profile).

export default function LogoutScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const signOut = useSessionStore((s) => s.signOut);
  const { data } = useProfile();

  const logOut = () => {
    signOut();
    // Nothing of this account should show to whoever signs in next.
    queryClient.clear();
    if (router.canDismiss()) router.dismissAll();
    router.replace('/sign-in');
  };

  const stay = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/profile" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Log Out
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: insets.bottom + 40,
        }}
      >
        <Reveal order={0}>
          <LogoutPanel overview={data} onLogOut={logOut} onStay={stay} />
        </Reveal>
      </ScrollView>
    </View>
  );
}
