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
  44: { box: 'h-11 w-11', text: 'text-xs' },
  56: { box: 'h-14 w-14', text: 'text-base' },
} as const;

export function Avatar({
  name,
  url,
  size,
}: {
  name: string;
  url: string | null;
  size: keyof typeof SIZES;
}) {
  const [failed, setFailed] = useState(false);
  const { box, text } = SIZES[size];

  return url && !failed ? (
    <Image
      source={{ uri: url }}
      onError={() => setFailed(true)}
      className={`${box} rounded-full bg-[#EDE7F6]`}
      accessibilityIgnoresInvertColors
    />
  ) : (
    <View className={`${box} items-center justify-center rounded-full bg-[#EDE7F6]`}>
      <Text className={`font-inter-bold ${text} text-[#7E57C2]`}>{initials(name)}</Text>
    </View>
  );
}
