import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeOut, LinearTransition, useReducedMotion } from 'react-native-reanimated';

import { Avatar } from '@/components/common/Avatar';
import { BottomSheet } from '@/components/common/BottomSheet';
import { Switch } from '@/components/common/Switch';
import {
  useAcceptCreatorRequest,
  useCreatorRequests,
  useDeclineCreatorRequest,
  useSetCreatorListed,
} from '@/hooks/useCreators';
import type { CreatorRequest } from '@/services/creatorsService';
import { showToast } from '@/utils/notifications';

// Creators asking to join the agency, as on yunto-private: list them in the global pool, confirm
// them onto the roster, or delete the request. The switch keeps its own value so it moves the
// moment it is tapped (the platform switch otherwise snaps back until the cache catches up), and
// follows the cache again when an update lands or rolls back.

function RequestRow({ request }: { request: CreatorRequest }) {
  const accept = useAcceptCreatorRequest();
  const decline = useDeclineCreatorRequest();
  const setListed = useSetCreatorListed(request.id);
  const busy = accept.isPending || decline.isPending;
  const [listed, setLocalListed] = useState(request.listed);
  const [cached, setCached] = useState(request.listed);
  if (cached !== request.listed) {
    setCached(request.listed);
    setLocalListed(request.listed);
  }

  const toggleListed = () => {
    if (busy) return;
    const next = !listed;
    setLocalListed(next);
    setListed.mutate(next, {
      onError: () => showToast('Couldn’t update the listing. Please try again.'),
    });
  };

  return (
    <View className={`gap-2.5 ${busy ? 'opacity-60' : ''}`}>
      <View className="flex-row items-center gap-3 rounded-[28px] border border-[#EAEAEA] bg-[#F8F8F8] px-2.5 py-2.5">
        <Avatar name={request.name} url={request.avatarUrl} size={42} />
        <View className="flex-1">
          <Text numberOfLines={1} className="font-inter-semibold text-sm leading-[17px] text-black">
            {request.name}
          </Text>
          <Text numberOfLines={1} className="font-inter text-[11px] leading-[14px] text-black/70">
            {request.handle}
          </Text>
          <Text numberOfLines={1} className="font-inter text-[11px] leading-[14px] text-black/50">
            {request.email ?? '—'}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={toggleListed}
          disabled={busy}
          accessibilityRole="switch"
          accessibilityLabel={`List ${request.name}`}
          accessibilityState={{ checked: listed, disabled: busy }}
          className="h-10 flex-1 flex-row items-center justify-between rounded-full border border-[#EAEAEA] pl-4 pr-1.5 active:bg-[#F8F8F8]"
        >
          <Text className="font-inter-medium text-xs leading-4 text-black">List Creator</Text>
          <Switch value={listed} disabled={busy} onValueChange={toggleListed} />
        </Pressable>
        <Pressable
          onPress={() =>
            accept.mutate(request.id, {
              onSuccess: () => showToast(`${request.name} joined your creators`),
              onError: () => showToast('Couldn’t confirm this request. Please try again.'),
            })
          }
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={`Confirm ${request.name}`}
          className="h-10 w-[82px] items-center justify-center rounded-full border border-[#A0A7FB] active:opacity-70"
        >
          {accept.isPending ? (
            <ActivityIndicator size="small" color="#4150F7" />
          ) : (
            <Text className="font-inter-medium text-xs leading-4 text-[#4150F7]">Confirm</Text>
          )}
        </Pressable>
        <Pressable
          onPress={() =>
            decline.mutate(request.id, {
              onError: () => showToast('Couldn’t delete this request. Please try again.'),
            })
          }
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${request.name}’s request`}
          className="h-10 w-[76px] items-center justify-center rounded-full border border-[#EAEAEA] active:opacity-70"
        >
          {decline.isPending ? (
            <ActivityIndicator size="small" color="#141311" />
          ) : (
            <Text className="font-inter-medium text-xs leading-4 text-black">Delete</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

interface CreatorRequestSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function CreatorRequestSheet({ visible, onClose }: CreatorRequestSheetProps) {
  const requests = useCreatorRequests();
  const reduceMotion = useReducedMotion();
  const { data } = requests;

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Creator Request">
      <ScrollView
        className="mt-5 shrink grow-0"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 20, paddingBottom: 4 }}
      >
        {data ? (
          data.length > 0 ? (
            data.map((request) => (
              <Animated.View
                key={request.id}
                exiting={reduceMotion ? undefined : FadeOut.duration(150)}
                layout={reduceMotion ? undefined : LinearTransition.duration(250)}
              >
                <RequestRow request={request} />
              </Animated.View>
            ))
          ) : (
            <Text className="py-8 text-center font-inter-medium text-sm leading-5 text-muted">
              No pending creator requests.
            </Text>
          )
        ) : requests.isError ? (
          <Text className="py-8 text-center font-inter-medium text-sm leading-5 text-muted">
            We couldn’t load creator requests.
          </Text>
        ) : (
          <ActivityIndicator className="py-8" color="#8C8A84" />
        )}
      </ScrollView>
    </BottomSheet>
  );
}
