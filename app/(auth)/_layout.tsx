import { Stack } from 'expo-router';

// Onboarding screens: sign in, then generate or enter an agency code.
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F8F5EF' } }} />
  );
}
