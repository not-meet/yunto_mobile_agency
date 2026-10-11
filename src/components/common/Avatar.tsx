import { useState } from 'react';
import { Image, Text, View } from 'react-native';

// Round profile photo (the messages panel, direct chats, leads, a lead's creators), falling back to initials when
// there's no photo or it fails to load.

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

const SIZES = {
  24: { box: 'h-6 w-6', text: 'text-[9px]' },
  32: { box: 'h-8 w-8', text: 'text-xs' },
  42: { box: 'h-[42px] w-[42px]', text: 'text-xs' },
  44: { box: 'h-11 w-11', text: 'text-xs' },
  48: { box: 'h-12 w-12', text: 'text-sm' },
  56: { box: 'h-14 w-14', text: 'text-base' },
  60: { box: 'h-[60px] w-[60px]', text: 'text-lg' },
  72: { box: 'h-[72px] w-[72px]', text: 'text-xl' },
  84: { box: 'h-[84px] w-[84px]', text: 'text-2xl' },
} as const;

export function Avatar({
  name,
  url,
  size,
  square = false,
}: {
  name: string;
  url: string | null;
  size: keyof typeof SIZES;
  // A rounded square instead of a circle, e.g. the creator profile's photo.
  square?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const { box, text } = SIZES[size];
  const shape = square ? 'rounded-[20px]' : 'rounded-full';

  return url && !failed ? (
    <Image
      source={{ uri: url }}
      onError={() => setFailed(true)}
      className={`${box} ${shape} bg-[#EDE7F6]`}
      accessibilityIgnoresInvertColors
    />
  ) : (
    <View className={`${box} items-center justify-center ${shape} bg-[#EDE7F6]`}>
      <Text className={`font-inter-bold ${text} text-[#7E57C2]`}>{initials(name)}</Text>
    </View>
  );
}
