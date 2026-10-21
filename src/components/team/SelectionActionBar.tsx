import { type LucideIcon, X } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

// The dark pill over Assign Creators' lists once creators are picked: how many, "Move to", and
// the main action (assign them, or remove them from a member).

const TONES = {
  light: { background: '#FFFFFF', color: '#312B28' },
  danger: { background: '#361919', color: '#F87171' },
} as const;

interface SelectionActionBarProps {
  count: number;
  // Clears the picks; without it, "Selected" shows by the count instead.
  onClear?: () => void;
  // Left out, there's no "Move to".
  onMove?: () => void;
  action: {
    label: string;
    icon: LucideIcon;
    tone: keyof typeof TONES;
    onPress: () => void;
    busy?: boolean;
  };
}

export function SelectionActionBar({ count, onClear, onMove, action }: SelectionActionBarProps) {
  const tone = TONES[action.tone];
  const Icon = action.icon;
  const busy = action.busy ?? false;

  return (
    <View
      className="min-h-[52px] flex-row items-center justify-between gap-3 rounded-full bg-cocoa py-2 pl-3 pr-2"
      style={{ boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
    >
      <View className="shrink flex-row items-center gap-2">
        <View
          accessible
          accessibilityLiveRegion="polite"
          accessibilityLabel={`${count} selected`}
          className="h-7 min-w-7 items-center justify-center rounded-full bg-[#6437E7] px-1.5"
        >
          <Text className="font-inter-semibold text-xs leading-4 text-white">{count}</Text>
        </View>
        {onClear ? (
          <Pressable
            onPress={onClear}
            disabled={busy}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear selection"
            className="p-1 active:opacity-60"
          >
            <X size={16} color="#A3A3A3" strokeWidth={1.67} />
          </Pressable>
        ) : (
          <Text
            importantForAccessibility="no"
            numberOfLines={1}
            className="shrink font-inter-medium text-[14.5px] leading-[22px] tracking-[0.36px] text-white"
          >
            Selected
          </Text>
        )}
      </View>

      <View className="flex-row items-center gap-2">
        {onMove ? (
          <Pressable
            onPress={onMove}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={`Move ${count} to someone else`}
            className="h-9 items-center justify-center rounded-full bg-[rgba(118,118,118,0.5)] px-4 active:opacity-70"
          >
            <Text className="font-inter-medium text-[13px] leading-5 text-white">Move to</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={action.onPress}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          accessibilityState={{ busy }}
          className="h-9 min-w-[96px] flex-row items-center justify-center gap-1.5 rounded-full px-3.5 active:opacity-80"
          style={{
            backgroundColor: tone.background,
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          }}
        >
          {busy ? (
            <ActivityIndicator size="small" color={tone.color} />
          ) : (
            <>
              <Icon size={16} color={tone.color} strokeWidth={1.33} />
              <Text
                numberOfLines={1}
                className="font-inter-medium text-[13px] leading-5"
                style={{ color: tone.color }}
              >
                {action.label}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
