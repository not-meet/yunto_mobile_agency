import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  acceptCreatorRequest,
  createCreator,
  type CreateCreatorRequest,
  type CreatorRequest,
  declineCreatorRequest,
  getCreator,
  getCreatorRequests,
  searchCreators,
  type SearchCreatorsRequest,
  setCreatorListed,
} from '@/services/creatorsService';
import { STALE_TIME } from '@/utils/queryCache';

// e.g. ['creators', 'search', { scope: 'ours', … }] and ['creators', 'creator_01'].
const CREATORS_KEY = ['creators'];
const searchKey = (search: SearchCreatorsRequest) => [...CREATORS_KEY, 'search', search];
const creatorKey = (id: string) => [...CREATORS_KEY, id];
const REQUESTS_KEY = [...CREATORS_KEY, 'requests'];

// Keeps showing the last results while a new search or filter loads, so the list doesn't blank
// out between keystrokes.
export function useCreators(search: SearchCreatorsRequest) {
  return useQuery({
    queryKey: searchKey(search),
    queryFn: () => searchCreators(search),
    staleTime: STALE_TIME.owned,
    placeholderData: keepPreviousData,
  });
}

export function useCreator(id: string) {
  return useQuery({
    queryKey: creatorKey(id),
    queryFn: () => getCreator(id),
    staleTime: STALE_TIME.owned,
  });
}

export function useCreateCreator() {
  const queryClient = useQueryClient();
  return useMutation({
    // The sheet makes `idempotencyKey` once per tap; a retry of that mutation reuses it.
    mutationFn: ({
      creator,
      idempotencyKey,
    }: {
      creator: CreateCreatorRequest;
      idempotencyKey: string;
    }) => createCreator(creator, idempotencyKey),
    onSuccess: (created) => {
      queryClient.setQueryData(creatorKey(created.id), created);
      void queryClient.invalidateQueries({ queryKey: [...CREATORS_KEY, 'search'] });
    },
  });
}

export function useCreatorRequests() {
  return useQuery({
    queryKey: REQUESTS_KEY,
    queryFn: getCreatorRequests,
    staleTime: STALE_TIME.live,
  });
}

// Confirming or deleting a request takes it off the sheet; a confirmed creator joins the roster.
function useAnswerCreatorRequest(answer: (id: string) => Promise<void>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: answer,
    onSuccess: (_, id) => {
      queryClient.setQueryData<CreatorRequest[]>(REQUESTS_KEY, (requests) =>
        requests?.filter((r) => r.id !== id),
      );
      void queryClient.invalidateQueries({ queryKey: [...CREATORS_KEY, 'search'] });
    },
  });
}

export const useAcceptCreatorRequest = () => useAnswerCreatorRequest(acceptCreatorRequest);
export const useDeclineCreatorRequest = () => useAnswerCreatorRequest(declineCreatorRequest);

// Flips the request's switch straight away and puts it back if the update fails. Updates for the
// same request run one after another, so quick taps land in order and a failed one rolls back to
// what was there before it rather than guessing.
export function useSetCreatorListed(id: string) {
  const queryClient = useQueryClient();
  const setRequestListed = (listed: boolean) =>
    queryClient.setQueryData<CreatorRequest[]>(REQUESTS_KEY, (requests) =>
      requests?.map((r) => (r.id === id ? { ...r, listed } : r)),
    );
  return useMutation({
    scope: { id: `creator-listed-${id}` },
    mutationFn: (listed: boolean) => setCreatorListed(id, listed),
    onMutate: async (listed) => {
      await queryClient.cancelQueries({ queryKey: REQUESTS_KEY });
      const previous = queryClient
        .getQueryData<CreatorRequest[]>(REQUESTS_KEY)
        ?.find((r) => r.id === id)?.listed;
      setRequestListed(listed);
      return { previous };
    },
    onError: (_, listed, context) => setRequestListed(context?.previous ?? !listed),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...CREATORS_KEY, 'search'] });
    },
  });
}
