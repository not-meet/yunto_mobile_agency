import { ChevronRight, EllipsisVertical, SquarePen } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View, type ViewStyle } from 'react-native';

import { DropdownMenu } from '@/components/common/DropdownMenu';
import { StatusPill } from '@/components/team/StatusPill';
import { TeamIcon } from '@/components/team/TeamIcon';
import type { Team } from '@/services/teamService';

// One team in a list: its badge, name and a line under it. On Manage Teams it shows who's in
// today and opens the team; on Create Teams a menu edits or deletes it. The pencil by the name
// renames it.

type MenuAction = 'edit' | 'delete';
const MENU: { value: MenuAction; label: string }[] = [
  { value: 'edit', label: 'Edit team' },
  { value: 'delete', label: 'Delete team' },
];

interface TeamRowProps {
  team: Team;
  subtitle: string;
  onRename: () => void;
  // Opens the team; shows the active count and a chevron.
  onOpen?: () => void;
  // Shows the ⋮ menu instead.
  onDelete?: () => void;
}

export function TeamRow({ team, subtitle, onRename, onOpen, onDelete }: TeamRowProps) {
  const { width } = useWindowDimensions();
  const kebab = useRef<View>(null);
  const [menu, setMenu] = useState<ViewStyle | null>(null);

  // Opens the menu just under the dots, lined up with their right edge.
  const openMenu = () =>
    kebab.current?.measureInWindow((x, y, w, h) =>
      setMenu({ top: y + h + 8, right: Math.max(16, width - x - w) }),
    );

  return (
    <Pressable
      onPress={onOpen}
      disabled={!onOpen}
      accessibilityRole={onOpen ? 'button' : undefined}
      accessibilityLabel={`${team.name}, ${subtitle}`}
      accessibilityHint={onOpen ? 'Opens the team' : undefined}
      className="flex-row items-center gap-4 rounded-3xl border border-white bg-white/70 px-5 py-4 active:opacity-80"
      style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)' }}
    >
      <TeamIcon focus={team.focus} size={40} />
      <View className="flex-1">
        <View className="flex-row items-center gap-[7px]">
          <Text
            numberOfLines={1}
            className="shrink font-inter-semibold text-[15px] leading-[22px] tracking-[-0.375px] text-[#111111]"
          >
            {team.name}
          </Text>
          <Pressable
            onPress={onRename}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Rename ${team.name}`}
            className="active:opacity-60"
          >
            <SquarePen size={12} color="#BCBABA" strokeWidth={1.5} />
          </Pressable>
        </View>
        <Text numberOfLines={1} className="font-inter-medium text-xs leading-[18px] text-[#999999]">
          {subtitle}
        </Text>
      </View>

      {onOpen ? (
        <>
          {team.active > 0 ? <StatusPill status="active" label={`${team.active} Active`} /> : null}
          <ChevronRight size={16} color="#CCCCCC" strokeWidth={2} />
        </>
      ) : null}

      {onDelete ? (
        <>
          <Pressable
            ref={kebab}
            onPress={openMenu}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`More for ${team.name}`}
            accessibilityState={{ expanded: menu !== null }}
            className="h-6 w-6 items-center justify-center active:opacity-60"
          >
            <EllipsisVertical size={14} color="#BBBBBB" strokeWidth={2} />
          </Pressable>
          <DropdownMenu
            visible={menu !== null}
            onClose={() => setMenu(null)}
            options={MENU}
            onSelect={(action) => (action === 'edit' ? onRename() : onDelete())}
            position={menu ?? {}}
            label={`Actions for ${team.name}`}
          />
        </>
      ) : null}
    </Pressable>
  );
}
