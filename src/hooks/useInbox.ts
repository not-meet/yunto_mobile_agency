import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { type Chat, getChat, getInbox, type Inbox, sendChatMessage } from '@/services/inboxService';
import { newIdempotencyKey } from '@/utils/api';
import { STALE_TIME } from '@/utils/queryCache';

const INBOX_KEY = ['inbox'];

// Fetched the first time the messages panel opens, then served from cache (refreshed in the
// background once stale) on later opens.
export function useInbox(enabled: boolean) {
  return useQuery({ queryKey: INBOX_KEY, queryFn: getInbox, enabled, staleTime: STALE_TIME.live });
}

const chatKey = (channelId: string) => ['inbox', 'chats', channelId];

// A direct message or campaign channel. Opening it marks it read, so the panel's list is
// refreshed once it loads.
export function useChat(channelId: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: chatKey(channelId),
    queryFn: async () => {
      // The inbox the chat was opened from says whether it's a campaign channel.
      const inbox = queryClient.getQueryData<Inbox>(INBOX_KEY);
      const campaign = inbox?.campaigns.some((c) => c.channelId === channelId) ?? false;
      const chat = await getChat(channelId, campaign ? 'campaign' : 'direct');
      void queryClient.invalidateQueries({ queryKey: INBOX_KEY, exact: true });
      return chat;
    },
    staleTime: STALE_TIME.live,
  });
}

// Each send is one user action, so it gets its own Idempotency-Key. The response holds the sent
// message plus anything newer than the last message on screen; ids already shown are skipped.
export function useSendChatMessage(channelId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => {
      const afterId = queryClient.getQueryData<Chat>(chatKey(channelId))?.messages.at(-1)?.id;
      return sendChatMessage(channelId, { text, afterId }, newIdempotencyKey());
    },
    onSuccess: (messages) => {
      queryClient.setQueryData<Chat>(chatKey(channelId), (current) => {
        if (!current) return current;
        const shown = new Set(current.messages.map((m) => m.id));
        return {
          ...current,
          messages: [...current.messages, ...messages.filter((m) => !shown.has(m.id))],
        };
      });
    },
  });
}

// Earlier names, kept for compatibility.
export const useDirectChat = useChat;
export const useSendDirectMessage = useSendChatMessage;
