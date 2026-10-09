import { ArrowRight, Lock, Mail, User } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, Text, ToastAndroid, View, type TextInput } from 'react-native';

import { GradientButton } from '@/components/auth/GradientButton';
import { GoogleIcon } from '@/components/sign-in/GoogleIcon';
import { SignInField } from '@/components/sign-in/SignInField';
import { useGoogleSignIn, useSignIn } from '@/hooks/useAuth';
import { signInRequestSchema } from '@/services/authService';

// The frosted sign in card: heading, name/email/password, the CTA and Google sign in.

const CORNER_GLOWS = {
  topRight:
    'radial-gradient(141.42% 141.42% at 100% 0%, rgba(215, 205, 255, 0.4) 0%, rgba(215, 205, 255, 0) 65%)',
  bottomLeft:
    'radial-gradient(141.42% 141.42% at 0% 100%, rgba(210, 235, 255, 0.35) 0%, rgba(210, 235, 255, 0) 65%)',
};

export function SignInCard() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const signIn = useSignIn();
  const google = useGoogleSignIn();
  const busy = signIn.isPending || google.isPending;

  const form = { fullName, email, password };
  const isValid = signInRequestSchema.safeParse(form).success;
  const missing = !fullName.trim()
    ? 'Enter your full name'
    : !signInRequestSchema.shape.email.safeParse(email).success
      ? 'Enter a valid work email'
      : 'Enter your password';

  const submit = () => {
    if (isValid && !busy) signIn.mutate(form);
  };

  return (
    <View
      className="overflow-hidden rounded-[32px] border border-white/90 bg-white/60"
      style={{
        boxShadow: '0px 20px 60px rgba(130, 110, 200, 0.11), 0px 4px 16px rgba(0, 0, 0, 0.04)',
      }}
    >
      <View
        pointerEvents="none"
        className="absolute right-0 top-0 h-48 w-48"
        style={{ experimental_backgroundImage: CORNER_GLOWS.topRight }}
      />
      <View
        pointerEvents="none"
        className="absolute bottom-0 left-0 h-40 w-40"
        style={{ experimental_backgroundImage: CORNER_GLOWS.bottomLeft }}
      />

      <View className="gap-5 px-6 pb-7 pt-[27px]">
        <View className="gap-[3px]">
          <Text
            accessibilityRole="header"
            className="font-inter-semibold text-[26px] leading-8 tracking-[-0.65px] text-ink"
          >
            Welcome back
          </Text>
          <Text className="font-inter-medium text-[13px] leading-5 text-black/40">
            Sign in to your agency account
          </Text>
        </View>

        <View className="gap-3 pt-1">
          <SignInField
            label="Full Name"
            icon={User}
            tint="lilac"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => emailRef.current?.focus()}
            editable={!busy}
          />
          <SignInField
            ref={emailRef}
            label="Work Email"
            icon={Mail}
            tint="sky"
            value={email}
            onChangeText={(text) => setEmail(text.trim())}
            placeholder="you@agency.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
            editable={!busy}
          />
          <SignInField
            ref={passwordRef}
            label="Password"
            icon={Lock}
            tint="rose"
            secure
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            autoCapitalize="none"
            autoComplete="current-password"
            returnKeyType="done"
            onSubmitEditing={submit}
            editable={!busy}
          />
          <View className="flex-row justify-end">
            <Pressable
              onPress={() => ToastAndroid.show('Password reset is coming soon', ToastAndroid.SHORT)}
              hitSlop={8}
              accessibilityRole="link"
            >
              <Text className="font-inter-semibold text-xs leading-[18px] text-periwinkle/75">
                Forgot password?
              </Text>
            </Pressable>
          </View>
        </View>

        <GradientButton
          variant="violet"
          label="Continue"
          trailingIcon={ArrowRight}
          onPress={submit}
          loading={signIn.isPending}
          disabled={!isValid}
          disabledReason={missing}
        />

        <View className="flex-row items-center gap-3">
          <View className="h-px flex-1 bg-black/[0.07]" />
          <Text className="font-inter-semibold text-xs uppercase leading-[18px] tracking-[1.2px] text-black/30">
            or
          </Text>
          <View className="h-px flex-1 bg-black/[0.07]" />
        </View>

        <Pressable
          onPress={() => google.mutate()}
          disabled={busy}
          accessibilityRole="button"
          accessibilityState={{ busy: google.isPending }}
          className="h-[51px] flex-row items-center justify-center gap-3 rounded-full border border-black/[0.08] bg-white/70 active:opacity-80"
          style={{ boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.04)' }}
        >
          <View
            className="h-5 w-5 items-center justify-center rounded-full bg-white"
            style={{ boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)' }}
          >
            <GoogleIcon />
          </View>
          <Text className="font-inter-semibold text-sm leading-[21px] text-black/65">
            {google.isPending ? 'Signing in…' : 'Continue with Google'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
