import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createCreator,
  type CreateCreatorRequest,
  getCreator,
  searchCreators,
  type SearchCreatorsRequest,
} from '@/services/creatorsService';
import { STALE_TIME } from '@/utils/queryCache';

// e.g. ['creators', 'search', { scope: 'ours', … }] and ['creators', 'creator_01'].
const CREATORS_KEY = ['creators'];
const searchKey = (search: SearchCreatorsRequest) => [...CREATORS_KEY, 'search', search];
const creatorKey = (id: string) => [...CREATORS_KEY, id];

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
