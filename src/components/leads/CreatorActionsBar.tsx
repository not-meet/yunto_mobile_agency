import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePressScale } from '@/hooks/usePressScale';

// Floating glass bar of pill buttons at the bottom of a lead's creators screens. It floats over
// the content, so the screen pads its list with useCreatorActionsBarClearance().

const BAR_HEIGHT = 62;
const GAP_BELOW = 24;

export function useCreatorActionsBarClearance(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + GAP_BELOW + BAR_HEIGHT + 16;
}

export interface CreatorAction {
  label: string;
  background: string;
  onPress: () => void;
  // Takes the bar's spare width; otherwise sized to `width`.
  grow?: boolean;
  width?: number;
  disabled?: boolean;
  busy?: boolean;
}

function ActionButton({ action, height }: { action: CreatorAction; height: number }) {
  const press = usePressScale();
  const disabled = action.disabled || action.busy;

  return (
    <Animated.View
      style={[press.style, action.grow ? null : { width: action.width }]}
      className={action.grow ? 'flex-1' : undefined}
    >
      <Pressable
        {...press.handlers}
        onPress={action.onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={action.label}
        accessibilityState={{ disabled, busy: action.busy }}
        className={`items-center justify-center rounded-full ${action.disabled ? 'opacity-50' : ''}`}
        style={{
          height,
          backgroundColor: action.background,
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        }}
      >
        {action.busy ? (
          <ActivityIndicator size="small" color="#141311" />
        ) : (
          <Text className="text-center font-inter-bold text-xs leading-4 text-[#141311]">
            {action.label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

interface CreatorActionsBarProps {
  actions: CreatorAction[];
  // Button height: 36 on the list, 40 on a creator.
  buttonHeight: 36 | 40;
}

export function CreatorActionsBar({ actions, buttonHeight }: CreatorActionsBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute left-4 right-4 flex-row items-center gap-2 rounded-[28px] border border-white/60 bg-white/90"
      style={{
        bottom: insets.bottom + GAP_BELOW,
        height: BAR_HEIGHT,
        paddingHorizontal: buttonHeight === 36 ? 12 : 10,
        boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.08)',
      }}
    >
      {actions.map((action) => (
        <ActionButton key={action.label} action={action} height={buttonHeight} />
      ))}
    </View>
  );
}
