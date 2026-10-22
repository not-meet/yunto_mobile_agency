import { Users } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { Switch } from '@/components/common/Switch';

// The right of the Creators header, as on yunto-private: creators asking to join (a count
// badge on a people pill), then a switch: on Our Creators "listed" shows only those listed in the
// global pool, on All Creators "hidden" shows only those the agency has hidden.

interface ScopeSwitch {
  value: boolean;
  onChange: (next: boolean) => void;
}

function LabelledSwitch({
  label,
  accessibilityLabel,
  toggle,
}: {
  label: string;
  accessibilityLabel: string;
  toggle: ScopeSwitch;
}) {
  return (
    <Pressable
      onPress={() => toggle.onChange(!toggle.value)}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: toggle.value }}
      className="flex-row items-center gap-1"
    >
      <Text className="font-inter-medium text-xs leading-4 text-[#141311]">{label}</Text>
      <Switch value={toggle.value} onValueChange={toggle.onChange} />
    </Pressable>
  );
}

interface CreatorsHeaderActionsProps {
  requests: number;
  onRequests: () => void;
  // Left out on All Creators.
  listed?: ScopeSwitch;
  // Left out on Our Creators.
  hidden?: ScopeSwitch;
}

export function CreatorsHeaderActions({
  requests,
  onRequests,
  listed,
  hidden,
}: CreatorsHeaderActionsProps) {
  return (
    <View className="flex-row items-center gap-2">
      <Pressable
        onPress={onRequests}
        hitSlop={4}
        accessibilityRole="button"
        accessibilityLabel={`Creator requests, ${requests} pending`}
        className="h-9 w-[52px] items-center justify-center rounded-full bg-white active:opacity-70"
        style={{ boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.04)' }}
      >
        <Users size={18} color="#141311" strokeWidth={1.75} />
        {requests > 0 ? (
          <View className="absolute right-2 top-1 h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#1FA971] px-0.5">
            <Text className="font-inter-bold text-[8px] leading-[10px] text-white">
              {requests > 9 ? '9+' : requests}
            </Text>
          </View>
        ) : null}
      </Pressable>
      {listed ? (
        <LabelledSwitch label="listed" accessibilityLabel="Listed only" toggle={listed} />
      ) : null}
      {hidden ? (
        <LabelledSwitch label="hidden" accessibilityLabel="Hidden only" toggle={hidden} />
      ) : null}
    </View>
  );
}
