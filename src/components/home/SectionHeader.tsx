import { Pressable, Text, View } from 'react-native';

// Geist section title with an optional link on the right ("See all").

interface SectionHeaderProps {
  title: string;
  action?: { label: string; onPress: () => void };
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View className="flex-row items-end justify-between px-1">
      <Text
        accessibilityRole="header"
        className="font-geist-medium text-[22px] leading-[33px] tracking-[-0.55px] text-charcoal"
      >
        {title}
      </Text>
      {action ? (
        // Pressed tint comes from the Pressable: an `active:` class on the Text would make the
        // Text claim the touch, and onPress would never fire.
        <Pressable onPress={action.onPress} hitSlop={8} accessibilityRole="link">
          {({ pressed }) => (
            <Text
              className={`font-inter-semibold text-sm leading-5 ${pressed ? 'text-charcoal' : 'text-charcoal/60'}`}
            >
              {action.label}
            </Text>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}
