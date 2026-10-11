import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, useReducedMotion } from 'react-native-reanimated';

import { Button } from '@/components/common/Button';

// "Save Changes" under a profile form, shown only once something in it has changed.

interface SaveChangesProps {
  visible: boolean;
  onSave: () => void;
  saving: boolean;
  // What to fix first, e.g. "Add your first name"; null when it can be saved.
  problem: string | null;
  failed: boolean;
}

export function SaveChanges({ visible, onSave, saving, problem, failed }: SaveChangesProps) {
  const reduceMotion = useReducedMotion();
  if (!visible) return null;

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.duration(220)}
      exiting={reduceMotion ? undefined : FadeOut.duration(150)}
      className="gap-3 pt-2"
    >
      {failed ? (
        <Text
          accessibilityLiveRegion="polite"
          className="pl-4 font-inter-medium text-[13px] leading-4 text-rose-500"
        >
          We couldn’t save your changes. Please try again.
        </Text>
      ) : null}
      <View>
        <Button
          label="Save Changes"
          onPress={onSave}
          disabled={problem !== null}
          disabledReason={problem}
          loading={saving}
        />
      </View>
    </Animated.View>
  );
}
