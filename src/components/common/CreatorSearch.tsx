import { Mic, Search } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';

import { showToast } from '@/utils/notifications';

// Search box over a list of creators (a lead's, the roster): name, handle or niche.

const QUERY_MAX = 60;

interface CreatorSearchProps {
  value: string;
  onChange: (query: string) => void;
}

export function CreatorSearch({ value, onChange }: CreatorSearchProps) {
  return (
    <View
      className="h-[50px] flex-row items-center gap-3 rounded-[20px] border border-[rgba(232,229,223,0.1)] bg-white px-4"
      style={{ boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.02)' }}
    >
      <Search size={16} color="#8C8A84" strokeWidth={1.33} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Search creators, niches..."
        placeholderTextColor="#8C8A84"
        maxLength={QUERY_MAX}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel="Search creators"
        className="flex-1 p-0 font-inter text-sm leading-5 text-[#141311]"
      />
      {/* TODO(creators): voice search. */}
      <Pressable
        onPress={() => showToast('Voice search is coming soon')}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Search by voice"
        className="h-6 w-6 items-center justify-center rounded-full bg-[#141311] active:opacity-70"
      >
        <Mic size={11} color="#FAF7F2" strokeWidth={1.67} />
      </Pressable>
    </View>
  );
}
