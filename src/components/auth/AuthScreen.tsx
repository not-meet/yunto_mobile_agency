import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Shell for the onboarding screens: safe-area padding and a scrollable body, vertically
// centred while it fits, that rides above the keyboard. The backdrop comes from
// app/(auth)/_layout.tsx.

interface AuthScreenProps {
  children: ReactNode;
  // Side padding and gap between sections, which differ per screen in the designs.
  className?: string;
}

export function AuthScreen({ children, className = '' }: AuthScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName={`grow justify-center ${className}`}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
