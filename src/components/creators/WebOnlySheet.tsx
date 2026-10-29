import { Check, Sparkles, X } from 'lucide-react-native';
import { Pressable, Share, Text, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import { YUNTO_WEB_URL } from '@/utils/constants';
import { showToast } from '@/utils/notifications';

// Opened from the Creator AI card in the creators filters: Creator AI only runs on the web, so
// this says why and hands over the web link (through the share sheet, to send it to a laptop).

const FEATURES = ['AI-curated creator matches', 'Match by website & product page'];

// A laptop with the AI sparkle on screen, and a phone in front of it crossed out in red.
function Illustration() {
  return (
    <View className="h-28 w-44 flex-row items-end justify-center">
      <View className="h-24 w-36 rounded-lg border-2 border-[#1C1917] bg-white p-2">
        <View className="gap-1.5">
          <View className="h-1.5 w-12 rounded-full bg-[#C9BEFB]" />
          <View className="h-1.5 self-stretch rounded-full bg-[#E6E1FA]" />
          <View className="h-1.5 w-14 rounded-full bg-[#E6E1FA]" />
          <View className="h-3.5 w-11 rounded-full bg-[#7B5CF5]" />
        </View>
        <View className="absolute right-2.5 top-4">
          <Sparkles size={24} color="#7B5CF5" fill="#7B5CF5" strokeWidth={1.5} />
        </View>
        <View className="absolute right-1 top-2.5">
          <Sparkles size={10} color="#9F87F8" fill="#9F87F8" strokeWidth={1.5} />
        </View>
      </View>
      <View className="absolute -bottom-1 left-0 h-2 w-44 rounded-b-md bg-[#201F21]" />
      <View
        className="absolute bottom-0 left-0 h-9 w-11 items-center justify-center gap-0.5 rounded-md border-2 border-[#1C1917] bg-white"
        style={{
          boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)',
        }}
      >
        <View className="h-0.5 w-3 rounded-full bg-[#D6D3D1]" />
        <X size={16} color="#D32F2F" strokeWidth={2.5} />
        <View className="h-0.5 w-4 rounded-full bg-[#D6D3D1]" />
      </View>
    </View>
  );
}

export function WebOnlySheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const shareLink = () =>
    Share.share({ message: `Open Yunto on your laptop: ${YUNTO_WEB_URL}` }).catch(() =>
      showToast('Couldn’t open the share sheet'),
    );

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View
        className="mt-10 overflow-hidden rounded-[32px] bg-white"
        style={{ boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      >
        <View className="h-[164px] items-center justify-center bg-[#ECE9FD] px-6 pb-6 pt-7">
          <Illustration />
          <Pressable
            onPress={onClose}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Close"
            className="absolute right-4 top-4 h-8 w-8 items-center justify-center rounded-full bg-white/90 active:opacity-70"
            style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
          >
            <X size={14} color="#374151" strokeWidth={2} />
          </Pressable>
        </View>

        <View className="px-5 pb-5 pt-4">
          <View className="self-start rounded-full bg-[#ECEBFE] px-2.5 py-0.5">
            <Text className="font-jakarta-bold text-[10px] uppercase leading-[15px] tracking-[0.5px] text-[#5538EE]">
              Desktop feature
            </Text>
          </View>

          <Text
            accessibilityRole="header"
            className="pb-2 pt-[9px] font-inter-semibold text-[19px] leading-6 tracking-[-0.475px] text-[#111827]"
          >
            Creator AI works on the web version
          </Text>

          <Text className="pb-3.5 font-inter text-xs leading-5 text-[#4B5563]">
            To use the Creator AI filter, open Yunto on your laptop or desktop. It needs the bigger
            screen to match your brand’s website and product page against 100k creator profiles.
          </Text>

          <View className="mb-3 gap-2 rounded-xl bg-[#F8F6F1] p-3">
            {FEATURES.map((feature) => (
              <View key={feature} className="flex-row items-center gap-2">
                <Check size={14} color="#6445EE" strokeWidth={2.5} />
                <Text className="font-inter-medium text-[11.5px] leading-[17px] text-[#374151]">
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={shareLink}
            accessibilityRole="button"
            accessibilityLabel="Get Yunto Web, share the web link"
            className="h-[47.5px] items-center justify-center rounded-full bg-[#181816] active:opacity-80"
            style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
          >
            <Text className="font-jakarta-bold text-[13px] leading-5 text-white">
              Get Yunto Web
            </Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            className="mt-3.5 items-center active:opacity-70"
          >
            <Text className="font-jakarta-semibold text-xs leading-[18px] text-[#374151]">
              Maybe later
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}
