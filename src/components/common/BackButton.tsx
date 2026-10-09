import { router, type Href } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable } from 'react-native';

interface BackButtonProps {
  // Where to go when there's no history, e.g. the screen was opened directly.
  fallbackHref?: Href;
  // 40 by default; the talent screens use the larger 44.
  size?: 40 | 44;
  // "dark": the smaller solid espresso button the leads screens use (ignores `size`).
  tone?: 'glass' | 'dark';
}

export function BackButton({ fallbackHref = '/', size = 40, tone = 'glass' }: BackButtonProps) {
  const dark = tone === 'dark';
  const box = dark ? 'h-9 w-9' : size === 44 ? 'h-11 w-11' : 'h-10 w-10';

  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace(fallbackHref))}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      className={`${box} items-center justify-center rounded-full active:opacity-70 ${
        dark ? 'bg-espresso' : 'border border-white/80 bg-white/60'
      }`}
      style={{
        boxShadow: dark
          ? '0px 0.9px 2.7px rgba(0, 0, 0, 0.1), 0px 0.9px 1.8px -0.9px rgba(0, 0, 0, 0.1)'
          : '0px 4px 12px rgba(0, 0, 0, 0.03)',
      }}
    >
      {dark ? (
        <ArrowLeft size={16} color="#FAF7F2" strokeWidth={1.67} />
      ) : (
        <ArrowLeft size={20} color="#1A1820" strokeWidth={1.67} />
      )}
    </Pressable>
  );
}
