import { useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { KeyboardAvoidingView, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/common/Avatar';
import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { ChatBubble } from '@/components/common/ChatBubble';
import { ChatInput } from '@/components/common/ChatInput';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { useChat, useSendChatMessage } from '@/hooks/useInbox';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

// A chat channel, opened from the home messages panel with its channel `id`: a direct message
// or a campaign's channel.

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const chat = useChat(id);
  const pull = usePullToRefresh(chat);
  const send = useSendChatMessage(id);
  const { data } = chat;
  const scroll = useRef<ScrollView>(null);

  return (
    <View className="flex-1 bg-[#F7F0E4]" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-3 px-[15px] py-4">
        <BackButton fallbackHref="/home" />
        {data ? (
          <>
            <View>
              <Avatar name={data.channel.name} url={data.channel.avatarUrl} size={44} />
              {data.channel.kind === 'direct' && data.channel.online ? (
                <View className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#4CAF50]" />
              ) : null}
            </View>
            <View className="flex-1">
              <Text
                accessibilityRole="header"
                numberOfLines={1}
                className="font-grotesk-bold text-xl leading-6 tracking-[-0.6px] text-espresso"
              >
                {data.channel.name}
              </Text>
              <Text className="font-inter-medium text-[13px] leading-4 text-muted">
                {data.channel.kind === 'campaign'
                  ? 'Campaign chat'
                  : data.channel.online
                    ? 'Online'
                    : 'Offline'}
              </Text>
            </View>
          </>
        ) : null}
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
            contentContainerStyle={{ gap: 12, paddingHorizontal: 20, paddingVertical: 16 }}
          >
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
            <ChatInput send={send} placeholder={`Message ${data.channel.name}`} />
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
        <ListSkeleton label="Loading chat" cardHeight={56} withFilters={false} />
      )}
    </View>
  );
}
