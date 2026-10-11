import { useState } from 'react';
import { View } from 'react-native';

import { PhotoField, PillField } from '@/components/profile/ProfileFields';
import { SaveChanges } from '@/components/profile/SaveChanges';
import { useUpdateAgencyInfo } from '@/hooks/useProfile';
import {
  AGENCY_NAME_MAX,
  type AgencyInfo,
  updateAgencyInfoRequest,
  WEBSITE_MAX,
} from '@/services/profileService';
import { showToast } from '@/utils/notifications';
import {
  normalizePhone,
  sanitizeEmailInput,
  sanitizeLeadText,
  sanitizeLinkInput,
  sanitizePhoneInput,
} from '@/utils/sanitize';

// The agency's details, opened from "Agency Info". Save Changes shows up once anything differs
// from what's saved.

interface AgencyDraft {
  name: string;
  email: string;
  phone: string;
  website: string;
  // Picked but not saved yet.
  logo: string | null;
}

function fromAgency(agency: AgencyInfo): AgencyDraft {
  return {
    name: agency.name,
    email: agency.email ?? '',
    phone: agency.phone ?? '',
    website: agency.website ?? '',
    logo: null,
  };
}

// The draft as the API takes it; empty fields are left unset.
function toRequest(draft: AgencyDraft) {
  const phone = draft.phone.trim() || null;
  return {
    name: draft.name.trim(),
    email: draft.email || null,
    phone: phone && (normalizePhone(phone) ?? phone),
    website: draft.website || null,
    logo: draft.logo,
  };
}

export function AgencyForm({ agency }: { agency: AgencyInfo }) {
  const save = useUpdateAgencyInfo();
  const [draft, setDraft] = useState(() => fromAgency(agency));
  const request = updateAgencyInfoRequest.safeParse(toRequest(draft));
  const changed =
    JSON.stringify(toRequest(draft)) !== JSON.stringify(toRequest(fromAgency(agency)));

  const set = <K extends keyof AgencyDraft>(key: K, next: AgencyDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: next }));
    // Any change clears a failed attempt's error.
    if (save.isError) save.reset();
  };

  const submit = () => {
    if (!request.success) return;
    save.mutate(request.data, {
      onSuccess: (saved) => {
        setDraft(fromAgency(saved));
        showToast('Agency details saved');
      },
    });
  };

  return (
    <View className="gap-4">
      <PhotoField
        name={agency.name}
        savedUrl={agency.logoUrl}
        uri={draft.logo}
        caption="Upload image"
        onPick={(uri) => set('logo', uri)}
      />
      <PillField
        label="Agency Name"
        value={draft.name}
        onChangeText={(next) => set('name', sanitizeLeadText(next, AGENCY_NAME_MAX))}
        placeholder="Agency name"
        autoCapitalize="words"
      />
      <PillField
        label="Email Address"
        value={draft.email}
        onChangeText={(next) => set('email', sanitizeEmailInput(next))}
        placeholder="hello@agency.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <PillField
        label="Phone"
        value={draft.phone}
        onChangeText={(next) => set('phone', sanitizePhoneInput(next))}
        placeholder="+91 98765 43210"
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <PillField
        label="Agency Website"
        value={draft.website}
        onChangeText={(next) =>
          set(
            'website',
            sanitizeLinkInput(next)
              .replace(/^https?:\/\//i, '')
              .slice(0, WEBSITE_MAX),
          )
        }
        placeholder="www.agency.com"
        keyboardType="url"
        autoCapitalize="none"
      />
      <SaveChanges
        visible={changed}
        onSave={submit}
        saving={save.isPending}
        problem={request.success ? null : (request.error.issues[0]?.message ?? 'Check the details')}
        failed={save.isError}
      />
    </View>
  );
}
