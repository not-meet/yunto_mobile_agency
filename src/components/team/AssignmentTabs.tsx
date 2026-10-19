import { Pressable, Text, View } from 'react-native';

// Assign Creators' two views: who looks after which creators, or the creators nobody does yet
// (badged with how many).

export type AssignmentTab = 'teams' | 'unassigned';

interface AssignmentTabsProps {
  value: AssignmentTab;
  onChange: (next: AssignmentTab) => void;
  unassigned: number;
}

const TABS: { key: AssignmentTab; label: string }[] = [
  { key: 'teams', label: 'Teams & Roles' },
  { key: 'unassigned', label: 'Unassigned' },
];

export function AssignmentTabs({ value, onChange, unassigned }: AssignmentTabsProps) {
  return (
    <View
      accessibilityRole="tablist"
      className="h-12 flex-row items-center rounded-full bg-[rgba(229,229,229,0.65)] p-1"
    >
      {TABS.map(({ key, label }) => {
        const selected = key === value;
        const badge = key === 'unassigned' && unassigned > 0;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            accessibilityRole="tab"
            accessibilityLabel={badge ? `${label}, ${unassigned}` : label}
            accessibilityState={{ selected }}
            className={`h-10 flex-1 flex-row items-center justify-center gap-1.5 rounded-full active:opacity-80 ${
              selected ? 'bg-[#171717]' : ''
            }`}
            style={selected ? { boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' } : undefined}
          >
            <Text
              className={`text-[13px] leading-5 ${
                selected ? 'font-inter-medium text-white' : 'font-inter text-[#404040]'
              }`}
            >
              {label}
            </Text>
            {badge ? (
              <View className="h-5 min-w-6 items-center justify-center rounded-full bg-[#2563EB] px-1.5">
                <Text className="font-inter-semibold text-xs leading-[14px] text-white">
                  {unassigned}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
