import { X } from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import type { AssignableCreator } from '@/services/teamService';

// Confirming creators come off a member on their profile: who's affected, then Cancel / Remove.
// They go back to unassigned. Stays open while `busy`; the caller closes it once it's done.

// The initials' tints, after the confirm design: one per row in turn.
const INITIAL_TINTS = [
  { background: '#FCE2E8', text: '#D04068' },
  { background: '#DCE9FE', text: '#2A69AC' },
  { background: '#E0D7FE', text: '#6D28D9' },
  { background: '#DCF5E3', text: '#1F7A45' },
];

interface RemoveCreatorsSheetProps {
  visible: boolean;
  onClose: () => void;
  creators: AssignableCreator[];
  // First name, e.g. "Neeraj".
  memberName: string;
  onConfirm: () => void;
  busy: boolean;
  error: string | null;
}

export function RemoveCreatorsSheet({
  visible,
  onClose,
  creators,
  memberName,
  onConfirm,
  busy,
  error,
}: RemoveCreatorsSheetProps) {
  const close = busy ? () => {} : onClose;
  const noun = creators.length === 1 ? 'creator' : 'creators';

  return (
    <BottomSheet visible={visible} onClose={close}>
      <View className="mt-4 flex-row items-start justify-between gap-3 pt-2">
        <Text
          accessibilityRole="header"
          className="flex-1 font-inter-bold text-[19px] leading-[26px] tracking-[-0.475px] text-[#181715]"
        >
          Remove {creators.length} {noun} from {memberName}?
        </Text>
        <Pressable
          onPress={close}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="h-9 w-9 items-center justify-center rounded-full bg-[#F8F8F8] active:opacity-70"
        >
          <X size={20} color="#555555" strokeWidth={1.67} />
        </Pressable>
      </View>

      <ScrollView
        className="mt-4 max-h-[214px] grow-0"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingTop: 4 }}
      >
        {creators.map((creator, i) => {
          const tint = INITIAL_TINTS[i % INITIAL_TINTS.length] ?? INITIAL_TINTS[0]!;
          return (
            <View
              key={creator.id}
              accessible
              accessibilityLabel={`${creator.name}, ${creator.handle}`}
              className="flex-row items-center gap-3 rounded-2xl bg-[#F7F5F2] p-3.5"
            >
              <View
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: tint.background }}
              >
                <Text className="font-inter text-sm leading-5" style={{ color: tint.text }}>
                  {creator.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  numberOfLines={1}
                  className="font-inter-semibold text-[15px] leading-[22px] text-[#1C1A19]"
                >
                  {creator.name}
                </Text>
                <Text numberOfLines={1} className="font-inter text-[13px] leading-5 text-[#78736E]">
                  {creator.handle}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-3 pl-1 font-inter-medium text-[13px] leading-4 text-rose-500"
        >
          {error}
        </Text>
      ) : null}

      <View className="mt-4 flex-row gap-3 pt-3">
        <Pressable
          onPress={close}
          disabled={busy}
          accessibilityRole="button"
          className="h-[53px] flex-1 items-center justify-center rounded-full border border-[#DDD8D3] bg-white active:opacity-70"
        >
          <Text className="font-inter-semibold text-[15px] leading-[22px] text-[#191919]">
            Cancel
          </Text>
        </Pressable>
        <Pressable
          onPress={onConfirm}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${creators.length} ${noun}`}
          accessibilityState={{ busy }}
          className="h-[53px] flex-1 items-center justify-center rounded-full bg-[#B9251E] active:opacity-80"
          style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-inter-semibold text-[15px] leading-[22px] text-white">
              Remove {noun}
            </Text>
          )}
        </Pressable>
      </View>
    </BottomSheet>
  );
}
