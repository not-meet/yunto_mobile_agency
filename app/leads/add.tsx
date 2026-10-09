import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { Reveal } from '@/components/common/Reveal';
import {
  AddLeadForm,
  EMPTY_LEAD,
  type LeadDraft,
  toCreateLeadRequest,
} from '@/components/leads/AddLeadForm';
import { CampaignTypeToggle } from '@/components/leads/CampaignTypeToggle';
import { LeadAdded } from '@/components/leads/LeadAdded';
import { NichePicker } from '@/components/leads/NichePicker';
import { PlatformPicker } from '@/components/leads/PlatformPicker';
import { useCreateLead } from '@/hooks/useLeads';
import { createLeadRequest } from '@/services/leadsService';
import { newIdempotencyKey } from '@/utils/api';

// Adds a lead by hand, opened from the + in the bottom nav: campaign type, platforms, niches and
// the brand's details. Once it's added the screen turns into a confirmation with what was
// saved, from where the lead can be opened.

export default function AddLeadScreen() {
  const insets = useSafeAreaInsets();
  const create = useCreateLead();
  const [draft, setDraft] = useState<LeadDraft>(EMPTY_LEAD);
  const request = createLeadRequest.safeParse(toCreateLeadRequest(draft));
  const created = create.data;

  const change = (next: LeadDraft) => {
    setDraft(next);
    // Any change clears a failed attempt's error.
    if (create.isError) create.reset();
  };
  const set = <K extends keyof LeadDraft>(key: K, next: LeadDraft[K]) =>
    change({ ...draft, [key]: next });

  const submit = () => {
    if (!request.success) return;
    create.mutate({ lead: request.data, idempotencyKey: newIdempotencyKey() });
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref="/home" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
        >
          Add Lead
        </Text>
      </View>

      {created ? (
        <ScrollView
          // A fresh scroll view, so the confirmation opens at the top.
          key="added"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            gap: 24,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <LeadAdded lead={created} />
          <Reveal order={3}>
            <View className="gap-3">
              <Button
                label="View Lead"
                onPress={() =>
                  router.replace({ pathname: '/leads/[id]', params: { id: created.id } })
                }
              />
              <Button
                label="Back to Home"
                variant="secondary"
                onPress={() => router.dismissTo('/home')}
              />
            </View>
          </Reveal>
        </ScrollView>
      ) : (
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              gap: 24,
              paddingHorizontal: 24,
              paddingTop: 4,
              paddingBottom: insets.bottom + 24,
            }}
          >
            <Reveal order={0}>
              <CampaignTypeToggle
                value={draft.campaignType}
                onChange={(next) => set('campaignType', next)}
              />
            </Reveal>
            <Reveal order={1}>
              <PlatformPicker
                selected={draft.platforms}
                onChange={(next) => set('platforms', next)}
              />
            </Reveal>
            <Reveal order={2}>
              <NichePicker selected={draft.niches} onChange={(next) => set('niches', next)} />
            </Reveal>
            <Reveal order={3}>
              <AddLeadForm value={draft} onChange={change} />
            </Reveal>

            <Reveal order={4}>
              <View className="gap-3">
                {create.isError ? (
                  <Text
                    accessibilityLiveRegion="polite"
                    className="pl-1 font-inter-medium text-[13px] leading-4 text-rose-500"
                  >
                    We couldn’t add this lead. Please try again.
                  </Text>
                ) : null}
                <Button
                  label="Add Lead"
                  onPress={submit}
                  disabled={!request.success}
                  disabledReason={request.error?.issues[0]?.message ?? null}
                  loading={create.isPending}
                />
              </View>
            </Reveal>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
