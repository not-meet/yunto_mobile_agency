import { Check, Eye, MessageCircle, Phone } from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar } from '@/components/common/Avatar';
import { CREATOR_PLATFORM_STYLES } from '@/components/creators/labels';
import { CardButton } from '@/components/creators/CreatorListCard';
import { callNumber, openWhatsApp } from '@/components/leads/contact';
import { creatorTint } from '@/components/team/labels';
import { usePressScale } from '@/hooks/usePressScale';
import type { AssignableCreator } from '@/services/teamService';
import { formatCount } from '@/utils/format';

// A creator on the unassigned list and a member's assigned creators: who they are, their reach
// in one row, and quick View / Call / Chat. Tapping the card or its check picks them; `index`
// sets its tint, so neighbours differ.

const SHADOW = '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)';

interface AssignCreatorCardProps {
  creator: AssignableCreator;
  index: number;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
}

export function AssignCreatorCard({
  creator,
  index,
  selected,
  onToggle,
  onOpen,
}: AssignCreatorCardProps) {
  const press = usePressScale(0.98);
  const tint = creatorTint(index);
  const PlatformIcon = CREATOR_PLATFORM_STYLES[creator.platform].icon;

  const stats = [
    { label: 'Followers', value: formatCount(creator.followers), color: '#141311' },
    { label: 'Views', value: formatCount(creator.avgViews), color: '#141311' },
    { label: 'Leads', value: String(creator.leads), color: '#141311' },
    { label: 'Eng.', value: `${creator.engagementRate.toFixed(1)}%`, color: '#23C16B' },
  ];

  return (
    <Animated.View style={press.style}>
      <Pressable
        {...press.handlers}
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={`${creator.name}, ${creator.handle}, ${creator.niche}, ${stats
          .map((s) => `${s.label} ${s.value}`)
          .join(', ')}`}
        className="gap-3.5 rounded-[26px] p-4"
        style={{
          experimental_backgroundImage: `linear-gradient(135deg, ${tint.card} 0%, rgba(255, 255, 255, 0.5) 100%)`,
          boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.024)',
        }}
      >
        <View className="flex-row items-center gap-3">
          <View>
            <View className="rounded-full border-2 border-white" style={{ boxShadow: SHADOW }}>
              <Avatar name={creator.name} url={creator.avatarUrl} size={44} />
            </View>
            {PlatformIcon ? (
              <View
                className="absolute -bottom-0.5 -right-0.5 h-4 w-4 items-center justify-center rounded-full bg-white"
                style={{ boxShadow: SHADOW }}
              >
                <PlatformIcon size={8} color="#141311" />
              </View>
            ) : null}
          </View>

          <View className="flex-1 gap-0.5">
            <Text
              numberOfLines={1}
              className="font-inter-extrabold text-sm leading-[18px] tracking-[-0.35px] text-[#141311]"
            >
              {creator.name}
            </Text>
            <View className="flex-row items-center gap-1.5 pb-0.5">
              <Text
                numberOfLines={1}
                className="shrink font-inter text-[10px] leading-[15px] text-[#8C8A84]"
              >
                {creator.handle}
              </Text>
              <View className="shrink rounded-full border border-white/40 bg-white/80 px-1.5 py-0.5">
                <Text
                  numberOfLines={1}
                  className="font-inter-bold text-[9px] leading-[14px] text-[#8C8A84]"
                >
                  {creator.niche}
                </Text>
              </View>
            </View>
          </View>

          {/* The whole card toggles; this is the visible state of it. */}
          <View
            className={`h-6 w-6 items-center justify-center self-start rounded-full ${
              selected ? 'bg-[#141311]' : 'border border-[rgba(232,229,223,0.3)] bg-white/80'
            }`}
            style={{ boxShadow: SHADOW }}
          >
            {selected ? <Check size={11} color="#FAF7F2" strokeWidth={2} /> : null}
          </View>
        </View>

        <View
          className="flex-row items-center rounded-2xl p-2.5"
          style={{ backgroundColor: tint.stats }}
        >
          {stats.map((stat, i) => (
            <Fragment key={stat.label}>
              {i > 0 ? <View className="h-6 w-px bg-[rgba(20,19,17,0.06)]" /> : null}
              <View className="flex-1 items-center">
                <Text className="font-inter text-[9px] uppercase leading-[14px] tracking-[0.45px] text-[#8C8A84]">
                  {stat.label}
                </Text>
                <Text
                  className="font-inter-extrabold text-sm leading-5"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </Text>
              </View>
            </Fragment>
          ))}
        </View>

        <View className="flex-row gap-2 border-t border-white/30 pt-0.5">
          <CardButton
            label="View"
            icon={Eye}
            onPress={onOpen}
            accessibilityLabel={`View ${creator.name}`}
          />
          <CardButton
            label="Call"
            icon={Phone}
            onPress={() => callNumber(creator.phone, creator.name)}
            accessibilityLabel={`Call ${creator.name}`}
          />
          <CardButton
            label="Chat"
            icon={MessageCircle}
            onPress={() => openWhatsApp(creator.phone, creator.name)}
            accessibilityLabel={`WhatsApp ${creator.name}`}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}
