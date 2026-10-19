import { ActivityIndicator, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { CARD_SHADOW } from '@/components/home/shared';
import { CreatorPickRow } from '@/components/team/CreatorPickRow';
import type { AssignableCreator } from '@/services/teamService';

// On a member's profile from Assign Creators: the creators they're the POC of. `creators` is
// undefined while they load.

interface AssignedCreatorsCardProps {
  creators: AssignableCreator[] | undefined;
  failed: boolean;
  onRetry: () => void;
  retrying: boolean;
}

export function AssignedCreatorsCard({
  creators,
  failed,
  onRetry,
  retrying,
}: AssignedCreatorsCardProps) {
  return (
    <View
      className="rounded-3xl border border-white/75 bg-white/55 px-5 pb-4"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <View className="flex-row items-center justify-between gap-3 border-b border-[rgba(226,232,240,0.3)] py-4">
        <Text
          accessibilityRole="header"
          className="font-inter-semibold text-sm leading-5 text-[#111111]"
        >
          Assigned Creators
        </Text>
        {creators ? (
          <View className="h-5 min-w-5 items-center justify-center rounded-full bg-[rgba(229,229,229,0.5)] px-1.5">
            <Text className="font-inter text-[11px] leading-4 text-[#A3A3A3]">
              {creators.length}
            </Text>
          </View>
        ) : null}
      </View>

      {creators ? (
        creators.length > 0 ? (
          <View className="gap-2 pt-4">
            {creators.map((creator) => (
              <CreatorPickRow key={creator.id} creator={creator} />
            ))}
          </View>
        ) : (
          <Text className="pt-4 text-center font-inter-medium text-sm leading-5 text-muted">
            Not the POC of any creator yet.
          </Text>
        )
      ) : failed ? (
        <View className="gap-3 pt-4">
          <Text className="text-center font-inter-medium text-sm leading-5 text-muted">
            We couldn’t load their creators.
          </Text>
          <Button label="Try again" variant="secondary" onPress={onRetry} loading={retrying} />
        </View>
      ) : (
        <ActivityIndicator color="#1F1A17" className="pt-6" />
      )}
    </View>
  );
}
