import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { calendarKey } from '@/hooks/useCreatorCalendar';
import {
  deleteContentMedia,
  getContentEditor,
  reorderContentMedia,
  saveContent,
  type SaveContentRequest,
  uploadContentMedia,
  type UploadMediaRequest,
} from '@/services/contentService';

// The content editor's piece and its saves. Every write refreshes the creator's calendar.

export function useContentEditor(creatorId: string, date: string, postId: string | null) {
  return useQuery({
    queryKey: ['creators', creatorId, 'content', date, postId ?? 'new'],
    queryFn: () => getContentEditor(creatorId, date, postId),
    // The editor keeps its own copy once open; a background refetch mustn't reset it.
    staleTime: Infinity,
    gcTime: 0,
  });
}

export function useSaveContent(creatorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    // The editor makes `idempotencyKey` once per tap; a retry of that mutation reuses it.
    mutationFn: ({
      content,
      idempotencyKey,
    }: {
      content: SaveContentRequest;
      idempotencyKey: string;
    }) => saveContent(creatorId, content, idempotencyKey),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: calendarKey(creatorId) }),
  });
}

export function useUploadContentMedia(creatorId: string) {
  return useMutation({
    mutationFn: ({ postId, files }: { postId: string; files: UploadMediaRequest['files'] }) =>
      uploadContentMedia(creatorId, postId, files),
  });
}

export function useReorderContentMedia(creatorId: string) {
  return useMutation({
    mutationFn: ({ postId, ids }: { postId: string; ids: string[] }) =>
      reorderContentMedia(creatorId, postId, ids),
  });
}

export function useDeleteContentMedia(creatorId: string) {
  return useMutation({
    mutationFn: ({ postId, mediaId }: { postId: string; mediaId: string }) =>
      deleteContentMedia(creatorId, postId, mediaId),
  });
}
