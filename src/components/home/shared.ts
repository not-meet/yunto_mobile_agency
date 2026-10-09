import { ToastAndroid } from 'react-native';

// Bits the home cards share.

export const CARD_SHADOW = '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)';

// Soft glow blob some cards carry in a corner.
export const GLOW = { filter: 'blur(12px)' } as const;

// For taps whose destination screen doesn't exist yet.
export function comingSoon(what: string) {
  ToastAndroid.show(`${what} is coming soon`, ToastAndroid.SHORT);
}
