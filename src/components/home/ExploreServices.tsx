import { router } from 'expo-router';
import { Clapperboard, type LucideIcon, Video } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { SectionHeader } from '@/components/home/SectionHeader';
import { CARD_SHADOW } from '@/components/home/shared';
import { usePressScale } from '@/hooks/usePressScale';
import type { TalentRole } from '@/services/talentService';

// Shortcuts to hire production help: each opens the talent deck for its role, the same flow as
// yunto_mobile_app. "See Request" lists the requests already sent.

const SERVICES: {
  role: TalentRole;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  tone: string;
}[] = [
  {
    role: 'videographer',
    title: 'Videographers',
    subtitle: 'Find local talent',
    icon: Video,
    tone: 'bg-[#E4ECF4] border-[rgba(217,232,245,0.5)]',
  },
  {
    role: 'editor',
    title: 'Video Editors',
    subtitle: 'Post-production',
    icon: Clapperboard,
    tone: 'bg-[#F6F3E6] border-[rgba(252,244,217,0.5)]',
  },
];

function ServiceTile({ role, title, subtitle, icon: Icon, tone }: (typeof SERVICES)[number]) {
  const press = usePressScale();
  return (
    <Animated.View style={press.style} className="flex-1">
      <Pressable
        {...press.handlers}
        onPress={() => router.push({ pathname: '/talent', params: { role } })}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${subtitle}`}
        className={`h-[110px] justify-between rounded-3xl border p-4 ${tone}`}
        style={{ boxShadow: CARD_SHADOW }}
      >
        <View
          className="h-8 w-8 items-center justify-center rounded-full bg-white/60"
          style={{ boxShadow: CARD_SHADOW }}
        >
          <Icon size={16} color="#1E1E1E" strokeWidth={1.33} />
        </View>
        <View className="gap-0.5">
          <Text className="font-inter-bold text-sm leading-[21px] text-charcoal">{title}</Text>
          <Text className="font-inter-medium text-[11px] leading-4 text-charcoal/60">
            {subtitle}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function ExploreServices() {
  return (
    <View className="gap-4">
      <SectionHeader
        title="Explore Services"
        action={{ label: 'See Request', onPress: () => router.push('/requests') }}
      />
      <View className="flex-row gap-3">
        {SERVICES.map((service) => (
          <ServiceTile key={service.title} {...service} />
        ))}
      </View>
    </View>
  );
}
