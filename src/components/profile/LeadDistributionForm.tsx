import { UserMinus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LayoutAnimationConfig } from 'react-native-reanimated';

import { Button } from '@/components/common/Button';
import { ConfirmSheet } from '@/components/common/ConfirmSheet';
import { AddToSequenceSheet } from '@/components/profile/AddToSequenceSheet';
import { DistributionCard } from '@/components/profile/DistributionCard';
import {
  capitalize,
  CHANNEL_NOUNS,
  firstName,
  modeCopy,
} from '@/components/profile/distributionLabels';
import { DistributionOrder } from '@/components/profile/DistributionOrder';
import { PriorityRecipientCard } from '@/components/profile/PriorityRecipientCard';
import { PriorityRecipientSheet } from '@/components/profile/PriorityRecipientSheet';
import { MEMBERS_CHANGED, useUpdateLeadDistribution } from '@/hooks/useLeadDistribution';
import {
  type DistributionChannel,
  type DistributionMember,
  type DistributionMode,
  distributionModeSchema,
  type DistributionSettings,
} from '@/services/leadDistributionService';
import { apiErrorCode } from '@/utils/api';
import { showToast } from '@/utils/notifications';

// One tab of Lead Distribution (leads or campaigns): how they're handed out, the sequence they go
// out in (people added from a sheet, dragged into order, tapped to remove), the priority
// recipients who get priority ones first (picked the same way, in their own order), and Save Preferences, which is live once anything
// differs from what's saved. The screen keys it by the saved settings, so it starts over when
// they change.

interface LeadDistributionFormProps {
  channel: DistributionChannel;
  settings: DistributionSettings;
  members: DistributionMember[];
}

type Sheet = 'add' | 'priority' | 'remove' | null;

function sequenceCopy(mode: DistributionMode | null, one: string, many: string) {
  switch (mode) {
    case 'round-robin':
      return {
        title: `${capitalize(one)} assignment sequence`,
        subtitle: `Drag to reorder. ${capitalize(many)} go out in this order, then loop.`,
      };
    case 'broadcast':
      return {
        title: `${capitalize(one)} recipients`,
        subtitle: `Every new ${one} goes to all of these people. First to respond gets it.`,
      };
    default:
      return {
        title: `${capitalize(one)} recipients`,
        subtitle: `${capitalize(many)} go to one of these people at random.`,
      };
  }
}

export function LeadDistributionForm({ channel, settings, members }: LeadDistributionFormProps) {
  const save = useUpdateLeadDistribution();
  const { one, many } = CHANNEL_NOUNS[channel];

  const byId = new Map(members.map((m) => [m.id, m]));
  // Anyone who's left the team since is dropped (saving then catches the list up).
  const [mode, setMode] = useState<DistributionMode | null>(
    settings.mode === 'UNKNOWN' ? null : settings.mode,
  );
  const [sequence, setSequence] = useState(() => settings.sequence.filter((id) => byId.has(id)));
  const [priority, setPriority] = useState(() => settings.priority.filter((id) => byId.has(id)));

  // Which sheet is up. Each opens fresh (by key); `removing` outlives the sheet's fade-out.
  const [sheet, setSheet] = useState<Sheet>(null);
  const [opened, setOpened] = useState(0);
  const [removing, setRemoving] = useState<DistributionMember | null>(null);

  const open = (next: Exclude<Sheet, null>) => {
    setOpened((count) => count + 1);
    setSheet(next);
  };
  const close = () => setSheet(null);

  const queue = sequence.flatMap((id) => byId.get(id) ?? []);
  const recipients = priority.flatMap((id) => byId.get(id) ?? []);
  const roundRobin = mode === 'round-robin';
  const copy = sequenceCopy(mode, one, many);

  const changed =
    mode !== settings.mode ||
    sequence.join(',') !== settings.sequence.join(',') ||
    priority.join(',') !== settings.priority.join(',');

  const edit = () => {
    if (save.isError) save.reset();
  };

  const submit = () => {
    if (!mode || sequence.length === 0) return;
    save.mutate(
      { channel, settings: { mode, sequence, priority } },
      {
        onSuccess: () => showToast(`${capitalize(one)} preferences saved`),
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
    <LayoutAnimationConfig skipEntering>
      <View
        className="rounded-[28px] border border-black/[0.07] bg-white/[0.52] pb-5"
        style={{
          boxShadow: '0px 12px 40px rgba(130, 110, 200, 0.09), 0px 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Text className="px-5 pb-4 pt-5 font-inter text-[15px] leading-[22px] tracking-[-0.375px] text-[#111111]/70">
          Choose how you’d like {many} to be distributed among your team members.
        </Text>

        <View accessibilityRole="radiogroup" className="gap-3 px-[15px]">
          {distributionModeSchema.options.map((option) => {
            const selected = mode === option;
            const { label, description } = modeCopy(option, many);
            return (
              <Pressable
                key={option}
                onPress={() => {
                  setMode(option);
                  edit();
                }}
                accessibilityRole="radio"
                accessibilityLabel={`${label}. ${description}`}
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
                    {label}
                  </Text>
                  <Text className="font-inter text-[11px] leading-5 text-black/70">
                    {description}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text
        accessibilityRole="header"
        className="px-1 pt-7 font-inter-bold text-[11px] uppercase leading-4 tracking-[1.1px] text-[#AAAAAA]"
      >
        Assignment order
      </Text>

      <View className="mt-4">
        <DistributionCard
          title={copy.title}
          subtitle={copy.subtitle}
          onAdd={() => open('add')}
          addLabel="Add to sequence"
        >
          {queue.length > 0 ? (
            <DistributionOrder
              members={queue}
              reorderable={roundRobin}
              onChange={(next) => {
                setSequence(next);
                edit();
              }}
              onPressMember={(member) => {
                setRemoving(member);
                open('remove');
              }}
            />
          ) : (
            <Text className="py-2 text-center font-inter-medium text-[13px] leading-5 text-muted">
              No one’s in the sequence yet. Add team members so new {many} have somewhere to go.
            </Text>
          )}
        </DistributionCard>
      </View>

      <View className="mt-4">
        <PriorityRecipientCard
          recipients={recipients}
          noun={many}
          onAdd={() => open('priority')}
          onReorder={(next) => {
            setPriority(next);
            edit();
          }}
          onRemove={(id) => {
            setPriority((current) => current.filter((p) => p !== id));
            edit();
          }}
        />
      </View>

      {save.isError && apiErrorCode(save.error) !== MEMBERS_CHANGED ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-4 px-1 text-center font-inter-medium text-[13px] leading-4 text-rose-500"
        >
          We couldn’t save your preferences. Please try again.
        </Text>
      ) : null}

      <View className="mt-6">
        <Button
          label="Save Preferences"
          onPress={submit}
          disabled={!mode || sequence.length === 0 || !changed}
          disabledReason={
            !mode
              ? `Pick how ${many} are distributed`
              : sequence.length === 0
                ? 'Add someone to the sequence'
                : 'No changes to save'
          }
          loading={save.isPending}
        />
      </View>

      <AddToSequenceSheet
        key={`add-${opened}`}
        visible={sheet === 'add'}
        onClose={close}
        members={members}
        inSequence={sequence}
        onAdd={(ids) => {
          setSequence((current) => [...current, ...ids.filter((id) => !current.includes(id))]);
          edit();
          close();
        }}
      />

      <PriorityRecipientSheet
        key={`priority-${opened}`}
        visible={sheet === 'priority'}
        onClose={close}
        members={members}
        current={priority}
        noun={many}
        onPick={(ids) => {
          setPriority(ids);
          edit();
          close();
        }}
      />

      <ConfirmSheet
        visible={sheet === 'remove'}
        onClose={close}
        title={`Remove ${firstName(removing?.name ?? '')}?`}
        message={`${removing?.name ?? 'They'} won’t get ${many} from the sequence once you save. You can add them back anytime.`}
        icon={UserMinus}
        tone={{ color: '#D94C4C', background: '#FDECEC' }}
        confirmLabel="Remove"
        onConfirm={() => {
          if (removing) setSequence((current) => current.filter((id) => id !== removing.id));
          edit();
          close();
        }}
      />
    </LayoutAnimationConfig>
  );
}
