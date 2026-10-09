import { Search } from 'lucide-react-native';
import { Pressable, Text } from 'react-native';

// Centred "Browse more" pill at the end of a list.
export function BrowseMoreButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Browse more"
      className="h-[52px] flex-row items-center gap-3.5 self-center rounded-[28px] border border-white/60 bg-white/60 pl-5 pr-8 active:opacity-70"
      style={{ boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.06)' }}
    >
      <Text className="text-center font-inter-medium text-sm leading-[17px] text-[#1A1A1A]">
        Browse more
      </Text>
      <Search size={18} color="#888888" strokeWidth={1.5} />
    </Pressable>
  );
}
