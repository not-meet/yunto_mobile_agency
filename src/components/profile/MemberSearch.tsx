import { Search } from 'lucide-react-native';
import { TextInput, View } from 'react-native';

import type { DistributionMember } from '@/services/leadDistributionService';
import { memberSubtitle } from '@/components/profile/distributionLabels';

// Search box over the team in the lead distribution sheets: name, role or what they're
// assigned as.

const QUERY_MAX = 60;

export function matchesMember(member: DistributionMember, query: string) {
  const q = query.trim().toLowerCase();
  return !q || `${member.name} ${memberSubtitle(member)}`.toLowerCase().includes(q);
}

export function MemberSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (query: string) => void;
}) {
  return (
    <View className="h-11 flex-row items-center gap-2.5 rounded-full bg-[#F6F4EF] pl-3.5 pr-4">
      <Search size={16} color="#71717A" strokeWidth={1.47} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Search team members"
        placeholderTextColor="#8F8B83"
        maxLength={QUERY_MAX}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel="Search team members"
        className="flex-1 p-0 font-inter text-[13.5px] leading-[17px] text-[#1A1A1A]"
      />
    </View>
  );
}
