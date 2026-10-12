import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { DistributionOrder } from '@/components/profile/DistributionOrder';
import { MEMBERS_CHANGED, useUpdateLeadDistribution } from '@/hooks/useLeadDistribution';
import {
  type DistributionMode,
  distributionModeSchema,
  type LeadDistribution,
} from '@/services/leadDistributionService';
import { apiErrorCode } from '@/utils/api';
import { showToast } from '@/utils/notifications';

// The Lead Distribution card: how leads are handed out, the members they go to (in line, for
// round by round) and Save Preferences, which is live once anything differs from what's saved.
// The screen keys it by the saved preferences, so it starts over when they change.

const MODES: Record<DistributionMode, { label: string; description: string }> = {
  random: {
    label: 'Random',
    description: 'Distributes leads to any available person randomly.',
  },
  broadcast: {
    label: 'All (Broadcast)',
    description: 'Send leads to all team members. First to respond gets it.',
  },
  'round-robin': {
    label: 'Round by Round',
    description: 'Distributes leads one-by-one in a loop among team members.',
  },
};

const idsOf = (members: LeadDistribution['members']) => members.map((m) => m.id).join(',');

export function LeadDistributionForm({ distribution }: { distribution: LeadDistribution }) {
  const save = useUpdateLeadDistribution();
  const [mode, setMode] = useState<DistributionMode | null>(
    distribution.mode === 'UNKNOWN' ? null : distribution.mode,
  );
  const [members, setMembers] = useState(distribution.members);

  const changed = mode !== distribution.mode || idsOf(members) !== idsOf(distribution.members);
  const roundRobin = mode === 'round-robin';

  const clearError = () => {
    if (save.isError) save.reset();
  };

  const submit = () => {
    if (!mode) return;
    save.mutate(
      { mode, order: members.map((m) => m.id) },
      {
        onSuccess: () => showToast('Preferences saved'),
        // The list reloads with the current team (and this form with it), so say why here.
        onError: (error) => {
          if (apiErrorCode(error) === MEMBERS_CHANGED) {
            showToast('Your team changed. Check the list and save again.');
          }
        },
      },
    );
  };

  return (
    <View
      className="rounded-[28px] border border-black/[0.07] bg-white/[0.52] pb-5"
      style={{
        boxShadow: '0px 12px 40px rgba(130, 110, 200, 0.09), 0px 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <Text className="px-5 pb-4 pt-5 font-inter text-[15px] leading-[22px] tracking-[-0.375px] text-[#111111]/70">
        Choose how you’d like leads to be distributed among your team members.
      </Text>

      <View accessibilityRole="radiogroup" className="gap-3 px-[15px]">
        {distributionModeSchema.options.map((option) => {
          const selected = mode === option;
          return (
            <Pressable
              key={option}
              onPress={() => {
                setMode(option);
                clearError();
              }}
              accessibilityRole="radio"
              accessibilityLabel={`${MODES[option].label}. ${MODES[option].description}`}
              accessibilityState={{ checked: selected }}
              className="flex-row items-start gap-2.5 active:opacity-70"
            >
              <View className="h-6 w-6 items-center justify-center">
                <View
                  className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                    selected ? 'border-[#1D1B20]' : 'border-[#49454F]'
                  }`}
                >
                  {selected ? <View className="h-2.5 w-2.5 rounded-full bg-[#1D1B20]" /> : null}
                </View>
              </View>
              <View className="flex-1">
                <Text className="font-geist-medium text-[15px] leading-6 text-black">
                  {MODES[option].label}
                </Text>
                <Text className="font-inter text-[11px] leading-5 text-black/70">
                  {MODES[option].description}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-4 border-t border-black/[0.05] px-4 pt-4">
        <Text className="pb-2 font-inter-bold text-[11px] uppercase leading-4 tracking-[1.1px] text-[#AAAAAA]">
          {roundRobin ? 'Distribution order' : 'Team members'}
        </Text>
        {members.length > 0 ? (
          <DistributionOrder
            members={members}
            reorderable={roundRobin}
            onChange={(next) => {
              setMembers(next);
              clearError();
            }}
          />
        ) : (
          <Text className="py-2 font-inter-medium text-[13px] leading-5 text-muted">
            No one to hand leads to yet. Add members from Team Management.
          </Text>
        )}
        {roundRobin && members.length > 1 ? (
          <Text className="pt-2 font-inter text-[11px] leading-4 text-black/50">
            Drag to set who gets the next lead first.
          </Text>
        ) : null}
      </View>

      {save.isError && apiErrorCode(save.error) !== MEMBERS_CHANGED ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-3 px-5 font-inter-medium text-[13px] leading-4 text-rose-500"
        >
          We couldn’t save your preferences. Please try again.
        </Text>
      ) : null}

      <View className="mt-5 px-4">
        <Button
          label="Save Preferences"
          onPress={submit}
          disabled={!mode || !changed}
          disabledReason={!mode ? 'Pick how leads are distributed' : 'No changes to save'}
          loading={save.isPending}
        />
      </View>
    </View>
  );
}
