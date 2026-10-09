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
        <Pressable onPress={action.onPress} hitSlop={8} accessibilityRole="link">
          <Text className="font-inter-semibold text-sm leading-5 text-charcoal/60 active:text-charcoal">
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
