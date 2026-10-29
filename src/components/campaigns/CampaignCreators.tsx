import { router } from 'expo-router';
import { ChevronRight, Eye, Phone } from 'lucide-react-native';
import { Fragment, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { callNumber, openWhatsApp } from '@/components/leads/contact';
import { CreatorAvatar } from '@/components/leads/CreatorAvatar';
import { creatorTint } from '@/components/leads/labels';
import { WhatsAppIcon } from '@/components/leads/WhatsAppIcon';
import { useLeadCreators } from '@/hooks/useLeadCreators';
import type { LeadCreator } from '@/services/leadCreatorsService';
import { formatCount } from '@/utils/format';

// The campaign's top two creators: who they are, their reach, and View / Call / WhatsApp. A card
// opens the creator's detail, as from the full list; the header and "View all" open that list
// (add, share, remove). They're the lead's creators: the web links them to the campaign when the
// lead converts.

const SHOWN = 2;

function CardButton({
  label,
  icon,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="h-[31px] flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-white/80 active:opacity-70"
      style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
    >
      {icon}
      <Text className="font-inter-semibold text-[10px] leading-[15px] text-[#141311]">{label}</Text>
    </Pressable>
  );
}

function CreatorRow({
  creator,
  tint,
  leadId,
}: {
  creator: LeadCreator;
  tint: string;
  leadId: string;
}) {
  const open = () =>
    router.push({
      pathname: '/leads/creator',
      params: { id: leadId, creatorId: creator.id, from: 'campaign' },
    });

  const stats = [
    { label: 'Followers', value: formatCount(creator.followers), color: '#141311' },
    { label: 'Views', value: formatCount(creator.avgViews), color: '#141311' },
    { label: 'Eng. rate', value: `${creator.engagementRate}%`, color: '#23C16B' },
  ];

  return (
    <Pressable
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={`${creator.name}, ${creator.handle}`}
      accessibilityHint="Opens the creator's detail"
      className="gap-3.5 rounded-[26px] p-4 active:opacity-90"
      style={{
        experimental_backgroundImage: `linear-gradient(135deg, ${tint}CC 0%, rgba(255, 255, 255, 0.5) 100%)`,
        boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.024)',
      }}
    >
      <View className="flex-row items-center gap-3">
        <CreatorAvatar
          name={creator.name}
          url={creator.avatarUrl}
          platform={creator.platform}
          size={44}
        />
        <View className="flex-1 gap-0.5">
          <Text
            numberOfLines={1}
            className="font-inter-extrabold text-sm leading-[18px] tracking-[-0.35px] text-[#141311]"
          >
            {creator.name}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <Text
              numberOfLines={1}
              className="shrink font-inter text-[10px] leading-[15px] text-[#8C8A84]"
            >
              {creator.handle}
            </Text>
            <View className="rounded-full border border-white/40 bg-white/80 px-1.5 py-0.5">
              <Text className="font-inter-bold text-[9px] leading-[14px] text-[#8C8A84]">
                {creator.niche}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View
        accessible
        accessibilityLabel={stats.map((s) => `${s.label} ${s.value}`).join(', ')}
        className="flex-row items-center rounded-2xl p-2.5"
        style={{ backgroundColor: `${tint}66` }}
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
          icon={<Eye size={11} color="#141311" strokeWidth={1.5} />}
          onPress={open}
          accessibilityLabel={`View ${creator.name}`}
        />
        <CardButton
          label="Call"
          icon={<Phone size={11} color="#141311" strokeWidth={1.5} />}
          onPress={() => callNumber(creator.phone, creator.name)}
          accessibilityLabel={`Call ${creator.name}`}
        />
        <CardButton
          label="WhatsApp"
          icon={<WhatsAppIcon size={12} />}
          onPress={() => openWhatsApp(creator.phone, creator.name)}
          accessibilityLabel={`WhatsApp ${creator.name}`}
        />
      </View>
    </Pressable>
  );
}

export function CampaignCreators({ leadId }: { leadId: string }) {
  const creators = useLeadCreators(leadId);
  const { data } = creators;
  const openAll = () =>
    router.push({ pathname: '/leads/creators', params: { id: leadId, from: 'campaign' } });

  return (
    <View className="gap-[21px] rounded-[20px] border border-[rgba(232,226,217,0.5)] bg-white px-5 pb-5 pt-6">
      <Pressable
        onPress={openAll}
        accessibilityRole="button"
        accessibilityHint="Opens all the campaign's creators"
        className="flex-row items-center justify-between active:opacity-70"
      >
        <Text className="font-inter-semibold text-base leading-5 text-[#1D1D1F]">Creators</Text>
        <ChevronRight size={20} color="#8A8A8E" strokeWidth={1.67} />
      </Pressable>

      {data && data.length > 0 ? (
        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-inter-bold text-sm leading-5 tracking-[-0.35px] text-[#141311]">
              Top Creators
            </Text>
            <Pressable onPress={openAll} hitSlop={8} accessibilityRole="link">
              {({ pressed }) => (
                <Text
                  className={`font-inter-semibold text-xs leading-4 ${pressed ? 'text-[#141311]' : 'text-[#8C8A84]'}`}
                >
                  View all {data.length}
                </Text>
              )}
            </Pressable>
          </View>
          {data.slice(0, SHOWN).map((creator, i) => (
            <CreatorRow key={creator.id} creator={creator} tint={creatorTint(i)} leadId={leadId} />
          ))}
        </View>
      ) : (
        <Text className="font-inter text-sm leading-[21px] text-[#6E6E73]">
          {data
            ? 'No creators on this campaign yet.'
            : creators.isError
              ? 'We couldn’t load the creators.'
              : 'Loading creators…'}
        </Text>
      )}
    </View>
  );
}
