import { router } from 'expo-router';
import { UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { Reveal } from '@/components/common/Reveal';
import { AssignCreatorCard } from '@/components/team/AssignCreatorCard';
import { AssigneePickerSheet, assigneesOf, firstName } from '@/components/team/AssigneePickerSheet';
import { AssigningBanner } from '@/components/team/AssigningBanner';
import { AssignmentTabs } from '@/components/team/AssignmentTabs';
import { AssignSearchBar, matchesCreator } from '@/components/team/AssignSearchBar';
import { pluralCreators } from '@/components/team/labels';
import { SelectAllHeader } from '@/components/team/SelectAllHeader';
import { SelectionActionBar } from '@/components/team/SelectionActionBar';
import { UndoToast, useUndoToast } from '@/components/team/UndoToast';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useAssignCreators, useCreatorAssignment, useUnassignCreators } from '@/hooks/useTeam';
import { showToast } from '@/utils/notifications';

// Assign Creators' "Unassigned" tab: every creator nobody looks after yet. Pick who they go to
// (the footer button, or "Change" on the banner), tick creators, then "Assign to …" hands them
// over in place with an Undo. "Move to" (or "Assign to…" before anyone's picked) gives the
// ticked creators to someone else instead and opens that teammate's page.

// The open picker: choosing who this list goes to, or handing the ticked creators to someone.
// Keeps the creators it acts on while it fades out after closing.
type Picker = { kind: 'target' | 'handOff'; creatorIds: string[]; open: boolean } | null;

export default function UnassignedCreatorsScreen() {
  const insets = useSafeAreaInsets();
  const assignment = useCreatorAssignment();
  const pull = usePullToRefresh(assignment);
  const assign = useAssignCreators();
  const unassign = useUnassignCreators();
  const undo = useUndoToast();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [picker, setPicker] = useState<Picker>(null);
  // Bumped per opening so the picker starts fresh.
  const [pickerKey, setPickerKey] = useState(0);
  const { data } = assignment;

  const assignees = data ? assigneesOf(data) : [];
  const target = assignees.find((m) => m.id === targetId) ?? null;
  const unassigned = data?.unassignedCreators ?? [];
  // Drops picks someone else assigned meanwhile.
  const selectedIds = picked.filter((id) => unassigned.some((c) => c.id === id));
  const shown = unassigned.filter((c) => matchesCreator(c, query));
  const shownSelected = shown.filter((c) => selectedIds.includes(c.id)).length;
  const count = selectedIds.length;

  const openPicker = (kind: NonNullable<Picker>['kind']) => {
    if (assign.isError) assign.reset();
    setPickerKey((k) => k + 1);
    setPicker({ kind, creatorIds: selectedIds, open: true });
  };
  const closePicker = () => setPicker((now) => now && { ...now, open: false });
  const handingOff = picker?.kind === 'handOff';
  const handOffIds = picker?.creatorIds ?? [];

  const toggle = (id: string) =>
    setPicked((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));

  // Ticks everyone shown, or clears them when they're all ticked already.
  const toggleAll = () => {
    const ids = shown.map((c) => c.id);
    setPicked((now) =>
      shownSelected === shown.length
        ? now.filter((id) => !ids.includes(id))
        : [...new Set([...now, ...ids])],
    );
  };

  const assignToTarget = () => {
    if (!target || count === 0) return;
    const creatorIds = selectedIds;
    const memberId = target.id;
    assign.mutate(
      { creatorIds, memberId },
      {
        onSuccess: () => {
          setPicked([]);
          undo.show({
            message: `${pluralCreators(creatorIds.length)} assigned to ${firstName(target.name)}`,
            undo: () =>
              unassign.mutate(
                { creatorIds, memberId },
                {
                  onSuccess: undo.hide,
                  onError: () => showToast('We couldn’t undo that. Please try again.'),
                },
              ),
          });
        },
        onError: () => showToast('We couldn’t assign those creators. Please try again.'),
      },
    );
  };

  const footer =
    count > 0 ? (
      <SelectionActionBar
        count={count}
        onClear={() => setPicked([])}
        onMove={target ? () => openPicker('handOff') : undefined}
        action={
          target
            ? {
                label: `Assign to ${firstName(target.name)}`,
                icon: UserPlus,
                tone: 'light',
                onPress: assignToTarget,
                busy: assign.isPending,
              }
            : {
                label: 'Assign to…',
                icon: UserPlus,
                tone: 'light',
                onPress: () => openPicker('handOff'),
              }
        }
      />
    ) : undo.toast ? (
      <UndoToast
        message={undo.toast.message}
        onUndo={undo.toast.undo}
        undoing={unassign.isPending}
      />
    ) : !target && unassigned.length > 0 ? (
      <Button label="Assign creators" onPress={() => openPicker('target')} />
    ) : null;

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/team/assign-creators" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Assign Creators
        </Text>
      </View>
      <View className="px-5 pb-4">
        <AssignmentTabs
          value="unassigned"
          onChange={(next) => {
            if (next !== 'teams') return;
            if (router.canGoBack()) router.back();
            else router.replace('/team/assign-creators');
          }}
          unassigned={unassigned.length}
        />
      </View>

      {data ? (
        <>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={pull.refreshing}
                onRefresh={pull.onRefresh}
                colors={['#1F1A17']}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              gap: 16,
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 112,
            }}
          >
            {target ? (
              <AssigningBanner member={target} onChange={() => openPicker('target')} />
            ) : null}

            {unassigned.length > 0 ? (
              <>
                <AssignSearchBar value={query} onChange={setQuery} />
                <SelectAllHeader
                  selected={shownSelected}
                  total={shown.length}
                  onToggleAll={toggleAll}
                />
                <View className="flex-row items-center justify-between">
                  <Text
                    accessibilityRole="header"
                    className="font-inter-bold text-sm leading-5 tracking-[-0.35px] text-[#141311]"
                  >
                    All creators
                  </Text>
                  <Text className="font-inter text-xs leading-4 text-[#8C8A84]">
                    {shown.length} {shown.length === 1 ? 'result' : 'results'}
                  </Text>
                </View>
                {shown.length > 0 ? (
                  shown.map((creator, i) => (
                    <Reveal key={creator.id} order={Math.min(i, 6)}>
                      <AssignCreatorCard
                        creator={creator}
                        index={i}
                        selected={selectedIds.includes(creator.id)}
                        onToggle={() => toggle(creator.id)}
                        onOpen={() =>
                          router.push({ pathname: '/creators/[id]', params: { id: creator.id } })
                        }
                      />
                    </Reveal>
                  ))
                ) : (
                  <Text className="py-4 text-center font-inter-medium text-sm leading-5 text-muted">
                    No creators match “{query.trim()}”.
                  </Text>
                )}
              </>
            ) : (
              <Text className="py-4 text-center font-inter-medium text-sm leading-5 text-muted">
                Every creator has a POC already.
              </Text>
            )}
          </ScrollView>

          {footer ? (
            <View
              className="absolute inset-x-0 bottom-0 px-4"
              style={{ paddingBottom: insets.bottom + 16 }}
            >
              {footer}
            </View>
          ) : null}

          <AssigneePickerSheet
            key={pickerKey}
            visible={picker?.open ?? false}
            onClose={closePicker}
            title={
              handingOff
                ? `${target ? 'Move' : 'Assign'} ${pluralCreators(handOffIds.length)} to...`
                : 'Assign creators to...'
            }
            // Handing off goes to anyone but who the list's already going to.
            members={handingOff ? assignees.filter((m) => m.id !== targetId) : assignees}
            confirmLabel={(member) =>
              handingOff
                ? `Assign ${pluralCreators(handOffIds.length)} to ${firstName(member.name)}`
                : `Continue with ${firstName(member.name)}`
            }
            onConfirm={(member) => {
              if (!handingOff) {
                setTargetId(member.id);
                closePicker();
                return;
              }
              assign.mutate(
                { creatorIds: handOffIds, memberId: member.id },
                {
                  onSuccess: () => {
                    closePicker();
                    setPicked([]);
                    showToast(
                      `${pluralCreators(handOffIds.length)} assigned to ${firstName(member.name)}`,
                    );
                    router.replace({ pathname: '/team/assignee/[id]', params: { id: member.id } });
                  },
                },
              );
            }}
            busy={handingOff && assign.isPending}
            error={
              handingOff && assign.isError
                ? 'We couldn’t assign those creators. Please try again.'
                : null
            }
          />
        </>
      ) : assignment.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load your creators.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void assignment.refetch()}
              loading={assignment.isFetching}
            />
          </View>
        </View>
      ) : (
        <ListSkeleton label="Loading creators" cardHeight={212} />
      )}
    </View>
  );
}
