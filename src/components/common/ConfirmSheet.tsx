import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';

// A yes/no prompt in the app's bottom sheet (confirming a talent, marking a campaign converted),
// used instead of the system alert. The sheet stays open while `busy`, so the caller closes it
// once the action succeeds.

interface ConfirmSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon: LucideIcon;
  // Icon colour, with a soft tint of it behind.
  tone: { color: string; background: string };
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  busy?: boolean;
  // Shown above the buttons when the action failed.
  error?: string | null;
  // Extra content under the message, e.g. a list of what's pending.
  children?: ReactNode;
}

export function ConfirmSheet({
  visible,
  onClose,
  title,
  message,
  icon: Icon,
  tone,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  busy = false,
  error = null,
  children,
}: ConfirmSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={busy ? () => {} : onClose} title={title}>
      <View className="mt-6 items-center gap-4">
        <View
          className="h-16 w-16 items-center justify-center rounded-[22px] border border-white/90"
          style={{
            backgroundColor: tone.background,
            boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Icon size={28} color={tone.color} strokeWidth={1.67} />
        </View>
        <Text className="max-w-[300px] text-center font-inter-medium text-[15px] leading-6 text-black/50">
          {message}
        </Text>
      </View>

      {children ? <View className="mt-5">{children}</View> : null}

      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-4 text-center font-inter-medium text-[13px] leading-4 text-rose-500"
        >
          {error}
        </Text>
      ) : null}

      <View className="mt-7 flex-row gap-3">
        <Pressable
          onPress={onClose}
          disabled={busy}
          accessibilityRole="button"
          className="h-[51px] flex-1 items-center justify-center rounded-3xl border border-[#E3E3E3] bg-white/60 active:opacity-70"
        >
          <Text className="font-inter-medium text-sm leading-[17px] text-espresso">
            {cancelLabel}
          </Text>
        </Pressable>
        <Pressable
          onPress={onConfirm}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={confirmLabel}
          accessibilityState={{ busy }}
          className="h-[51px] flex-1 items-center justify-center rounded-3xl bg-cocoa active:opacity-80"
          style={{ boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.1)' }}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-inter-medium text-sm leading-[17px] text-white">
              {confirmLabel}
            </Text>
          )}
        </Pressable>
      </View>
    </BottomSheet>
  );
}
