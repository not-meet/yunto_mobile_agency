import { EllipsisVertical } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View, type ViewStyle } from 'react-native';

import { Avatar } from '@/components/common/Avatar';
import { DropdownMenu } from '@/components/common/DropdownMenu';
import { callNumber, openWhatsApp } from '@/components/leads/contact';
import type { Creator, RosterStatus } from '@/services/creatorsService';

// One creator on the Add Creators roster: photo, name and handle, whether they've joined or are
// still invited, and a menu of quick actions. Tap the row to open their profile.

const STATUS_STYLES: Record<
  RosterStatus,
  { label: string; background: string; border: string; dot: string; text: string }
> = {
  active: {
    label: 'Active',
    background: 'rgba(240, 253, 244, 0.6)',
    border: '#7BF1A8',
    dot: '#05DF72',
    text: '#00A63E',
  },
  invited: {
    label: 'Invite Sent',
    background: '#E5ECFF',
    border: '#6990FD',
    dot: '#1D4ED8',
    text: '#1D4ED8',
  },
  UNKNOWN: {
    label: 'Other',
    background: '#F4F1EC',
    border: '#E8E2D9',
    dot: '#8C8A84',
    text: '#8C8A84',
  },
};

type MenuAction = 'profile' | 'call' | 'whatsapp';
const MENU: { value: MenuAction; label: string }[] = [
  { value: 'profile', label: 'View Profile' },
  { value: 'call', label: 'Call' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

interface RosterRowProps {
  creator: Creator;
  onOpen: () => void;
}

export function RosterRow({ creator, onOpen }: RosterRowProps) {
  const { width } = useWindowDimensions();
  const kebab = useRef<View>(null);
  const [menu, setMenu] = useState<ViewStyle | null>(null);
  const status = STATUS_STYLES[creator.rosterStatus ?? 'UNKNOWN'];

  // Opens the menu just under the dots, lined up with their right edge.
  const openMenu = () =>
    kebab.current?.measureInWindow((x, y, w, h) =>
      setMenu({ top: y + h + 8, right: Math.max(16, width - x - w) }),
    );

  const act = (action: MenuAction) => {
    if (action === 'profile') onOpen();
    else if (action === 'call') callNumber(creator.phone, creator.name);
    else openWhatsApp(creator.phone, creator.name);
  };

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`${creator.name}, ${creator.handle}, ${status.label}`}
      accessibilityHint="Opens the creator's profile"
      className="flex-row items-center gap-3 rounded-3xl border border-white bg-white/70 py-4 pl-5 pr-3 active:opacity-80"
      style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)' }}
    >
      <Avatar name={creator.name} url={creator.avatarUrl} size={42} />
      <View className="flex-1">
        <Text
          numberOfLines={1}
          className="font-inter-semibold text-[15px] leading-[22px] tracking-[-0.375px] text-[#111111]"
        >
          {creator.name}
        </Text>
        <Text numberOfLines={1} className="font-inter-medium text-xs leading-[18px] text-[#999999]">
          {creator.handle}
        </Text>
      </View>
      <View
        className="flex-row items-center gap-1 rounded-full border py-1 pl-[9px] pr-3"
        style={{ backgroundColor: status.background, borderColor: status.border }}
      >
        <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
        <Text className="font-inter-medium text-[10px] leading-4" style={{ color: status.text }}>
          {status.label}
        </Text>
      </View>
      <Pressable
        ref={kebab}
        onPress={openMenu}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={`More for ${creator.name}`}
        accessibilityState={{ expanded: menu !== null }}
        className="h-4 w-4 items-center justify-center active:opacity-60"
      >
        <EllipsisVertical size={16} color="#64748B" strokeWidth={2} />
      </Pressable>

      <DropdownMenu
        visible={menu !== null}
        onClose={() => setMenu(null)}
        options={MENU}
        onSelect={act}
        position={menu ?? {}}
        label={`Actions for ${creator.name}`}
      />
    </Pressable>
  );
}
