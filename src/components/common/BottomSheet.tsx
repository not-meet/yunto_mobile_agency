import { X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Bottom sheet frame (the lead's sheets, the date-occupied prompt): grabber, title and
// close button over the content. Slides up over a dimmed backdrop that closes it on tap, and
// shrinks to stay above the keyboard when a field in it is focused. The backdrop sits behind the
// sheet rather than around it, so scrolling inside the sheet never has to win a touch from it.

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  // Left out, the sheet is just the grabber over the content (the content carries its own heading).
  title?: string;
  children: ReactNode;
}

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <Pressable
          onPress={onClose}
          accessibilityLabel="Close"
          className="absolute inset-0 bg-black/30"
        />
        <View
          pointerEvents="box-none"
          className="flex-1 justify-end"
          style={{ paddingTop: insets.top + 24 }}
        >
          <Animated.View
            className="max-h-full"
            style={
              reduceMotion
                ? undefined
                : {
                    animationName: {
                      from: { transform: [{ translateY: 600 }] },
                      to: { transform: [{ translateY: 0 }] },
                    },
                    animationDuration: 320,
                    animationTimingFunction: 'ease-out',
                  }
            }
          >
            <View
              className="max-h-full rounded-t-[32px] bg-white px-6 pt-4"
              style={{ paddingBottom: insets.bottom + 24 }}
            >
              <View className="h-1 w-10 self-center rounded-sm bg-[#E5E5E5]" />

              {title ? (
                <View className="mt-4 flex-row items-start justify-between gap-3 pt-2">
                  <Text
                    accessibilityRole="header"
                    className="flex-1 font-inter-semibold text-2xl leading-[29px] tracking-[-0.52px] text-[#111111]"
                  >
                    {title}
                  </Text>
                  <Pressable
                    onPress={onClose}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    className="h-9 w-9 items-center justify-center rounded-full bg-[#F8F8F8] active:opacity-70"
                  >
                    <X size={20} color="#555555" strokeWidth={1.67} />
                  </Pressable>
                </View>
              ) : null}

              {children}
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
