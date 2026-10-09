import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { AuthScreen } from '@/components/auth/AuthScreen';
import { SignInCard } from '@/components/sign-in/SignInCard';

export default function SignInScreen() {
  return (
    <AuthScreen className="gap-[11px] px-5">
      <SignInCard />

      <View className="flex-row items-center justify-center gap-1.5 pt-[13px]">
        <Text className="font-inter-medium text-[13px] leading-5 text-black/[0.38]">
          Don&apos;t have an account?
        </Text>
        <Text
          onPress={() => router.push('/sign-up')}
          suppressHighlighting
          accessibilityRole="link"
          className="font-inter-bold text-[13px] leading-5 text-periwinkle/85"
        >
          Sign up
        </Text>
      </View>

      <Text className="text-center font-inter-medium text-[11px] leading-[18px] text-black/[0.28]">
        By continuing you agree to our Terms and Privacy Policy
      </Text>
    </AuthScreen>
  );
}
