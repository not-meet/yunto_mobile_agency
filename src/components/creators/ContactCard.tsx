import { House, type LucideIcon, Mail, Phone } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { ProfilePanel } from '@/components/creators/ProfilePanel';
import type { CreatorDetails } from '@/services/creatorsService';

// How to reach a creator, as on the web profile's Contact Info: phone, email and home address
// (for shoots and barter deliveries). Missing ones say so.

function ContactRow({
  icon: Icon,
  label,
  value,
  last,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null;
  last: boolean;
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}, ${value ?? 'not added'}`}
      className={`flex-row items-start gap-3 py-3.5 ${last ? '' : 'border-b border-black/5'}`}
    >
      <View className="h-7 w-7 items-center justify-center rounded-full bg-[rgba(58,92,126,0.08)]">
        <Icon size={13} color="#3A5C7E" strokeWidth={1.75} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="font-inter-bold text-[10px] uppercase leading-[15px] tracking-[1px] text-[#AAAAAA]">
          {label}
        </Text>
        <Text
          className={`font-inter-semibold text-[13px] leading-5 ${
            value ? 'text-[#333333]' : 'text-black/40'
          }`}
        >
          {value ?? 'Not added'}
        </Text>
      </View>
    </View>
  );
}

export function ContactCard({ creator }: { creator: CreatorDetails }) {
  const rows = [
    { icon: Phone, label: 'Phone', value: creator.phone },
    { icon: Mail, label: 'Email', value: creator.email },
    { icon: House, label: 'Home Address', value: creator.address },
  ];

  return (
    <ProfilePanel glow="205, 235, 220">
      <Text
        accessibilityRole="header"
        className="px-5 pt-4 font-inter-semibold text-[15px] leading-[22px] tracking-[-0.375px] text-[#111111]"
      >
        Contact Info
      </Text>
      <View className="px-5 pb-2">
        {rows.map((row, i) => (
          <ContactRow key={row.label} {...row} last={i === rows.length - 1} />
        ))}
      </View>
    </ProfilePanel>
  );
}
