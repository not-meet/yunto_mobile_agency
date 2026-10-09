import { Phone } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/common/Avatar';
import { callNumber, openWhatsApp } from '@/components/leads/contact';
import { WhatsAppIcon } from '@/components/leads/WhatsAppIcon';
import type { LeadOwner } from '@/services/leadsService';

// The teammate who brought the lead in, with call and WhatsApp shortcuts. "Not assigned yet",
// without the shortcuts, until someone is.

export function LeadOwnerCard({ owner }: { owner: LeadOwner | null }) {
  return (
    <View className="flex-row items-center justify-between gap-3 rounded-[20px] border border-[rgba(232,226,217,0.61)] bg-white/60 px-5 py-4">
      <Text className="font-inter-medium text-sm leading-[17px] text-[#8A8A8E]">Lead by</Text>
      {owner ? (
        <View className="shrink flex-row items-center gap-[7px]">
          <Avatar name={owner.name} url={owner.avatarUrl} size={24} />
          <Text
            numberOfLines={1}
            className="shrink font-inter-semibold text-sm leading-[17px] text-[#1D1D1F]"
          >
            {owner.name}
          </Text>
          <Pressable
            onPress={() => callNumber(owner.phone, owner.name)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Call ${owner.name}`}
            className={`ml-1 h-7 w-7 items-center justify-center rounded-full bg-[#F4F4F6] active:opacity-70 ${
              owner.phone ? '' : 'opacity-50'
            }`}
          >
            <Phone size={14} color="#1D1D1F" strokeWidth={1.17} />
          </Pressable>
          <Pressable
            onPress={() => openWhatsApp(owner.phone, owner.name)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`WhatsApp ${owner.name}`}
            className={`active:opacity-70 ${owner.phone ? '' : 'opacity-50'}`}
          >
            <WhatsAppIcon size={28} />
          </Pressable>
        </View>
      ) : (
        <Text className="font-inter-semibold text-sm leading-[17px] text-[#8A8A8E]">
          Not assigned yet
        </Text>
      )}
    </View>
  );
}
