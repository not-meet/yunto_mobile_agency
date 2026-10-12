import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { Reveal } from '@/components/common/Reveal';
import { ApplyLeaveSheet } from '@/components/team/ApplyLeaveSheet';
import { LeaveBalanceCard } from '@/components/team/LeaveBalanceCard';
import { LeaveRequestRow } from '@/components/team/LeaveRequestRow';
import { useLeaves } from '@/hooks/useLeaves';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

// "Leaves", opened from Team Management: the member's leave balance, "Apply for leave" to ask for
// more, and the leaves they've applied for.

export default function LeavesScreen() {
  const insets = useSafeAreaInsets();
  const leaves = useLeaves();
  const pull = usePullToRefresh(leaves);
  const [applying, setApplying] = useState(false);
  const { data } = leaves;

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/team" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          RBAC
        </Text>
      </View>

      {data ? (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={pull.refreshing}
              onRefresh={pull.onRefresh}
              colors={['#1F1A17']}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            gap: 12,
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: insets.bottom + 40,
          }}
        >
          <Reveal order={0}>
            <LeaveBalanceCard balance={data.balance} onApply={() => setApplying(true)} />
          </Reveal>

          {data.requests.length > 0 ? (
            <Reveal order={1}>
              <Text
                accessibilityRole="header"
                className="px-1 pb-1 pt-5 font-inter-bold text-[11px] uppercase leading-4 tracking-[1.1px] text-[#AAAAAA]"
              >
                Applied
              </Text>
              <View className="gap-3">
                {data.requests.map((leave) => (
                  <LeaveRequestRow key={leave.id} leave={leave} />
                ))}
              </View>
            </Reveal>
          ) : null}
        </ScrollView>
      ) : leaves.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load your leaves.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void leaves.refetch()}
              loading={leaves.isFetching}
            />
          </View>
        </View>
      ) : (
        <ListSkeleton label="Loading leaves" cardHeight={271} withFilters={false} />
      )}

      {data ? (
        <ApplyLeaveSheet
          visible={applying}
          onClose={() => setApplying(false)}
          balance={data.balance}
        />
      ) : null}
    </View>
  );
}
