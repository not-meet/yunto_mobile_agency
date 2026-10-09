import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { Reveal } from '@/components/common/Reveal';
import { toggle } from '@/components/talent/BookingChips';
import { BookingAddOns } from '@/components/talent/BookingAddOns';
import { BookingSummary } from '@/components/talent/BookingSummary';
import { CostBreakdown } from '@/components/talent/CostBreakdown';
import { EditorAssets } from '@/components/talent/EditorAssets';
import {
  DEFAULT_EDIT,
  type EditDraft,
  EditorRequirements,
} from '@/components/talent/EditorRequirements';
import {
  EDITOR_ADD_ON_LABELS,
  parseBookingTarget,
  parseTalentRole,
  ROLE_LABELS,
  TIER_LABELS,
  VIDEOGRAPHER_ADD_ON_LABELS,
} from '@/components/talent/labels';
import { EMPTY_SHOOT, ShootDetails, type ShootDraft } from '@/components/talent/ShootDetails';
import { TalentHeader } from '@/components/talent/TalentHeader';
import { BookingSkeleton } from '@/components/talent/TalentSkeletons';
import { useBookTalent, useTalent } from '@/hooks/useTalents';
import {
  ADD_ON_PRICES,
  bookingDetailsSchema,
  editorAddOnSchema,
  quoteBooking,
  videographerAddOnSchema,
} from '@/services/talentService';
import { useTalentStore } from '@/store/talentStore';
import { newIdempotencyKey } from '@/utils/api';
import { showToast } from '@/utils/notifications';

// Confirms a videographer or editor for a lead or campaign, opened from Select on their profile
// with the talent's `id`, their `role` and the `leadId` or `campaignId`. Editors fill in edit
// requirements, videographers the shoot details; both pick paid add-ons, and videographers see
// the cost before confirming. A confirmed booking selects them there and goes back to it.

export default function TalentBookingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id: string;
    role?: string;
    leadId?: string;
    campaignId?: string;
  }>();
  const target = parseBookingTarget(params);
  const talent = useTalent(params.id);
  const { data } = talent;
  const role = data?.role ?? parseTalentRole(params.role);
  const tier = useTalentStore((s) => s.tier);
  const select = useTalentStore((s) => s.select);
  const book = useBookTalent(params.id);
  const [edit, setEdit] = useState<EditDraft>(DEFAULT_EDIT);
  const [shoot, setShoot] = useState<ShootDraft>(EMPTY_SHOOT);

  const details = bookingDetailsSchema.safeParse(
    role === 'editor' ? { role, ...edit } : { role, ...shoot },
  );

  // Any change clears a failed attempt's error.
  const clearError = () => {
    if (book.isError) book.reset();
  };
  const changeEdit = (next: EditDraft) => {
    setEdit(next);
    clearError();
  };
  const changeShoot = (next: ShootDraft) => {
    setShoot(next);
    clearError();
  };

  const confirm = () => {
    if (!data || !target || !details.success) return;
    book.mutate(
      {
        booking: {
          ...(target.kind === 'lead' ? { leadId: target.id } : { campaignId: target.id }),
          tier,
          details: details.data,
        },
        idempotencyKey: newIdempotencyKey(),
      },
      {
        onSuccess: () => {
          select(target.id, role, { id: data.id, name: data.name });
          showToast(`${data.name} booked`);
          // TODO(talent): go back to the lead or campaign once those screens exist.
          router.dismissTo('/home');
        },
      },
    );
  };

  return (
    <View className="flex-1 bg-[#FAF9F6]" style={{ paddingTop: insets.top }}>
      <TalentHeader title={`Confirm ${ROLE_LABELS[role].singular}`} />

      {data ? (
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              gap: 24,
              paddingHorizontal: 20,
              paddingTop: 4,
              paddingBottom: insets.bottom + 24,
            }}
          >
            <Reveal order={0}>
              <BookingSummary talent={data} />
            </Reveal>

            {role === 'editor' ? (
              <>
                <Reveal order={1}>
                  <EditorRequirements value={edit} onChange={changeEdit} />
                </Reveal>
                <Reveal order={2}>
                  <EditorAssets value={edit} onChange={changeEdit} />
                </Reveal>
                <Reveal order={3}>
                  <BookingAddOns
                    options={editorAddOnSchema.options}
                    labels={EDITOR_ADD_ON_LABELS}
                    selected={edit.addOns}
                    onToggle={(addOn) =>
                      changeEdit({ ...edit, addOns: toggle(edit.addOns, addOn) })
                    }
                  />
                </Reveal>
              </>
            ) : (
              <>
                <ShootDetails value={shoot} onChange={changeShoot} revealFrom={1} />
                <Reveal order={5}>
                  <BookingAddOns
                    options={videographerAddOnSchema.options}
                    labels={VIDEOGRAPHER_ADD_ON_LABELS}
                    selected={shoot.addOns}
                    onToggle={(addOn) =>
                      changeShoot({ ...shoot, addOns: toggle(shoot.addOns, addOn) })
                    }
                    compact
                  />
                </Reveal>
                {/* No estimate for a tier the talent hasn't priced. */}
                {data.rates[tier] === null ? null : (
                  <Reveal order={6}>
                    <CostBreakdown
                      quote={quoteBooking(data.rates[tier], shoot.addOns)}
                      baseLabel={`Base Rate (${TIER_LABELS[role][tier]})`}
                      addOns={shoot.addOns.map((addOn) => ({
                        label: VIDEOGRAPHER_ADD_ON_LABELS[addOn],
                        amount: ADD_ON_PRICES[addOn],
                      }))}
                    />
                  </Reveal>
                )}
              </>
            )}

            <Reveal order={role === 'editor' ? 4 : 7}>
              <View className="gap-3">
                {book.isError ? (
                  <Text
                    accessibilityLiveRegion="polite"
                    className="pl-1 font-inter-medium text-[13px] leading-4 text-rose-500"
                  >
                    We couldn’t confirm the booking. Please try again.
                  </Text>
                ) : null}
                <Button
                  label="Confirm Booking"
                  onPress={confirm}
                  disabled={!target || !details.success}
                  disabledReason={
                    !target
                      ? 'Open this from a lead or campaign to book'
                      : (details.error?.issues[0]?.message ?? null)
                  }
                  loading={book.isPending}
                />
              </View>
            </Reveal>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : talent.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load this profile.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void talent.refetch()}
              loading={talent.isFetching}
            />
          </View>
        </View>
      ) : (
        <BookingSkeleton />
      )}
    </View>
  );
}
