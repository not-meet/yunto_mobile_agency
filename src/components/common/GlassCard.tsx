import type { ReactNode } from 'react';
import { View } from 'react-native';

// Frosted white card with a faint status tint washed over it from the top-left.
export function GlassCard({ tint, children }: { tint: string; children: ReactNode }) {
  return (
    <View
      className="rounded-3xl border border-white p-5"
      style={{
        experimental_backgroundImage:
          'linear-gradient(144.8deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.5) 100%)',
        boxShadow:
          '0px 10px 30px rgba(0, 0, 0, 0.03), inset 0px 2px 4px 1px rgba(255, 255, 255, 0.8)',
      }}
    >
      <View
        pointerEvents="none"
        className="absolute inset-px rounded-3xl opacity-30"
        style={{
          experimental_backgroundImage: `linear-gradient(134.79deg, ${tint} 0%, transparent 100%)`,
        }}
      />
      {children}
    </View>
  );
}
