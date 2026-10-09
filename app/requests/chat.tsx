import { useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { KeyboardAvoidingView, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BriefCard } from '@/components/requests/BriefCard';
import { ChatSkeleton } from '@/components/requests/ChatSkeleton';
import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { ChatBubble } from '@/components/common/ChatBubble';
import { ChatInput } from '@/components/common/ChatInput';
import { useCampaignChat, useSendChatMessage } from '@/hooks/useTalentCampaigns';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

// Chat with a talent accepted for a campaign, with the campaign brief on top for context.
// Opened from an accepted request's "Open chat" (or a campaign in the messages panel) with the
// campaign's `id` and the `requestId`.

export default function CampaignChatScreen() {
  const insets = useSafeAreaInsets();
  const { id, requestId } = useLocalSearchParams<{ id: string; requestId: string }>();
  const chat = useCampaignChat(id, requestId);
  const pull = usePullToRefresh(chat);
  const send = useSendChatMessage(id, requestId);
  const { data } = chat;
  const scroll = useRef<ScrollView>(null);

  return (
    <View className="flex-1 bg-[#F7F0E4]" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-3 px-[15px] py-4">
        <BackButton fallbackHref={{ pathname: '/requests/[id]', params: { id } }} />
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          className="flex-1 font-grotesk-bold text-2xl leading-7 tracking-[-1px] text-espresso"
        >
          {data?.campaign.title ?? ''}
        </Text>
      </View>

      {data ? (
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <ScrollView
            refreshControl={<RefreshControl {...pull} />}
            ref={scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            // Keeps the newest message in view as messages arrive.
            onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
            contentContainerStyle={{ gap: 12, paddingHorizontal: 20, paddingBottom: 16 }}
          >
            <View className="pb-3">
              <BriefCard chat={data} />
            </View>
            {data.messages.map((message) => (
              <ChatBubble
                key={message.id}
                text={message.text}
                sentAt={message.sentAt}
                mine={message.from === 'me'}
              />
            ))}
          </ScrollView>
          <View className="px-5 pt-2" style={{ paddingBottom: insets.bottom + 12 }}>
            <ChatInput
              send={send}
              placeholder={`Message #${data.campaign.title.replace(/[^A-Za-z0-9]/g, '')}`}
            />
          </View>
        </KeyboardAvoidingView>
      ) : chat.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load this chat.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void chat.refetch()}
              loading={chat.isFetching}
            />
          </View>
        </View>
      ) : (
        <ChatSkeleton />
      )}
    </View>
  );
}
