import { Image } from 'expo-image';
import {
  Check,
  CircleAlert,
  type LucideIcon,
  MessageCircle,
  Users,
  Video,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { ROLE_LABELS } from '@/components/talent/labels';
import type { CampaignChat } from '@/services/talentCampaignService';

// The campaign brief pinned at the top of a talent chat: who's in the chat, then the key
// message, audience, guidelines, deliverables and notes.

const AVATAR_BORDER = 'border-2 border-white';

// No photo (null): the grey circle stays as the placeholder.
function Avatar({ uri, size }: { uri: string | null; size: 32 | 44 }) {
  return (
    <View
      className={`${size === 44 ? 'h-11 w-11' : 'h-8 w-8'} overflow-hidden rounded-full bg-[#EAEAEA] ${AVATAR_BORDER}`}
      style={{
        boxShadow: `0px ${size === 44 ? 4 : 2}px ${size === 44 ? 12 : 6}px rgba(0, 0, 0, 0.06)`,
      }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          contentFit="cover"
          cachePolicy="memory-disk"
          accessible={false}
          style={{ flex: 1 }}
        />
      ) : null}
    </View>
  );
}

function Participants({ photoUrls, total }: CampaignChat['participants']) {
  const more = total - photoUrls.length;
  return (
    <View
      className="flex-row items-center pl-2.5"
      accessible
      accessibilityLabel={`${total} other ${total === 1 ? 'person' : 'people'} in this chat`}
    >
      {photoUrls.map((uri) => (
        <View key={uri} className="-ml-2.5">
          <Avatar uri={uri} size={32} />
        </View>
      ))}
      {more > 0 ? (
        <View
          className={`-ml-2.5 h-8 w-8 items-center justify-center rounded-full bg-white/90 ${AVATAR_BORDER}`}
          style={{ boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)' }}
        >
          <Text className="text-center font-inter-bold text-[11px] leading-[13px] text-[#555555]">
            +{more}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function Section({
  icon: Icon,
  color,
  title,
  children,
}: {
  icon: LucideIcon;
  color: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-3 self-stretch">
      <View
        className="flex-row items-center gap-1.5 self-start rounded-[14px] border border-white bg-white/85 px-3.5 py-1.5"
        style={{ boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.02)' }}
      >
        <Icon size={14} color={color} strokeWidth={1.17} />
        <Text
          accessibilityRole="header"
          className="font-inter-bold text-[13px] leading-4 text-[#333333]"
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function Paragraph({ text }: { text: string }) {
  return (
    <Text className="pl-1 font-inter-regular text-[15px] leading-6 text-[#444444]">{text}</Text>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View className="gap-1.5 pl-[22px]">
      {items.map((item) => (
        <View key={item} className="flex-row">
          <Text className="-ml-3.5 w-3.5 font-inter-regular text-[15px] leading-6 text-[#444444]">
            •
          </Text>
          <Text className="flex-1 font-inter-regular text-[15px] leading-6 text-[#444444]">
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function BriefCard({ chat }: { chat: CampaignChat }) {
  const { talent, participants, brief } = chat;

  return (
    <View
      className="gap-6 rounded-3xl border border-white p-6"
      style={{
        experimental_backgroundImage:
          'linear-gradient(162.99deg, rgba(255, 248, 242, 0.95) 0%, rgba(255, 252, 248, 0.95) 100%)',
        boxShadow:
          '0px 12px 40px rgba(0, 0, 0, 0.04), inset 0px 2px 6px 1px rgba(255, 255, 255, 0.9)',
      }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-3">
          <Avatar uri={talent.photoUrl} size={44} />
          <View className="flex-1 gap-0.5">
            <Text
              numberOfLines={1}
              className="font-inter-bold text-base leading-[19px] text-[#1A1A1A]"
            >
              {talent.name}
            </Text>
            <Text className="font-inter-medium text-xs leading-[15px] text-[#888888]">
              {ROLE_LABELS[talent.role].singular}
            </Text>
          </View>
        </View>
        <Participants {...participants} />
      </View>

      {brief.keyMessage ? (
        <Section icon={MessageCircle} color="#F57C00" title="Key message">
          <Paragraph text={brief.keyMessage} />
        </Section>
      ) : null}
      {brief.targetAudience ? (
        <Section icon={Users} color="#1976D2" title="Target audience">
          <Paragraph text={brief.targetAudience} />
        </Section>
      ) : null}
      {brief.guidelines.length > 0 ? (
        <Section icon={Check} color="#388E3C" title="Guidelines">
          <BulletList items={brief.guidelines} />
        </Section>
      ) : null}
      {brief.deliverables.length > 0 ? (
        <Section icon={Video} color="#7B1FA2" title="Deliverables">
          <BulletList items={brief.deliverables} />
        </Section>
      ) : null}
      {brief.notes.length > 0 ? (
        <Section icon={CircleAlert} color="#D32F2F" title="Notes">
          <BulletList items={brief.notes} />
        </Section>
      ) : null}
    </View>
  );
}
