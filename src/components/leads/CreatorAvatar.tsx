import { View } from 'react-native';

import { Avatar } from '@/components/common/Avatar';
import { CREATOR_PLATFORM_ICONS } from '@/components/leads/labels';
import type { CreatorPlatform } from '@/services/leadCreatorsService';

// A creator's photo in a white ring, with their platform's logo pinned to the bottom-right.

const SIZES = {
  44: { badge: 'h-4 w-4 -bottom-0.5 -right-0.5', icon: 8 },
  56: { badge: 'h-5 w-5 -bottom-1 -right-1', icon: 10 },
} as const;

interface CreatorAvatarProps {
  name: string;
  url: string | null;
  platform: CreatorPlatform;
  size: keyof typeof SIZES;
}

export function CreatorAvatar({ name, url, platform, size }: CreatorAvatarProps) {
  const { badge, icon } = SIZES[size];
  const PlatformIcon = CREATOR_PLATFORM_ICONS[platform];

  return (
    <View>
      <View
        className="rounded-full border-2 border-white"
        style={{
          boxShadow:
            size === 56
              ? '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)'
              : '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Avatar name={name} url={url} size={size} />
      </View>
      {PlatformIcon ? (
        <View
          className={`absolute ${badge} items-center justify-center rounded-full bg-white`}
          style={{
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          <PlatformIcon size={icon} color="#141311" />
        </View>
      ) : null}
    </View>
  );
}
