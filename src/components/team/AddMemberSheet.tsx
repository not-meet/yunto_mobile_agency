import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, useReducedMotion } from 'react-native-reanimated';

import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import { Switch } from '@/components/common/Switch';
import { SelectField, SheetField } from '@/components/creators/InviteFields';
import { PERMISSION_KEYS, PERMISSION_LABELS, ROLE_LABELS } from '@/components/team/labels';
import { useAddMember } from '@/hooks/useTeam';
import { type Role, roleSchema } from '@/services/authService';
import {
  addMemberRequest,
  type Member,
  MEMBER_NAME_MAX,
  type Permissions,
} from '@/services/teamService';
import { newIdempotencyKey } from '@/utils/api';
import {
  normalizePhone,
  sanitizeEmailInput,
  sanitizeLeadText,
  sanitizePhoneInput,
} from '@/utils/sanitize';

// "Add Members" sheet (Create Teams, a team's screen): who they are, what they can see, and what
// else they're allowed to do. They're invited by email, onto `teamId`'s team if there is one.

const NO_PERMISSIONS: Permissions = { assignLeads: false, reallocate: false, approveLeaves: false };

const ROLE_OPTIONS = roleSchema.options.map((role) => ({ value: role, label: ROLE_LABELS[role] }));

interface MemberDraft {
  name: string;
  email: string;
  phone: string;
  role: Role | null;
  permissions: Permissions;
}

const EMPTY: MemberDraft = {
  name: '',
  email: '',
  phone: '',
  role: null,
  permissions: NO_PERMISSIONS,
};

// The draft as the API takes it, for the sheet to validate. A phone number that can't be
// normalized is passed as typed, so validation says what's wrong with it.
function toRequest(draft: MemberDraft, teamId: string | null) {
  const phone = draft.phone.trim() || null;
  return {
    name: draft.name.trim(),
    email: draft.email,
    phone: phone && (normalizePhone(phone) ?? phone),
    role: draft.role,
    permissions: draft.permissions,
    teamId,
  };
}

function AdvancedSettings({
  value,
  onChange,
}: {
  value: Permissions;
  onChange: (next: Permissions) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const on = PERMISSION_KEYS.filter((key) => value[key]).length;

  return (
    <View className="gap-2">
      <Text className="pl-1 font-inter-medium text-sm leading-[17px] text-[#6B7280]">
        Advance Settings
      </Text>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={`Advance settings, ${on} of ${PERMISSION_KEYS.length} allowed`}
        accessibilityState={{ expanded: open }}
        className="h-[52px] flex-row items-center rounded-[20px] border border-[#E5E5E5] bg-white/80 px-5 active:opacity-80"
        style={{
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.02), inset 0px 2px 4px 1px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Text
          className={`flex-1 font-inter-medium text-[15px] leading-[18px] ${
            on > 0 ? 'text-[#111827]' : 'text-[#BDB8C7]'
          }`}
        >
          {on > 0 ? `${on} of ${PERMISSION_KEYS.length} allowed` : 'Select…'}
        </Text>
        <Animated.View
          style={{
            transform: [{ rotate: open ? '180deg' : '0deg' }],
            ...(reduceMotion ? null : { transitionProperty: 'transform', transitionDuration: 200 }),
          }}
        >
          <ChevronDown size={20} color="#6B7280" strokeWidth={1.67} />
        </Animated.View>
      </Pressable>
      {open ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(180)}
          exiting={reduceMotion ? undefined : FadeOut.duration(120)}
          className="overflow-hidden rounded-[20px] border border-[#E5E5E5] bg-white"
        >
          {PERMISSION_KEYS.map((key) => (
            <View key={key} className="h-[52px] flex-row items-center gap-3 px-5">
              <Text className="flex-1 font-inter-medium text-sm leading-5 text-[#111827]">
                {PERMISSION_LABELS[key]}
              </Text>
              <Switch
                value={value[key]}
                onValueChange={(next) => onChange({ ...value, [key]: next })}
                label={PERMISSION_LABELS[key]}
              />
            </View>
          ))}
        </Animated.View>
      ) : null}
    </View>
  );
}

interface AddMemberSheetProps {
  visible: boolean;
  onClose: () => void;
  // The team they join; null to add them to the agency only.
  teamId: string | null;
  onAdded: (member: Member) => void;
}

export function AddMemberSheet({ visible, onClose, teamId, onAdded }: AddMemberSheetProps) {
  const add = useAddMember();
  const [draft, setDraft] = useState<MemberDraft>(EMPTY);
  const request = addMemberRequest.safeParse(toRequest(draft, teamId));

  const set = <K extends keyof MemberDraft>(key: K, next: MemberDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: next }));
    // Any change clears a failed attempt's error.
    if (add.isError) add.reset();
  };

  const submit = () => {
    if (!request.success) return;
    add.mutate(
      { member: request.data, idempotencyKey: newIdempotencyKey() },
      {
        onSuccess: (added) => {
          setDraft(EMPTY);
          onAdded(added);
        },
      },
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Add Member">
      <ScrollView
        className="mt-5 shrink grow-0"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 16, paddingBottom: 4 }}
      >
        <SheetField
          label="Enter name"
          value={draft.name}
          onChangeText={(next) => set('name', sanitizeLeadText(next, MEMBER_NAME_MAX))}
          placeholder="Full Name"
          autoCapitalize="words"
          autoComplete="name"
        />
        <SheetField
          label="Enter email address"
          value={draft.email}
          onChangeText={(next) => set('email', sanitizeEmailInput(next))}
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <SheetField
          label="Enter Contact Number"
          value={draft.phone}
          onChangeText={(next) => set('phone', sanitizePhoneInput(next))}
          placeholder="Contact Number"
          keyboardType="phone-pad"
          autoComplete="tel"
        />
        <SelectField
          label="Permission"
          value={draft.role}
          options={ROLE_OPTIONS}
          onChange={(next) => set('role', next)}
        />
        <AdvancedSettings value={draft.permissions} onChange={(next) => set('permissions', next)} />
      </ScrollView>

      {add.isError ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-3 pl-1 font-inter-medium text-[13px] leading-4 text-rose-500"
        >
          We couldn’t add them. Please try again.
        </Text>
      ) : null}
      <View className="mt-4 px-[13px]">
        <Button
          label="Add Member"
          onPress={submit}
          disabled={!request.success}
          disabledReason={request.error?.issues[0]?.message ?? null}
          loading={add.isPending}
        />
      </View>
    </BottomSheet>
  );
}
