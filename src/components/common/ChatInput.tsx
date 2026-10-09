import { Send } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { sanitizeChatMessage } from '@/utils/sanitize';
import { PLACEHOLDER_COLOR } from '@/utils/constants';

// The message field at the bottom of a chat (talent chats, direct messages), with a glossy send
// button. `send` is the chat's send-message mutation.

const SEND_GRADIENT =
  'radial-gradient(92.83% 170.66% at 18% 20%, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0) 20%), radial-gradient(93.35% 171.6% at 82% 18%, rgba(246, 214, 74, 0.3) 0%, rgba(246, 214, 74, 0) 18%), radial-gradient(86.46% 158.94% at 72% 88%, rgba(247, 183, 218, 0.4) 0%, rgba(247, 183, 218, 0) 22%), linear-gradient(118.54deg, rgba(255, 229, 164, 0.82) 0%, rgba(255, 245, 228, 0.92) 35%, rgba(244, 211, 238, 0.88) 72%, rgba(202, 217, 255, 0.76) 100%)';

interface SendMessage {
  mutate: (text: string, options: { onSuccess: () => void }) => void;
  reset: () => void;
  isPending: boolean;
  isError: boolean;
}

interface ChatInputProps {
  send: SendMessage;
  placeholder: string;
}

export function ChatInput({ send, placeholder }: ChatInputProps) {
  const sending = send.isPending;
  const [text, setText] = useState('');
  const trimmed = text.trim();

  const submit = () => {
    if (!trimmed || sending) return;
    send.mutate(trimmed, { onSuccess: () => setText('') });
  };

  return (
    <View className="gap-2">
      {send.isError ? (
        <Text
          accessibilityLiveRegion="polite"
          className="pl-4 font-inter-medium text-[13px] leading-4 text-rose-500"
        >
          We couldn’t send your message. Please try again.
        </Text>
      ) : null}
      <View
        className="min-h-[58px] flex-row items-center gap-2 rounded-[32px] border border-black/5 bg-white/90 py-1.5 pl-4 pr-1.5"
        style={{ boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.06)' }}
      >
        <TextInput
          value={text}
          onChangeText={(next) => {
            setText(sanitizeChatMessage(next));
            if (send.isError) send.reset();
          }}
          placeholder={placeholder}
          placeholderTextColor={PLACEHOLDER_COLOR}
          multiline
          accessibilityLabel="Message"
          className="max-h-28 flex-1 px-0.5 py-0 font-inter-regular text-[15px] leading-[18px] text-[#1A1A1A]"
        />
        <Pressable
          onPress={submit}
          disabled={!trimmed || sending}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          accessibilityState={{ disabled: !trimmed, busy: sending }}
          className={`h-11 w-11 items-center justify-center self-end rounded-full active:opacity-70 ${
            trimmed ? '' : 'opacity-60'
          }`}
          style={{
            experimental_backgroundImage: SEND_GRADIENT,
            boxShadow: '0px 4px 12px rgba(244, 143, 177, 0.3)',
          }}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#3A3A3A" />
          ) : (
            <Send size={18} color="#3A3A3A" strokeWidth={1.5} />
          )}
        </Pressable>
      </View>
    </View>
  );
}
