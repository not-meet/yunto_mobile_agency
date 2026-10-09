import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { CategoryFilters } from '@/components/talent/CategoryFilters';
import { DropdownMenu } from '@/components/common/DropdownMenu';
import {
  LEVEL_LABELS,
  bookingTargetParams,
  parseBookingTarget,
  parseTalentRole,
  ROLE_LABELS,
} from '@/components/talent/labels';
import { TalentDeck } from '@/components/talent/TalentDeck';
import { FOOTER_BUTTONS_TOP, TalentFooter } from '@/components/talent/TalentFooter';
import { TalentHeader } from '@/components/talent/TalentHeader';
import { TalentDeckSkeleton } from '@/components/talent/TalentSkeletons';
import { useTalents } from '@/hooks/useTalents';
import {
  INDIAN_STATES,
  type TalentCategory,
  type TalentRole,
  talentRoleSchema,
} from '@/services/talentService';
import { useTalentStore } from '@/store/talentStore';
import { dayMonth } from '@/utils/dates';

// Browse videographers or editors for a lead's or campaign's add-on. Opened from the add-on cards
// on a lead or campaign with `role` and `leadId` or `campaignId`.

const ROLE_OPTIONS = talentRoleSchema.options.map((value) => ({
  value,
  label: ROLE_LABELS[value].plural,
}));
const STATE_OPTIONS = INDIAN_STATES.map((value) => ({ value, label: value }));

export default function TalentBrowseScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ role?: string; leadId?: string; campaignId?: string }>();
  const target = parseBookingTarget(params);
  const role = parseTalentRole(params.role);
  const state = useTalentStore((s) => s.state);
  const setState = useTalentStore((s) => s.setState);
  const tier = useTalentStore((s) => s.tier);
  const setTier = useTalentStore((s) => s.setTier);
  const [category, setCategory] = useState<TalentCategory | null>(null);
  const [menu, setMenu] = useState<'role' | 'state' | null>(null);
  const talents = useTalents(role, { category, state, level: tier });
  const { data } = talents;
  const closeMenu = () => setMenu(null);

  return (
    <View className="flex-1 bg-[#FAF9F6]" style={{ paddingTop: insets.top }}>
      <TalentHeader
        title={ROLE_LABELS[role].plural}
        onTitlePress={() => setMenu('role')}
        titleExpanded={menu === 'role'}
        context={dayMonth(new Date())}
      />
      <CategoryFilters selected={category} onSelect={setCategory} />

      {data ? (
        data.length > 0 ? (
          <TalentDeck
            // A fresh deck, from the first profile, whenever the list changes.
            key={`${role}:${category}:${state}:${tier}`}
            talents={data}
            onOpen={(talent) =>
              router.push({
                pathname: '/talent/[id]',
                params: {
                  id: talent.id,
                  role,
                  ...bookingTargetParams(target),
                },
              })
            }
          />
        ) : (
          <View className="flex-1 items-center justify-center px-10">
            <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
              No {LEVEL_LABELS[tier].toLowerCase()} {ROLE_LABELS[role].plural.toLowerCase()}{' '}
              {category ? 'for this style ' : ''}yet.
            </Text>
          </View>
        )
      ) : talents.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load {ROLE_LABELS[role].plural.toLowerCase()}.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void talents.refetch()}
              loading={talents.isFetching}
            />
          </View>
        </View>
      ) : (
        <TalentDeckSkeleton />
      )}

      <TalentFooter
        role={role}
        tier={tier}
        onTierChange={setTier}
        state={state}
        onStatePress={() => setMenu('state')}
        stateExpanded={menu === 'state'}
      />

      <DropdownMenu<TalentRole>
        visible={menu === 'role'}
        onClose={closeMenu}
        label="Choose a role"
        options={ROLE_OPTIONS}
        selected={role}
        onSelect={(next) => router.setParams({ role: next })}
        position={{ top: insets.top + 74, alignSelf: 'center' }}
      />
      <DropdownMenu
        visible={menu === 'state'}
        onClose={closeMenu}
        label="Choose a state"
        options={STATE_OPTIONS}
        selected={state}
        onSelect={setState}
        position={{ bottom: insets.bottom + FOOTER_BUTTONS_TOP + 8, right: 20 }}
      />
    </View>
  );
}
