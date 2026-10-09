import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, ToastAndroid } from 'react-native';

// Full-width gradient pill CTA. `violet` is sign in's, `indigo` the agency screens'.
// A disabled button with a `disabledReason` still looks disabled, but tapping it says what's
// missing instead of doing nothing.

const VARIANTS = {
  violet: {
    container: 'h-[54px]',
    label: 'text-[15px] leading-[22px]',
    style: {
      experimental_backgroundImage:
        'linear-gradient(100.83deg, #9B8FFF 0%, #7B6EE8 50%, #6558CC 100%)',
      boxShadow: '0px 8px 24px rgba(101, 88, 204, 0.28), 0px 2px 8px rgba(0, 0, 0, 0.06)',
    },
  },
  indigo: {
    container: 'h-[52px]',
    label: 'text-sm leading-5',
    style: {
      experimental_backgroundImage: 'linear-gradient(100.34deg, #6366F1 0%, #8B5CF6 100%)',
      boxShadow:
        '0px 6px 20px rgba(99, 102, 241, 0.35), inset 0px 1px 0px rgba(255, 255, 255, 0.15)',
    },
  },
} as const;

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  variant: keyof typeof VARIANTS;
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

export function GradientButton({
  label,
  onPress,
  variant,
  leadingIcon: Leading,
  trailingIcon: Trailing,
  loading = false,
  disabled = false,
  disabledReason,
}: GradientButtonProps) {
  const styles = VARIANTS[variant];
  const explains = disabled && !loading && disabledReason !== undefined;
  const iconSize = variant === 'violet' ? 17 : 16;

  return (
    <Pressable
      onPress={explains ? () => ToastAndroid.show(disabledReason, ToastAndroid.SHORT) : onPress}
      disabled={(disabled || loading) && !explains}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={explains ? disabledReason : undefined}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      className={`flex-row items-center justify-center gap-2 rounded-full active:opacity-85 ${styles.container} ${disabled && !loading ? 'opacity-50' : ''}`}
      style={styles.style}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          {Leading ? <Leading size={iconSize} color="#FFFFFF" strokeWidth={2} /> : null}
          <Text className={`font-inter-semibold text-white ${styles.label}`}>{label}</Text>
          {Trailing ? <Trailing size={iconSize} color="#FFFFFF" strokeWidth={2} /> : null}
        </>
      )}
    </Pressable>
  );
}
