import { useState } from 'react';
import { View } from 'react-native';

import { DateField, PhotoField, PillField, PillSelect } from '@/components/profile/ProfileFields';
import { SaveChanges } from '@/components/profile/SaveChanges';
import { ASSIGN_AS_LABELS, GENDER_LABELS } from '@/components/team/labels';
import { useUpdateProfile } from '@/hooks/useProfile';
import {
  assignAsSchema,
  type AssignAs,
  type Gender,
  genderSchema,
  NAME_MAX,
  type Profile,
  updateProfileRequest,
} from '@/services/profileService';
import { showToast } from '@/utils/notifications';
import {
  normalizePhone,
  sanitizeEmailInput,
  sanitizeLeadText,
  sanitizePhoneInput,
} from '@/utils/sanitize';

// The member's own details, opened from "Profile Info". Save Changes shows up once anything
// differs from what's saved.

interface ProfileDraft {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string | null;
  gender: Gender | null;
  assignAs: AssignAs;
  // Picked but not saved yet.
  photo: string | null;
}

function fromProfile(profile: Profile): ProfileDraft {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone ?? '',
    birthDate: profile.birthDate,
    gender: profile.gender === 'UNKNOWN' ? null : profile.gender,
    assignAs: profile.assignAs === 'UNKNOWN' ? 'executive' : profile.assignAs,
    photo: null,
  };
}

// The draft as the API takes it. A phone number that can't be normalized is passed as typed, so
// validation says what's wrong with it.
function toRequest(draft: ProfileDraft) {
  const phone = draft.phone.trim() || null;
  return {
    ...draft,
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    phone: phone && (normalizePhone(phone) ?? phone),
  };
}

const GENDER_OPTIONS = genderSchema.options.map((value) => ({
  value,
  label: GENDER_LABELS[value],
}));
const ASSIGN_OPTIONS = assignAsSchema.options.map((value) => ({
  value,
  label: ASSIGN_AS_LABELS[value],
}));

export function ProfileForm({ profile }: { profile: Profile }) {
  const save = useUpdateProfile();
  const [draft, setDraft] = useState(() => fromProfile(profile));
  const request = updateProfileRequest.safeParse(toRequest(draft));
  const changed =
    JSON.stringify(toRequest(draft)) !== JSON.stringify(toRequest(fromProfile(profile)));

  const set = <K extends keyof ProfileDraft>(key: K, next: ProfileDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: next }));
    // Any change clears a failed attempt's error.
    if (save.isError) save.reset();
  };

  const submit = () => {
    if (!request.success) return;
    save.mutate(request.data, {
      onSuccess: (saved) => {
        setDraft(fromProfile(saved));
        showToast('Profile saved');
      },
    });
  };

  return (
    <View className="gap-4">
      <PhotoField
        name={`${profile.firstName} ${profile.lastName}`}
        savedUrl={profile.avatarUrl}
        uri={draft.photo}
        caption="Change profile picture"
        onPick={(uri) => set('photo', uri)}
      />
      <View className="flex-row gap-3">
        <PillField
          label="First Name"
          value={draft.firstName}
          onChangeText={(next) => set('firstName', sanitizeLeadText(next, NAME_MAX))}
          placeholder="First"
          autoCapitalize="words"
          autoComplete="given-name"
        />
        <PillField
          label="Last Name"
          value={draft.lastName}
          onChangeText={(next) => set('lastName', sanitizeLeadText(next, NAME_MAX))}
          placeholder="Last"
          autoCapitalize="words"
          autoComplete="family-name"
        />
      </View>
      <PillField
        label="Email"
        value={draft.email}
        onChangeText={(next) => set('email', sanitizeEmailInput(next))}
        placeholder="you@agency.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <PillSelect
        label="Assign as"
        value={draft.assignAs}
        options={ASSIGN_OPTIONS}
        onChange={(next) => set('assignAs', next)}
      />
      <PillField
        label="Phone"
        value={draft.phone}
        onChangeText={(next) => set('phone', sanitizePhoneInput(next))}
        placeholder="+91 98765 43210"
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <DateField
        label="Birth Date"
        value={draft.birthDate}
        onChange={(next) => set('birthDate', next)}
      />
      <PillSelect
        label="Gender"
        value={draft.gender}
        options={GENDER_OPTIONS}
        onChange={(next) => set('gender', next)}
      />
      <SaveChanges
        visible={changed}
        onSave={submit}
        saving={save.isPending}
        problem={
          request.success ? null : (request.error.issues[0]?.message ?? 'Check your details')
        }
        failed={save.isError}
      />
    </View>
  );
}
