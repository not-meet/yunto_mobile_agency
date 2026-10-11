import { Copy } from 'lucide-react-native';
import { Pressable, Share, Text, View } from 'react-native';

import { Avatar } from '@/components/common/Avatar';
import type { ProfileOverview } from '@/services/profileService';
import { showToast } from '@/utils/notifications';

// Top of the profile: photo, name and title, the agency code teammates join with, and how many
// creators, campaigns and teams the agency has.

export function ProfileSummary({ overview }: { overview: ProfileOverview }) {
  const { profile, agency, stats } = overview;
  const name = `${profile.firstName} ${profile.lastName}`.trim();
  const counts = [
    { label: 'Creators', value: stats.creators },
    { label: 'Campaigns', value: stats.campaigns },
    { label: 'Team', value: stats.teams },
  ];

  // No clipboard module in the app yet; the share sheet offers Copy on Android.
  const shareCode = () =>
    Share.share({
      message: `Join ${agency.name} on Yunto with agency code ${agency.code}`,
    }).catch(() => showToast('Couldn’t open the share sheet'));

  return (
    <View
      className="items-center gap-3 rounded-[32px] border border-black/[0.07] bg-white/55 p-6"
      style={{
        boxShadow: '0px 16px 48px rgba(140, 120, 200, 0.12), 0px 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <View className="pt-3">
        <View
          className="rounded-full border-[3px] border-white bg-white"
          style={{ boxShadow: '0px 8px 24px rgba(140, 120, 200, 0.2)' }}
        >
          <Avatar name={name} url={profile.avatarUrl} size={84} />
        </View>
        <View
          accessibilityLabel="Online"
          className="absolute bottom-0.5 right-0.5 h-5 w-5 rounded-full border-2 border-white bg-[#3E7D52]"
        />
      </View>

      <View className="items-center gap-px">
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          className="font-inter-semibold text-[22px] leading-[33px] tracking-[-0.55px] text-[#111111]"
        >
          {name}
        </Text>
        <Text className="font-inter-medium text-[13px] leading-5 text-[#888888]">
          {profile.title}
        </Text>
      </View>

      <View className="flex-row items-center gap-2 rounded-full border border-[rgba(160,170,255,0.35)] bg-[rgba(200,210,255,0.25)] py-2 pl-4 pr-2">
        <View className="h-2 w-2 rounded-full bg-[#7A8AE8]" />
        <Text className="font-inter-bold text-xs leading-[18px] tracking-[0.3px] text-periwinkle">
          Agency Code
        </Text>
        <Text className="font-inter-bold text-xs leading-[18px] text-[#333333]">{agency.code}</Text>
        <Pressable
          onPress={shareCode}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Share agency code ${agency.code}`}
          className="ml-0.5 h-5 w-5 items-center justify-center rounded-full bg-white/70 active:opacity-70"
        >
          <Copy size={11} color="#888888" strokeWidth={1.5} />
        </Pressable>
      </View>

      <View className="mt-2 flex-row self-stretch border-t border-black/[0.06] pt-4">
        {counts.map((count, i) => (
          <View
            key={count.label}
            accessible
            accessibilityLabel={`${count.label}, ${count.value}`}
            className={`flex-1 items-center gap-0.5 ${i > 0 ? 'border-l border-[#EAEAEA]' : ''}`}
          >
            <Text className="font-inter-semibold text-lg leading-[27px] tracking-[-0.45px] text-[#111111]">
              {count.value}
            </Text>
            <Text className="font-inter-bold text-[10px] uppercase leading-[15px] tracking-[1px] text-[#AAAAAA]">
              {count.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
