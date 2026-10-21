import { Search } from 'lucide-react-native';
import { TextInput, View } from 'react-native';

import type { AssignableCreator } from '@/services/teamService';

// Search box over the creators on the unassigned list and a member's profile: name, handle or
// niche.

const QUERY_MAX = 60;

export function matchesCreator(creator: AssignableCreator, query: string) {
  const q = query.trim().toLowerCase();
  return !q || `${creator.name} ${creator.handle} ${creator.niche}`.toLowerCase().includes(q);
}

interface AssignSearchBarProps {
  value: string;
  onChange: (query: string) => void;
}

export function AssignSearchBar({ value, onChange }: AssignSearchBarProps) {
  return (
    <View className="h-[43px] flex-row items-center gap-3 rounded-full border border-[#E9E4DC] bg-white px-4">
      <Search size={16} color="#A3A3A3" strokeWidth={1.33} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Search creators"
        placeholderTextColor="#A3A3A3"
        maxLength={QUERY_MAX}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel="Search creators"
        className="flex-1 p-0 font-inter text-sm leading-[17px] text-[#171717]"
      />
    </View>
  );
}
