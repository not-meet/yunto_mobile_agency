import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { roleSchema } from '@/services/authService';
import { useSessionStore } from '@/store/sessionStore';
import { DEV_TOOLS_ENABLED } from '@/utils/constants';

// Dev only: a small pill pinned to the top of every screen that cycles the session role, so the
// role-based screens can be checked without signing in as each role. Renders nothing extra in
// release builds unless EXPO_PUBLIC_DEV_TOOLS=true (set for the `preview` profile in eas.json). Delete this file and its wrapper in app/_layout.tsx once roles come from the API.

const ROLES = roleSchema.options;

export function DevRoleSwitcher({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const role = useSessionStore((s) => s.role);
  const setRole = useSessionStore((s) => s.setRole);

  if (!DEV_TOOLS_ENABLED) return children;

  const next = ROLES[(ROLES.indexOf(role) + 1) % ROLES.length] ?? 'admin';

  return (
    <View className="flex-1">
      {children}
      <Pressable
        onPress={() => setRole(next)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Dev: switch role to ${next}`}
        className="absolute self-center rounded-full bg-black/70 px-2.5 py-0.5 active:opacity-70"
        style={{ top: insets.top + 4 }}
      >
        <Text className="font-inter-semibold text-[10px] uppercase tracking-[0.5px] text-white">
          dev · {role}
        </Text>
      </Pressable>
    </View>
  );
}
