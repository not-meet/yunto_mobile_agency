import { Text, View } from 'react-native';

import { timeLabel } from '@/utils/dates';

// One chat message (talent chats, direct messages): the creator's on the right in dark, the
// other person's on the left.

interface ChatBubbleProps {
  text: string;
  // ISO timestamp.
  sentAt: string;
  mine: boolean;
}

export function ChatBubble({ text, sentAt, mine }: ChatBubbleProps) {
  return (
    <View className={`max-w-[80%] gap-1 ${mine ? 'items-end self-end' : 'items-start self-start'}`}>
      <View
        className={`rounded-[20px] px-4 py-2.5 ${
          mine ? 'rounded-br-md bg-cocoa' : 'rounded-bl-md border border-white bg-white/85'
        }`}
        style={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.04)' }}
      >
        <Text
          className={`font-inter-regular text-[15px] leading-[21px] ${
            mine ? 'text-white' : 'text-[#1A1A1A]'
          }`}
        >
          {text}
        </Text>
      </View>
      <Text className="px-1 font-inter-medium text-[11px] leading-[13px] text-[#999999]">
        {timeLabel(new Date(sentAt))}
      </Text>
    </View>
  );
}
