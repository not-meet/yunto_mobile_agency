import type { ReactNode } from 'react';
import { View } from 'react-native';

// Frosted card holding the agency screens' fields and CTA.
export function GlassPanel({ children }: { children: ReactNode }) {
  return (
    <View
      className="gap-4 rounded-[28px] border border-white/70 bg-white/45 px-5 py-6"
      style={{
        boxShadow:
          '0px 4px 32px rgba(130, 100, 255, 0.07), inset 0px 1px 0px 1px rgba(255, 255, 255, 0.8)',
      }}
    >
      {children}
    </View>
  );
}
