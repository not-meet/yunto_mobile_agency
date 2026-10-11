import { EllipsisVertical } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View, type ViewStyle } from 'react-native';

import { Avatar } from '@/components/common/Avatar';
import { DropdownMenu } from '@/components/common/DropdownMenu';
import { CARD_SHADOW } from '@/components/home/shared';
import { StatusPill } from '@/components/team/StatusPill';
import type { Member } from '@/services/teamService';

// A member as a rounded pill (a team's members, the top of their leads and their details):
// photo, name and a line under it, whether they're in today, and an optional ⋮ menu.

interface MemberRowProps<T extends string> {
  member: Member;
  subtitle: string;
  // 48 on the member's own screens, 44 in a list.
  size?: 44 | 48;
  onOpen?: () => void;
  menu?: { options: readonly { value: T; label: string }[]; onSelect: (action: T) => void };
}

export function MemberRow<T extends string>({
  member,
  subtitle,
  size = 44,
  onOpen,
  menu,
}: MemberRowProps<T>) {
  const { width } = useWindowDimensions();
  const kebab = useRef<View>(null);
  const [position, setPosition] = useState<ViewStyle | null>(null);
  const large = size === 48;

  // Opens the menu just under the dots, lined up with their right edge.
  const openMenu = () =>
    kebab.current?.measureInWindow((x, y, w, h) =>
      setPosition({ top: y + h + 8, right: Math.max(16, width - x - w) }),
    );

  return (
    <Pressable
      onPress={onOpen}
      disabled={!onOpen}
      accessibilityRole={onOpen ? 'button' : undefined}
      accessibilityLabel={`${member.name}, ${subtitle}`}
      className="flex-row items-center gap-3 rounded-[40px] border border-white/60 bg-white/50 px-4 py-3 active:opacity-80"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <View className="rounded-full border-2 border-white" style={{ boxShadow: CARD_SHADOW }}>
        <Avatar name={member.name} url={member.avatarUrl} size={large ? 44 : 42} />
      </View>
      <View className="flex-1">
        <Text numberOfLines={2} className="font-inter-semibold text-sm leading-5 text-[#111111]">
          {member.name}
        </Text>
        <Text numberOfLines={1} className="font-inter text-xs leading-4 text-slate">
          {subtitle}
        </Text>
      </View>
      <StatusPill status={member.status} large={large} />

      {menu ? (
        <>
          <Pressable
            ref={kebab}
            onPress={openMenu}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`More for ${member.name}`}
            accessibilityState={{ expanded: position !== null }}
            className="h-4 w-4 items-center justify-center active:opacity-60"
          >
            <EllipsisVertical size={16} color="#64748B" strokeWidth={2} />
          </Pressable>
          <DropdownMenu
            visible={position !== null}
            onClose={() => setPosition(null)}
            options={menu.options}
            onSelect={menu.onSelect}
            position={position ?? {}}
            label={`Actions for ${member.name}`}
          />
        </>
      ) : null}
    </Pressable>
  );
}
