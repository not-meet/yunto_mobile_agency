import { Pressable, Share, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePressScale } from '@/hooks/usePressScale';
import type { Creator } from '@/services/creatorsService';
import { formatCount } from '@/utils/format';
import { showToast } from '@/utils/notifications';

// Floating "Share Selected Creators" pill at the bottom of the Creators list: opens the share
// sheet with each picked creator's name, reach and profile link. The list pads itself with
// useShareCreatorsClearance().

const HEIGHT = 54;
const GAP_BELOW = 16;

export function useShareCreatorsClearance(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + GAP_BELOW + HEIGHT + 16;
}

function shareMessage(creators: Creator[]): string {
  return creators
    .map(
      (c) =>
        `${c.name} (${c.handle}) · ${c.niche}\n${formatCount(c.followers)} followers · ${
          c.engagementRate
        }% engagement\n${c.profileUrl}`,
    )
    .join('\n\n');
}

export function ShareCreatorsButton({ creators }: { creators: Creator[] }) {
  const insets = useSafeAreaInsets();
  const press = usePressScale();
  const none = creators.length === 0;

  const share = () => {
    if (none) {
      showToast('Select creators to share first');
      return;
    }
    Share.share({ message: shareMessage(creators) }).catch(() =>
      showToast('Couldn’t open the share sheet'),
    );
  };

  return (
    <Animated.View
      style={[press.style, { bottom: insets.bottom + GAP_BELOW }]}
      className="absolute left-6 right-6"
    >
      <Pressable
        {...press.handlers}
        onPress={share}
        accessibilityRole="button"
        accessibilityLabel="Share Selected Creators"
        accessibilityState={{ disabled: none }}
        className={`items-center justify-center rounded-full bg-cocoa ${none ? 'opacity-60' : ''}`}
        style={{ height: HEIGHT, boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)' }}
      >
        <Text className="font-inter-semibold text-[15px] leading-[22px] text-white">
          Share Selected Creators
        </Text>
      </Pressable>
    </Animated.View>
  );
}
