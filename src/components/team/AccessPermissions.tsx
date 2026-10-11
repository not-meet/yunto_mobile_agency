import { ArrowLeftRight, CalendarCheck, type LucideIcon, UserPlus } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { CARD_SHADOW } from '@/components/home/shared';
import { PERMISSION_KEYS, PERMISSION_LABELS } from '@/components/team/labels';
import { PillButton } from '@/components/team/PillButton';
import { PillToggle } from '@/components/team/PillToggle';
import type { Permissions } from '@/services/teamService';

// What a member is allowed to do, each with a switch that saves as it's flipped.

const ICONS: Record<keyof Permissions, LucideIcon> = {
  assignLeads: UserPlus,
  reallocate: ArrowLeftRight,
  approveLeaves: CalendarCheck,
};

interface AccessPermissionsProps {
  value: Permissions;
  onChange: (next: Permissions) => void;
  onAdd: () => void;
  saving: boolean;
}

export function AccessPermissions({ value, onChange, onAdd, saving }: AccessPermissionsProps) {
  return (
    <View
      className="rounded-3xl border border-white/75 bg-white/55 px-5 pb-2"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <View className="flex-row items-center justify-between gap-3 border-b border-[rgba(226,232,240,0.3)] py-4">
        <Text
          accessibilityRole="header"
          className="font-inter-semibold text-sm leading-5 text-[#111111]"
        >
          Access Permission
        </Text>
        <PillButton label="Add Permissions" onPress={onAdd} />
      </View>
      {PERMISSION_KEYS.map((key) => {
        const Icon = ICONS[key];
        return (
          <View key={key} className="flex-row items-center gap-3 py-3.5">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-[#E0E7FF]">
              <Icon size={14} color="#615FFF" strokeWidth={2} />
            </View>
            <Text className="flex-1 font-inter-medium text-sm leading-5 text-[#111111]">
              {PERMISSION_LABELS[key]}
            </Text>
            <PillToggle
              value={value[key]}
              onChange={(next) => onChange({ ...value, [key]: next })}
              disabled={saving}
              label={PERMISSION_LABELS[key]}
              tone="green"
            />
          </View>
        );
      })}
    </View>
  );
}
