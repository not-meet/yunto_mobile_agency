import type { UseQueryResult } from '@tanstack/react-query';
import type { Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BudgetCard } from '@/components/campaigns/BudgetCard';
import { EditFeeSheet } from '@/components/campaigns/EditFeeSheet';
import { EditPayoutSheet } from '@/components/campaigns/EditPayoutSheet';
import { type PaymentTab, PaymentTabs } from '@/components/campaigns/PaymentTabs';
import { PaymentTotals } from '@/components/campaigns/PaymentTotals';
import { PayoutRow } from '@/components/campaigns/PayoutRow';
import { PayoutSection } from '@/components/campaigns/PayoutSection';
import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { Reveal } from '@/components/common/Reveal';
import { openLink } from '@/components/leads/contact';
import { LeadDetailsSkeleton } from '@/components/leads/LeadDetailsSkeleton';
import type { AgencyFeeMutation } from '@/hooks/usePayments';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import type { CreatorPayout, PayoutGroup, Payments } from '@/services/paymentsService';

// The payment summary, as on the web: what the agency earns against the brand's budget, then
// its own creators and each external agency's, with their fees, the advance and the totals.
// "Agency costs" shows what the agency's own creators are making; "Your creators" shows where
// every creator's fee stands. Each group's agency fee can be changed through `setFee`. On a lead,
// a creator's pencil also edits their payout; on a campaign, the payouts are settled.

export type PaymentSummaryEditing =
  { kind: 'lead'; leadId: string } | { kind: 'campaign'; campaignId: string };

interface PaymentSummaryScreenProps {
  // The lead or campaign, for the top card and the pull to refresh.
  owner: UseQueryResult<unknown>;
  // Shown once the owner has loaded.
  heading: { name: string; subtitle: string; badge: { label: string; active: boolean } } | null;
  payments: UseQueryResult<Payments>;
  editing: PaymentSummaryEditing;
  setFee: AgencyFeeMutation;
  fallbackHref: Href;
}

export function PaymentSummaryScreen({
  owner,
  heading,
  payments,
  editing,
  setFee,
  fallbackHref,
}: PaymentSummaryScreenProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const pull = usePullToRefresh(owner, payments);
  const [tab, setTab] = useState<PaymentTab>('costs');
  // What's being edited. Kept after the sheet closes so it fades out intact.
  const [payout, setPayout] = useState<CreatorPayout | null>(null);
  const [group, setGroup] = useState<PayoutGroup | null>(null);
  const [sheet, setSheet] = useState<'payout' | 'fee' | null>(null);
  // Re-keys the sheets per opening, so their field starts from the current value.
  const [sheetKey, setSheetKey] = useState(0);

  const open = (next: 'payout' | 'fee') => {
    setSheetKey((key) => key + 1);
    setSheet(next);
  };

  const data = heading ? payments.data : undefined;
  const everyone = data?.groups.flatMap((g) => g.creators) ?? [];

  return (
    <View className="flex-1 bg-[#F7F4EE]" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between gap-3 bg-[rgba(247,244,238,0.9)] pb-3 pl-5 pr-5 pt-4">
        <View className="shrink flex-row items-center gap-3.5">
          <BackButton tone="dark" fallbackHref={fallbackHref} />
          <Text
            accessibilityRole="header"
            numberOfLines={1}
            className="shrink font-jakarta-bold text-xl leading-7 tracking-[-0.5px] text-[#1A1C1E]"
          >
            Payment Summary
          </Text>
        </View>
        {data?.invoiceUrl ? (
          <Pressable
            onPress={() => {
              if (data.invoiceUrl) openLink(data.invoiceUrl);
            }}
            hitSlop={8}
            accessibilityRole="link"
            accessibilityLabel="Open invoice"
            className="active:opacity-70"
          >
            <Text className="font-jakarta-semibold text-xs leading-4 text-[#1A1C1E] underline">
              Invoice Link
            </Text>
          </Pressable>
        ) : null}
      </View>

      {data && heading ? (
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
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: insets.bottom + 32,
            gap: 16,
          }}
        >
          <Reveal order={0}>
            <BudgetCard {...heading} payments={data} />
          </Reveal>
          <Reveal order={1}>
            <PaymentTabs selected={tab} onSelect={setTab} />
          </Reveal>
          <Reveal order={2}>
            <Animated.View
              key={tab}
              entering={reduceMotion ? undefined : FadeIn.duration(250)}
              className="gap-4"
            >
              {data.groups.map((g) => (
                <PayoutSection
                  key={g.key}
                  title={g.agency ?? 'Creator payouts (internal)'}
                  tag={g.agency && tab === 'costs' ? 'External' : undefined}
                  subtitle={g.agency ? 'Creator payouts (External)' : undefined}
                  total={g.subtotal}
                  fee={{ percent: g.feePercent, amount: g.feeAmount }}
                  onEditFee={() => {
                    setGroup(g);
                    open('fee');
                  }}
                >
                  {g.creators.map((p, i) => (
                    <PayoutRow
                      key={p.id}
                      payout={p}
                      index={everyone.indexOf(p)}
                      showNegotiation={tab === 'creators' || g.agency !== null}
                      first={i === 0}
                      onEdit={
                        editing.kind === 'lead'
                          ? () => {
                              setPayout(p);
                              open('payout');
                            }
                          : undefined
                      }
                    />
                  ))}
                </PayoutSection>
              ))}
              {data.groups.length === 0 ? (
                <Text className="py-6 text-center font-jakarta-medium text-sm leading-5 text-[#8C8E95]">
                  No creators yet.
                </Text>
              ) : null}
              <PaymentTotals payments={data} />
            </Animated.View>
          </Reveal>
        </ScrollView>
      ) : owner.isError || payments.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load the payment summary.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => {
                if (owner.isError) void owner.refetch();
                if (payments.isError) void payments.refetch();
              }}
              loading={owner.isFetching || payments.isFetching}
            />
          </View>
        </View>
      ) : (
        <LeadDetailsSkeleton label="Loading payment summary" />
      )}

      {editing.kind === 'lead' ? (
        <EditPayoutSheet
          key={`payout-${sheetKey}`}
          leadId={editing.leadId}
          payout={payout}
          visible={sheet === 'payout'}
          onClose={() => setSheet(null)}
        />
      ) : null}
      <EditFeeSheet
        key={`fee-${sheetKey}`}
        setFee={setFee}
        group={group}
        visible={sheet === 'fee'}
        onClose={() => setSheet(null)}
      />
    </View>
  );
}
