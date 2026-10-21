import { router, useLocalSearchParams } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { Reveal } from '@/components/common/Reveal';
import { AssignCreatorCard } from '@/components/team/AssignCreatorCard';
import { AssigneePickerSheet, assigneesOf, firstName } from '@/components/team/AssigneePickerSheet';
import { AssigneeProfileCard } from '@/components/team/AssigneeProfileCard';
import { AssignSearchBar, matchesCreator } from '@/components/team/AssignSearchBar';
import {
  type CreatorOrder,
  CreatorSortPills,
  sortCreators,
} from '@/components/team/CreatorSortPills';
import { ASSIGN_AS_LABELS, pluralCreators } from '@/components/team/labels';
import { RemoveCreatorsSheet } from '@/components/team/RemoveCreatorsSheet';
import { SelectionActionBar } from '@/components/team/SelectionActionBar';
import { UndoToast, useUndoToast } from '@/components/team/UndoToast';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import type { AssignableCreator } from '@/services/teamService';
import {
  useAssignCreators,
  useCreatorAssignment,
  useMember,
  useMemberCreators,
  useMoveCreators,
  useUnassignCreators,
} from '@/hooks/useTeam';
import { showToast } from '@/utils/notifications';

// A teammate's page from Assign Creators, opened with their `id` (and after handing them
// creators): who they are, then the creators they're the POC of, searchable and sortable. Tick
// creators to move them to someone else or remove them (back to unassigned), each with an Undo.

// The open sheet and the creators it acts on, kept while it fades out after closing.
type Sheet = { kind: 'move' | 'remove'; creators: AssignableCreator[]; open: boolean } | null;

export default function AssigneeScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const member = useMember(id);
  const creators = useMemberCreators(id);
  // Who else the creators can move to.
  const assignment = useCreatorAssignment();
  const pull = usePullToRefresh(member, creators);
  const move = useMoveCreators();
  const unassign = useUnassignCreators();
  const assign = useAssignCreators();
  const undo = useUndoToast();
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<CreatorOrder>('followers');
  const [picked, setPicked] = useState<string[]>([]);
  const [sheet, setSheet] = useState<Sheet>(null);
  // Bumped per opening so the move picker starts fresh.
  const [sheetKey, setSheetKey] = useState(0);
  const { data } = member;

  const all = creators.data ?? [];
  // Drops picks that moved off them meanwhile.
  const selected = all.filter((c) => picked.includes(c.id));
  const selectedIds = selected.map((c) => c.id);
  const shown = sortCreators(
    all.filter((c) => matchesCreator(c, query)),
    order,
  );
  const count = selected.length;
  const name = data ? firstName(data.name) : '';
  const others = assignment.data ? assigneesOf(assignment.data).filter((m) => m.id !== id) : [];

  const openSheet = (kind: NonNullable<Sheet>['kind']) => {
    move.reset();
    unassign.reset();
    setSheetKey((k) => k + 1);
    setSheet({ kind, creators: selected, open: true });
  };
  const closeSheet = () => setSheet((now) => now && { ...now, open: false });
  const acting = sheet?.creators ?? [];

  const toggle = (creatorId: string) =>
    setPicked((ids) =>
      ids.includes(creatorId) ? ids.filter((i) => i !== creatorId) : [...ids, creatorId],
    );

  const undoFailed = () => showToast('We couldn’t undo that. Please try again.');

  const remove = () => {
    const creatorIds = acting.map((c) => c.id);
    unassign.mutate(
      { creatorIds, memberId: id },
      {
        onSuccess: () => {
          closeSheet();
          setPicked([]);
          undo.show({
            message: `${pluralCreators(creatorIds.length)} removed from ${name}`,
            undo: () =>
              assign.mutate(
                { creatorIds, memberId: id },
                { onSuccess: undo.hide, onError: undoFailed },
              ),
          });
        },
      },
    );
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/team/assign-creators" />
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          {data ? ASSIGN_AS_LABELS[data.assignAs] : 'Member Profile'}
        </Text>
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
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: insets.bottom + 112,
            }}
          >
            <Reveal order={0}>
              <AssigneeProfileCard member={data} />
            </Reveal>

            <View className="flex-row items-center justify-between gap-3 px-1">
              <Text
                accessibilityRole="header"
                className="font-inter-medium text-base leading-6 text-[#181818]"
              >
                Assigned creators
                {creators.data ? ` (${String(all.length).padStart(2, '0')})` : ''}
              </Text>
              {count > 0 ? (
                <Text
                  accessibilityLiveRegion="polite"
                  className="font-inter-medium text-[13px] leading-5 text-[#6E42E5]"
                >
                  {count} selected
                </Text>
              ) : null}
            </View>

            {creators.data ? (
              all.length > 0 ? (
                <>
                  <AssignSearchBar value={query} onChange={setQuery} />
                  <CreatorSortPills value={order} onChange={setOrder} />
                  <View className="flex-row items-center justify-between">
                    <Text className="font-inter-bold text-sm leading-5 tracking-[-0.35px] text-[#141311]">
                      All Creators
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
                  Not the POC of any creator yet.
                </Text>
              )
            ) : creators.isError ? (
              <View className="gap-3">
                <Text className="text-center font-inter-medium text-sm leading-5 text-muted">
                  We couldn’t load their creators.
                </Text>
                <Button
                  label="Try again"
                  variant="secondary"
                  onPress={() => void creators.refetch()}
                  loading={creators.isFetching}
                />
              </View>
            ) : (
              <ActivityIndicator color="#1F1A17" className="pt-6" />
            )}
          </ScrollView>

          {count > 0 || undo.toast ? (
            <View
              className="absolute inset-x-0 bottom-0 px-4"
              style={{ paddingBottom: insets.bottom + 16 }}
            >
              {count > 0 ? (
                <SelectionActionBar
                  count={count}
                  onMove={() => openSheet('move')}
                  action={{
                    label: 'Remove',
                    icon: Trash2,
                    tone: 'danger',
                    onPress: () => openSheet('remove'),
                  }}
                />
              ) : undo.toast ? (
                <UndoToast
                  message={undo.toast.message}
                  onUndo={undo.toast.undo}
                  undoing={assign.isPending || move.isPending}
                />
              ) : null}
            </View>
          ) : null}

          <AssigneePickerSheet
            key={sheetKey}
            visible={sheet?.kind === 'move' && sheet.open}
            onClose={closeSheet}
            title={`Move ${pluralCreators(acting.length)} to...`}
            members={others}
            confirmLabel={(to) => `Move ${pluralCreators(acting.length)} to ${firstName(to.name)}`}
            onConfirm={(to) => {
              const creatorIds = acting.map((c) => c.id);
              move.mutate(
                { creatorIds, fromMemberId: id, toMemberId: to.id },
                {
                  onSuccess: () => {
                    closeSheet();
                    setPicked([]);
                    undo.show({
                      message: `${pluralCreators(creatorIds.length)} moved to ${firstName(to.name)}`,
                      undo: () =>
                        move.mutate(
                          { creatorIds, fromMemberId: to.id, toMemberId: id },
                          { onSuccess: undo.hide, onError: undoFailed },
                        ),
                    });
                  },
                },
              );
            }}
            busy={move.isPending}
            error={move.isError ? 'We couldn’t move those creators. Please try again.' : null}
          />
          <RemoveCreatorsSheet
            visible={sheet?.kind === 'remove' && sheet.open}
            onClose={closeSheet}
            creators={acting}
            memberName={name}
            onConfirm={remove}
            busy={unassign.isPending}
            error={unassign.isError ? 'We couldn’t remove those creators. Please try again.' : null}
          />
        </>
      ) : member.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load this member.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void member.refetch()}
              loading={member.isFetching}
            />
          </View>
        </View>
      ) : (
        <ListSkeleton label="Loading member" cardHeight={212} withFilters={false} />
      )}
    </View>
  );
}
