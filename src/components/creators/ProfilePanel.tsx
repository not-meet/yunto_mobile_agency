import type { ReactNode } from 'react';
import { View } from 'react-native';

// Frosted card the creator profile is built from, with a soft colour glow in its top-right
// corner (`glow` is an rgb triple, e.g. "215, 205, 255").
export function ProfilePanel({ glow, children }: { glow: string; children: ReactNode }) {
  return (
    <View
      className="overflow-hidden rounded-[28px] border border-black/[0.07] bg-white/50"
      style={{
        boxShadow: '0px 12px 40px rgba(130, 110, 200, 0.09), 0px 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <View
        pointerEvents="none"
        className="absolute right-px top-px h-40 w-40 rounded-[28px]"
        style={{
          experimental_backgroundImage: `radial-gradient(141.42% 141.42% at 100% 0%, rgba(${glow}, 0.4) 0%, rgba(${glow}, 0) 65%)`,
        }}
      />
      {children}
    </View>
  );
}
