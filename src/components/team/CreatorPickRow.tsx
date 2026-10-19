import { Check } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/common/Avatar';
import type { AssignableCreator } from '@/services/teamService';

// A creator as a small white card (Unassigned, a member's creators, the assign sheet): photo,
// name, handle and niche. `selected` adds a tick box for picking; `action` a word at the end,
// e.g. "Assign". Not tappable without `onPress`.

interface CreatorPickRowProps {
  creator: AssignableCreator;
  onPress?: () => void;
  selected?: boolean;
  action?: string;
}

export function CreatorPickRow({ creator, onPress, selected, action }: CreatorPickRowProps) {
  const picking = selected !== undefined;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={picking ? 'checkbox' : onPress ? 'button' : undefined}
      accessibilityLabel={`${creator.name}, ${creator.handle}, ${creator.niche}`}
      accessibilityState={picking ? { checked: selected } : undefined}
      className={`flex-row items-center gap-3 rounded-2xl border bg-white p-3 active:opacity-80 ${
        selected ? 'border-[rgba(199,210,254,0.8)]' : 'border-[#F5F5F5]'
      }`}
      style={{ boxShadow: '0px 2px 8px -2px rgba(0, 0, 0, 0.04), 0px 1px 3px rgba(0, 0, 0, 0.02)' }}
    >
      <Avatar name={creator.name} url={creator.avatarUrl} size={42} />
      <View className="flex-1">
        <Text numberOfLines={1} className="font-inter-medium text-sm leading-[18px] text-[#171717]">
          {creator.name}
        </Text>
        <Text numberOfLines={1} className="font-inter text-xs leading-[17px] text-[#A3A3A3]">
          {creator.handle} · {creator.niche}
        </Text>
      </View>
      {action ? (
        <View className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5">
          <Text className="font-inter-medium text-[11px] leading-4 text-[#2563EB]">{action}</Text>
        </View>
      ) : null}
      {picking ? (
        <View
          className={`h-5 w-5 items-center justify-center rounded-md border ${
            selected ? 'border-[#171717] bg-[#171717]' : 'border-[#D4D4D4] bg-white'
          }`}
        >
          {selected ? <Check size={12} color="#FFFFFF" strokeWidth={3} /> : null}
        </View>
      ) : null}
    </Pressable>
  );
}
