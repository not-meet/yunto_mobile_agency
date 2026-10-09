import { router } from 'expo-router';
import { ChevronRight, FileText, Layers, type LucideIcon, Megaphone, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInRight, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { InboxSkeleton } from '@/components/home/InboxSkeleton';
import { useInbox } from '@/hooks/useInbox';
import { usePressScale } from '@/hooks/usePressScale';
import type { DirectMessage, InboxCampaign } from '@/services/inboxService';
import { showToast } from '@/utils/notifications';

// What sits inside the messages panel: workspace header, the three chat sections, and the
// creator's own card at the bottom (opens the profile). Campaigns and direct messages both open
// their chat channel in the same chat screen.
// TODO(inbox): open the announcement feed once that screen exists.

// Rows ease in one after another, a beat after the panel starts sliding.
const ROW_DELAY_MS = 120;
const ROW_STAGGER_MS = 40;

const SELECTED_ROW =
  'linear-gradient(100.04deg, rgba(235, 228, 255, 0.7) 0%, rgba(255, 235, 242, 0.7) 100%)';

function SectionHeading({ children }: { children: string }) {
  return (
    <Text
      accessibilityRole="header"
      className="px-1.5 font-inter-bold text-xs uppercase leading-[15px] tracking-[0.8px] text-[#999999]"
    >
      {children}
    </Text>
  );
}

interface RowProps {
  order: number;
  label: string;
  // Starts the row: an icon or an avatar, in a 28px-wide slot.
  leading: ReactNode;
  // Ends the row: an unread dot or count.
  trailing?: ReactNode;
  unread?: boolean;
  selected?: boolean;
  onPress: () => void;
}

function Row({ order, label, leading, trailing, unread, selected, onPress }: RowProps) {
  const reduceMotion = useReducedMotion();
  const press = usePressScale(0.97);

  return (
    // The entrance and the press scale each get their own view, as both drive transform.
    <Animated.View
      entering={
        reduceMotion
          ? undefined
          : FadeInRight.delay(ROW_DELAY_MS + order * ROW_STAGGER_MS).duration(260)
      }
    >
      <Animated.View style={press.style}>
        <Pressable
          {...press.handlers}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={unread ? `${label}, unread` : label}
          className="flex-row items-center rounded-[18px] px-3.5 py-3 active:bg-black/[0.03]"
          style={
            selected
              ? {
                  experimental_backgroundImage: SELECTED_ROW,
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.02)',
                }
              : undefined
          }
        >
          <View className="min-w-7 items-center justify-center pr-3">{leading}</View>
          <Text
            numberOfLines={1}
            className={`flex-1 text-[15px] leading-[18px] ${
              selected
                ? 'font-inter-bold text-[#2B2240]'
                : unread
                  ? 'font-inter-bold text-[#1A1A1A]'
                  : 'font-inter-medium text-[#555555]'
            }`}
          >
            {label}
          </Text>
          {trailing}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <Animated.View
      entering={FadeIn.delay(300)}
      className="h-2 w-2 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

interface CampaignRowProps {
  campaign: InboxCampaign;
  order: number;
  onPress: () => void;
}

function CampaignRow({ campaign, order, onPress }: CampaignRowProps) {
  const unread = campaign.unreadCount > 0;
  return (
    <Row
      order={order}
      label={campaign.name}
      unread={unread}
      selected={unread}
      leading={<FileText size={20} color={unread ? '#BA68C8' : '#90CAF9'} strokeWidth={1.67} />}
      trailing={
        unread ? (
          <View
            className="rounded-xl bg-white/80 px-2.5 py-1"
            style={{ boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.03)' }}
          >
            <Text className="font-inter-bold text-xs leading-[15px] text-[#9C27B0]">
              {campaign.unreadCount > 99 ? '99+' : campaign.unreadCount}
            </Text>
          </View>
        ) : null
      }
      onPress={onPress}
    />
  );
}

interface DirectMessageRowProps {
  dm: DirectMessage;
  order: number;
  onPress: () => void;
}

function DirectMessageRow({ dm, order, onPress }: DirectMessageRowProps) {
  return (
    <Row
      order={order}
      label={dm.name}
      unread={dm.unread}
      leading={
        <View>
          <Avatar name={dm.name} url={dm.avatarUrl} size={32} />
          {dm.online ? (
            <View
              accessibilityLabel="Online"
              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#4CAF50]"
            />
          ) : null}
        </View>
      }
      trailing={dm.unread ? <Dot color="#4DB6AC" /> : null}
      onPress={onPress}
    />
  );
}

function CloseButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel="Close messages"
      className="h-9 w-9 items-center justify-center rounded-full bg-black/[0.03] active:opacity-60"
    >
      <X size={20} color="#666666" strokeWidth={1.67} />
    </Pressable>
  );
}

function WorkspaceLogo({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <View
      className="h-11 w-11 items-center justify-center rounded-[14px]"
      style={{
        experimental_backgroundImage: 'linear-gradient(90deg, #A2B5F5 0%, #8DC49D 100%)',
        boxShadow: '0px 4px 12px rgba(244, 143, 177, 0.3)',
      }}
    >
      <Icon size={22} color="#FFFFFF" strokeWidth={1.83} />
    </View>
  );
}

interface InboxContentProps {
  // Only fetched once the panel has been opened.
  open: boolean;
  onClose: () => void;
  // Closes the panel, then runs `action` once it's out of the way.
  closeThen: (action: () => void) => void;
}

export function InboxContent({ open, onClose, closeThen }: InboxContentProps) {
  const insets = useSafeAreaInsets();
  const inbox = useInbox(open);
  const { data } = inbox;
  const profilePress = usePressScale();

  return (
    <View className="flex-1">
      <View
        className="flex-row items-center gap-3.5 border-b border-black/[0.03] px-5 pb-6"
        style={{ paddingTop: insets.top + 20 }}
      >
        <WorkspaceLogo icon={Layers} />
        <View className="flex-1 gap-0.5">
          {data ? (
            <Animated.View entering={FadeIn.duration(200)}>
              <Text
                numberOfLines={1}
                className="font-inter-bold text-[19px] leading-[23px] tracking-[-0.4px] text-[#1A1A1A]"
              >
                {data.workspace.name}
              </Text>
            </Animated.View>
          ) : (
            <View className="my-1 h-4 w-24 rounded-md bg-black/[0.06]" />
          )}
          <Text className="font-inter-medium text-[13px] leading-4 text-[#888888]">Workspace</Text>
        </View>
        <CloseButton onPress={onClose} />
      </View>

      {data ? (
        <>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 24, paddingHorizontal: 12, gap: 28 }}
          >
            <View className="gap-3">
              <SectionHeading>Agency notifications</SectionHeading>
              <Row
                order={0}
                label="Announcements"
                unread={data.announcements.unread}
                leading={<Megaphone size={20} color="#FF8A65" strokeWidth={1.67} />}
                trailing={data.announcements.unread ? <Dot color="#FF8A65" /> : null}
                onPress={() => showToast('Announcements are coming soon')}
              />
            </View>

            {data.campaigns.length > 0 ? (
              <View className="gap-1">
                <SectionHeading>Campaigns</SectionHeading>
                {data.campaigns.map((campaign, i) => (
                  <CampaignRow
                    key={campaign.id}
                    campaign={campaign}
                    order={1 + i}
                    onPress={() =>
                      closeThen(() =>
                        router.push({
                          pathname: '/messages/[id]',
                          params: { id: campaign.channelId },
                        }),
                      )
                    }
                  />
                ))}
              </View>
            ) : null}

            {data.directMessages.length > 0 ? (
              <View className="gap-1">
                <SectionHeading>Direct messages</SectionHeading>
                {data.directMessages.map((dm, i) => (
                  <DirectMessageRow
                    key={dm.id}
                    dm={dm}
                    order={1 + data.campaigns.length + i}
                    onPress={() =>
                      closeThen(() =>
                        router.push({ pathname: '/messages/[id]', params: { id: dm.id } }),
                      )
                    }
                  />
                ))}
              </View>
            ) : null}
          </ScrollView>

          <Animated.View
            entering={FadeIn.delay(200).duration(260)}
            className="px-5 pt-4"
            style={{ paddingBottom: insets.bottom + 24 }}
          >
            <Animated.View style={profilePress.style}>
              <Pressable
                {...profilePress.handlers}
                onPress={() => showToast('Profile is coming soon')}
                accessibilityRole="button"
                accessibilityLabel={`${data.me.name}, open profile`}
                className="flex-row items-center gap-3.5 rounded-3xl border border-white bg-white/80 p-3.5"
                style={{ boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.04)' }}
              >
                <Avatar name={data.me.name} url={data.me.avatarUrl} size={44} />
                <View className="flex-1 gap-0.5">
                  <Text
                    numberOfLines={1}
                    className="font-inter-bold text-[15px] leading-[18px] text-[#1A1A1A]"
                  >
                    {data.me.name}
                  </Text>
                  {data.me.handle ? (
                    <Text
                      numberOfLines={1}
                      className="font-inter-medium text-[13px] leading-4 text-[#888888]"
                    >
                      @{data.me.handle}
                    </Text>
                  ) : null}
                </View>
                <ChevronRight size={18} color="#BBBBBB" strokeWidth={1.67} />
              </Pressable>
            </Animated.View>
          </Animated.View>
        </>
      ) : inbox.isError ? (
        <View className="flex-1 justify-center gap-4 px-5">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load your messages.
          </Text>
          <Button
            label="Try again"
            variant="secondary"
            onPress={() => void inbox.refetch()}
            loading={inbox.isFetching}
          />
        </View>
      ) : (
        <InboxSkeleton bottomInset={insets.bottom} />
      )}
    </View>
  );
}
