import { Image } from 'expo-image';
import { Clock, Tag } from 'lucide-react-native';
import { Text, View } from 'react-native';

import {
  CATEGORY_LABELS,
  experienceLine,
  ROLE_LABELS,
  SECTION_SHADOW,
} from '@/components/talent/labels';
import type { Talent } from '@/services/talentService';

// Who's being booked, at the top of the booking screen. Editors get the fuller card (experience,
// reply time and past brands); videographers the compact one.

function Photo({ talent }: { talent: Talent }) {
  return (
    <View className="h-[72px] w-[72px] overflow-hidden rounded-2xl bg-[#EAEAEA]">
      {/* No photo yet: the grey tile stays as the placeholder. */}
      {talent.photoUrl ? (
        <Image
          source={{ uri: talent.photoUrl }}
          recyclingKey={talent.id}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
          accessible={false}
          style={{ flex: 1 }}
        />
      ) : null}
    </View>
  );
}

// "Fashion & Cinematic", the styles they're known for.
function StyleBadge({ talent }: { talent: Talent }) {
  return (
    <View className="flex-row items-center gap-1.5 self-start rounded-[10px] bg-[#F3E5F5] px-2.5 py-1">
      <Tag size={12} color="#6A1B9A" strokeWidth={1} />
      <Text numberOfLines={1} className="font-inter-bold text-xs leading-[15px] text-[#6A1B9A]">
        {talent.categories.map((category) => CATEGORY_LABELS[category]).join(' & ')}
      </Text>
    </View>
  );
}

function Fact({ label, withClock = false }: { label: string; withClock?: boolean }) {
  return (
    <View className="flex-row items-center gap-1 rounded-lg border border-black/5 bg-white px-2 py-1">
      {withClock ? <Clock size={12} color="#555555" strokeWidth={1} /> : null}
      <Text className="font-inter-regular text-[11px] leading-[13px] text-[#555555]">{label}</Text>
    </View>
  );
}

export function BookingSummary({ talent }: { talent: Talent }) {
  const editor = talent.role === 'editor';

  return (
    <View
      className={`flex-row gap-4 rounded-3xl border border-white/90 bg-white/70 p-4 ${
        editor ? 'items-start' : 'items-center'
      }`}
      style={{ boxShadow: SECTION_SHADOW }}
    >
      <Photo talent={talent} />
      {editor ? (
        <View className="flex-1">
          <View className="flex-row items-center justify-between gap-2">
            <Text
              accessibilityRole="header"
              numberOfLines={1}
              className="shrink font-inter-bold text-base leading-[19px] text-[#1A1A1A]"
            >
              {talent.name}
            </Text>
            <Text className="font-inter-regular text-xs leading-[15px] text-[#888888]">
              {talent.location.state}
            </Text>
          </View>
          <Text
            numberOfLines={1}
            className="pb-2 pt-1 font-inter-regular text-[13px] leading-4 text-[#666666]"
          >
            {talent.specialty} • {experienceLine(talent.experienceYears, [])}
          </Text>
          <View className="pb-3">
            <StyleBadge talent={talent} />
          </View>
          <View className="flex-row flex-wrap gap-1.5">
            {talent.replyTime ? <Fact label={`${talent.replyTime} reply`} withClock /> : null}
            {talent.brands.map((brand) => (
              <Fact key={brand} label={brand} />
            ))}
          </View>
        </View>
      ) : (
        <View className="flex-1 gap-1">
          <Text
            accessibilityRole="header"
            numberOfLines={1}
            className="font-inter-bold text-base leading-[19px] text-[#1A1A1A]"
          >
            {talent.name}
          </Text>
          <Text
            numberOfLines={1}
            className="pb-1 font-inter-regular text-[13px] leading-4 text-[#666666]"
          >
            {ROLE_LABELS[talent.role].singular} | {talent.location.state}
          </Text>
          <StyleBadge talent={talent} />
        </View>
      )}
    </View>
  );
}
