import { ChevronDown } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { BackButton } from '@/components/common/BackButton';
import { GLASS_SHADOW } from '@/components/talent/labels';

// Back button, the role in the middle (a dropdown when `onTitlePress` is given) and an optional
// context pill on the right (today's date, plus the state on a profile).

interface TalentHeaderProps {
  title: string;
  onTitlePress?: () => void;
  // Open state of the title's dropdown, for accessibility.
  titleExpanded?: boolean;
  context?: string;
}

export function TalentHeader({ title, onTitlePress, titleExpanded, context }: TalentHeaderProps) {
  return (
    <View className="flex-row items-center justify-between gap-2 p-[15px]">
      <BackButton fallbackHref="/home" size={44} />
      <Pressable
        onPress={onTitlePress}
        disabled={!onTitlePress}
        accessibilityRole={onTitlePress ? 'button' : 'header'}
        accessibilityLabel={onTitlePress ? `${title}, change role` : title}
        accessibilityState={onTitlePress ? { expanded: Boolean(titleExpanded) } : undefined}
        className="flex-row items-center gap-1.5 rounded-3xl border border-white/90 bg-white/65 px-[18px] py-2.5 active:opacity-80"
        style={{ boxShadow: GLASS_SHADOW }}
      >
        <Text className="text-center font-inter-bold text-[15px] leading-[18px] text-[#1D1D1F]">
          {title}
        </Text>
        {onTitlePress ? <ChevronDown size={18} color="#8A8A8E" strokeWidth={1.5} /> : null}
      </Pressable>
      {context ? (
        <View
          className="rounded-3xl border border-white/90 bg-white/65 px-3.5 py-2.5"
          style={{ boxShadow: GLASS_SHADOW }}
        >
          <Text className="font-inter-semibold text-[13px] leading-4 text-[#6E6E73]">
            {context}
          </Text>
        </View>
      ) : (
        // Balances the back button so the title stays centred.
        <View className="w-11" />
      )}
    </View>
  );
}
