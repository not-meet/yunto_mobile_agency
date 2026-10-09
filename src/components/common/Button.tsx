import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import { showToast } from '@/utils/notifications';

// Full-width pill button. `primary` is the dark CTA, `secondary` the white one used for
// alternate paths (log in, solo influencer). A disabled button with a `disabledReason` still
// looks disabled, but tapping it says what's missing instead of doing nothing.

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  // Trailing icon, e.g. ArrowRight on "Continue".
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  // What to fill in or pick first, e.g. "Pick at least one niche".
  disabledReason?: string | null;
}

const VARIANTS = {
  primary: {
    container: 'bg-cocoa',
    label: 'font-inter-bold tracking-[0.2px] text-snow',
    iconColor: '#FFFCFC',
    textShadow: {
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
  },
  secondary: {
    container: 'bg-white',
    label: 'font-inter-medium tracking-[0.3px] text-muted',
    iconColor: '#787486',
    textShadow: undefined,
  },
} as const;

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  loading = false,
  disabled = false,
  disabledReason = null,
}: ButtonProps) {
  const styles = VARIANTS[variant];
  const inactive = disabled || loading;
  const explains = disabled && !loading && disabledReason !== null;

  return (
    <Pressable
      onPress={explains ? () => showToast(disabledReason) : onPress}
      disabled={inactive && !explains}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={explains ? disabledReason : undefined}
      accessibilityState={{ disabled: inactive, busy: loading }}
      className={`h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80 ${styles.container} ${disabled && !loading ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={styles.iconColor} />
      ) : (
        <>
          <Text className={`text-base leading-[19px] ${styles.label}`} style={styles.textShadow}>
            {label}
          </Text>
          {Icon ? <Icon size={20} color={styles.iconColor} strokeWidth={2} /> : null}
        </>
      )}
    </Pressable>
  );
}
