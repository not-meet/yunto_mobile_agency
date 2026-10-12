import { ChevronRight, Lock, LogOut, X } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/common/Avatar';
import type { ProfileOverview } from '@/services/profileService';

// The Log Out screen's card: a door illustration, what logging out means, who's signed in (once
// the profile has loaded), a note that nothing is lost, then Log Out and Stay Logged In.

interface LogoutPanelProps {
  // Left out while the profile hasn't loaded; logging out doesn't wait for it.
  overview?: ProfileOverview;
  onLogOut: () => void;
  onStay: () => void;
}

export function LogoutPanel({ overview, onLogOut, onStay }: LogoutPanelProps) {
  const name = overview ? `${overview.profile.firstName} ${overview.profile.lastName}`.trim() : '';

  return (
    <View
      className="overflow-hidden rounded-[36px] border border-black/[0.07] bg-white/[0.58] px-6 pb-7 pt-8"
      style={{
        boxShadow: '0px 24px 64px rgba(130, 110, 200, 0.12), 0px 4px 16px rgba(0, 0, 0, 0.05)',
      }}
    >
      <View
        pointerEvents="none"
        className="absolute right-px top-px h-52 w-52"
        style={{
          experimental_backgroundImage:
            'radial-gradient(circle at 100% 0%, rgba(215, 205, 255, 0.45) 0%, rgba(215, 205, 255, 0) 65%)',
        }}
      />
      <View
        pointerEvents="none"
        className="absolute bottom-px left-px h-48 w-48"
        style={{
          experimental_backgroundImage:
            'radial-gradient(circle at 0% 100%, rgba(255, 210, 225, 0.3) 0%, rgba(255, 210, 225, 0) 65%)',
        }}
      />

      <DoorIllustration />

      <Text
        accessibilityRole="header"
        className="mt-5 text-center font-inter-semibold text-[28px] leading-[35px] tracking-[-0.7px] text-[#111111]"
      >
        Log Out?
      </Text>
      <Text className="mt-4 self-center px-4 text-center font-inter-medium text-[13px] leading-[21px] text-black/45">
        You’re about to sign out of your agency account. You can sign back in anytime to continue
        managing campaigns, creators, leads, and team activities.
      </Text>

      {overview ? (
        <View
          accessible
          accessibilityLabel={`Signed in as ${name}, ${overview.profile.title}, agency code ${overview.agency.code}`}
          className="mt-5 flex-row items-center gap-3 rounded-[22px] border border-white/90 bg-white/60 px-4 py-3.5"
          style={{ boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.04)' }}
        >
          <View className="rounded-full border border-[#EEEEEE]">
            <Avatar name={name} url={overview.profile.avatarUrl} size={48} />
          </View>
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="font-inter-semibold text-[15px] leading-[22px] tracking-[-0.375px] text-[#111111]"
            >
              {name}
            </Text>
            <Text
              numberOfLines={1}
              className="font-inter-medium text-xs leading-[18px] text-black/40"
            >
              {overview.profile.title}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5 rounded-full border border-[rgba(160,170,255,0.35)] bg-[rgba(200,210,255,0.3)] px-3 py-1.5">
            <View className="h-1.5 w-1.5 rounded-full bg-[#7A8AE8]" />
            <Text className="font-inter-bold text-[10px] leading-[15px] text-periwinkle">
              {overview.agency.code}
            </Text>
          </View>
        </View>
      ) : null}

      <View className="mt-3.5 flex-row items-center gap-2.5 rounded-[18px] border border-[rgba(140,190,155,0.35)] bg-[rgba(210,240,220,0.45)] px-4 py-3">
        <View className="h-6 w-6 items-center justify-center rounded-full bg-[rgba(62,125,82,0.12)]">
          <Lock size={12} color="#3E7D52" strokeWidth={2} />
        </View>
        <Text className="flex-1 font-inter-semibold text-xs leading-4 text-[#3E5C45]">
          Your data, campaigns, and creator records will remain securely saved.
        </Text>
      </View>

      <View className="mt-5 gap-3">
        <Pressable
          onPress={onLogOut}
          accessibilityRole="button"
          accessibilityLabel="Log Out"
          className="h-[54px] flex-row items-center justify-center gap-2.5 rounded-full active:opacity-80"
          style={{
            experimental_backgroundImage:
              'linear-gradient(100.83deg, #F4A0B0 0%, #E87090 50%, #D85070 100%)',
            boxShadow: '0px 8px 24px rgba(216, 80, 112, 0.22), 0px 2px 8px rgba(0, 0, 0, 0.06)',
          }}
        >
          <LogOut size={18} color="#FFFFFF" strokeWidth={2} />
          <Text className="font-inter-semibold text-[15px] leading-[22px] text-white">Log Out</Text>
        </Pressable>
        <Pressable
          onPress={onStay}
          accessibilityRole="button"
          accessibilityLabel="Stay Logged In"
          className="h-14 flex-row items-center justify-center gap-2.5 rounded-full border border-black/[0.08] bg-white/65 active:opacity-70"
          style={{ boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.04)' }}
        >
          <X size={18} color="rgba(0, 0, 0, 0.65)" strokeWidth={2} />
          <Text className="font-inter-semibold text-[15px] leading-[22px] text-black/65">
            Stay Logged In
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// A door with someone stepping out of it past an arrow, in soft violets.
function DoorIllustration() {
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      className="h-[110px] w-[110px] self-center rounded-[30px] border border-[rgba(200,190,240,0.4)]"
      style={{
        experimental_backgroundImage:
          'linear-gradient(135deg, rgba(235, 230, 255, 0.8) 0%, rgba(255, 220, 235, 0.6) 100%)',
        boxShadow: '0px 8px 24px rgba(140, 120, 200, 0.12)',
      }}
    >
      {/* Frame, then the door ajar inside it. */}
      <View className="absolute left-[31px] top-[25px] h-[58px] w-[46px] rounded-b rounded-t-lg border border-[rgba(160,150,220,0.5)] bg-[rgba(200,190,240,0.5)]" />
      <View className="absolute left-[38px] top-[30px] h-[50px] w-[37px] rounded-b-[3px] rounded-t-md border border-[rgba(160,150,220,0.5)] bg-[rgba(240,236,255,0.8)]" />
      {/* Arrow out. */}
      <View className="absolute right-[18px] top-[44px] h-2.5 flex-row items-center">
        <View className="h-0.5 w-8 rounded-full bg-[rgba(140,120,200,0.7)]" />
        <ChevronRight
          size={10}
          color="rgba(140, 120, 200, 0.7)"
          strokeWidth={3}
          style={{ marginLeft: -5 }}
        />
      </View>
      {/* The person leaving. */}
      <View className="absolute right-3.5 top-[22px] w-5 items-center gap-0.5">
        <View className="h-5 w-5 rounded-full bg-[rgba(160,140,220,0.6)]" />
        <View className="h-5 w-3 rounded-md bg-[rgba(160,140,220,0.45)]" />
      </View>
    </View>
  );
}
