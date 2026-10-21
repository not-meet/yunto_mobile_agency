import {
  Briefcase,
  ChevronDown,
  ClipboardList,
  Globe,
  type LucideIcon,
  Mail,
  Package,
  Phone,
  UserRound,
} from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, { FadeIn, FadeOut, useReducedMotion } from 'react-native-reanimated';

import { DropdownMenu } from '@/components/common/DropdownMenu';
import { FieldLabel } from '@/components/leads/FieldLabel';
import { PRODUCT_SHIPMENT_LABELS } from '@/components/leads/labels';
import {
  AMOUNT_MAX,
  BRAND_NAME_MAX,
  CONTACT_NAME_MAX,
  type CreateLeadRequest,
  type DealType,
  DELIVERABLES_MAX,
  INFLUENCERS_MAX,
  type LeadPlatform,
  type ProductShipment,
} from '@/services/leadsService';
import { PLACEHOLDER_COLOR } from '@/utils/constants';
import {
  normalizeLink,
  normalizePhone,
  sanitizeDigits,
  sanitizeEmailInput,
  sanitizeLeadText,
  sanitizeLinkInput,
  sanitizePhoneInput,
} from '@/utils/sanitize';

// The brand's details on the Add Lead screen, in one white card. A barter asks for what it's
// worth and the agency's fee; a paid campaign asks for its budget.

// Every field as typed; toCreateLeadRequest shapes it for the API.
export interface LeadDraft {
  campaignType: DealType;
  platforms: LeadPlatform[];
  niches: string[];
  brand: string;
  website: string;
  email: string;
  contactName: string;
  phone: string;
  // Digits only. The barter value on a barter.
  budget: string;
  agencyFee: string;
  // Barter only; null until picked.
  productShipment: ProductShipment | null;
  influencers: string;
  deliverables: string;
}

export const EMPTY_LEAD: LeadDraft = {
  campaignType: 'barter',
  platforms: [],
  niches: [],
  brand: '',
  website: '',
  email: '',
  contactName: '',
  phone: '',
  budget: '',
  agencyFee: '',
  productShipment: null,
  influencers: '',
  deliverables: '',
};

const AMOUNT_DIGITS = String(AMOUNT_MAX).length;
const INFLUENCER_DIGITS = String(INFLUENCERS_MAX).length;

const optional = (value: string) => value.trim() || null;
const optionalNumber = (value: string) => (value ? Number(value) : null);

// The draft as the API takes it, for the screen to validate. A website or phone number that
// can't be normalized is passed as typed, so validation says what's wrong with it.
export function toCreateLeadRequest(draft: LeadDraft): CreateLeadRequest {
  const website = optional(draft.website);
  const phone = optional(draft.phone);
  const fields = {
    platforms: draft.platforms,
    niches: draft.niches,
    brand: draft.brand.trim(),
    website: website && (normalizeLink(website) ?? website),
    email: optional(draft.email),
    contactName: draft.contactName.trim(),
    phone: phone && (normalizePhone(phone) ?? phone),
    budget: optionalNumber(draft.budget),
    influencers: optionalNumber(draft.influencers),
    deliverables: optional(draft.deliverables),
  };
  return draft.campaignType === 'barter'
    ? {
        campaignType: 'barter',
        ...fields,
        agencyFee: optionalNumber(draft.agencyFee),
        productShipment: draft.productShipment,
      }
    : { campaignType: 'paid', ...fields };
}

interface FieldProps extends Pick<
  TextInputProps,
  'keyboardType' | 'autoCapitalize' | 'autoComplete' | 'inputMode'
> {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  placeholder: string;
  icon?: LucideIcon;
  // Shown before the value instead of an icon, e.g. "₹".
  prefix?: string;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon: Icon,
  prefix,
  ...input
}: FieldProps) {
  const reduceMotion = useReducedMotion();
  const [focused, setFocused] = useState(false);

  return (
    <View className="gap-2">
      <FieldLabel>{label}</FieldLabel>
      <Animated.View
        className={`flex-row items-center rounded-[18px] border bg-[#F8F9FA] px-4 py-3.5 ${
          prefix ? 'gap-2' : 'gap-3'
        }`}
        style={{
          borderColor: focused ? '#D6CFC4' : '#EFEFEF',
          transitionProperty: 'borderColor',
          transitionDuration: reduceMotion ? 0 : 180,
        }}
      >
        {Icon ? <Icon size={15} color="#BBBBBB" strokeWidth={1.67} /> : null}
        {prefix ? (
          <Text
            className={`font-inter-medium text-sm leading-[21px] ${
              value ? 'text-[#222222]' : 'text-[#BBBBBB]'
            }`}
          >
            {prefix}
          </Text>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={PLACEHOLDER_COLOR}
          returnKeyType="done"
          accessibilityLabel={label}
          className="flex-1 py-0 font-inter-medium text-sm leading-[21px] text-[#222222]"
          {...input}
        />
      </Animated.View>
    </View>
  );
}

const SHIPMENT_OPTIONS = (Object.keys(PRODUCT_SHIPMENT_LABELS) as ProductShipment[]).map(
  (value) => ({ value, label: PRODUCT_SHIPMENT_LABELS[value] }),
);

// A Field-styled box that opens a dropdown of the shipment options just under it.
function ShipmentSelect({
  value,
  onChange,
}: {
  value: ProductShipment | null;
  onChange: (next: ProductShipment) => void;
}) {
  const { width } = useWindowDimensions();
  const box = useRef<View>(null);
  const [menu, setMenu] = useState<ViewStyle | null>(null);

  const openMenu = () =>
    box.current?.measureInWindow((x, y, w, h) =>
      setMenu({ top: y + h + 8, left: x, right: Math.max(16, width - x - w) }),
    );

  return (
    <View className="gap-2">
      <FieldLabel>Product Shipment</FieldLabel>
      <Pressable
        ref={box}
        onPress={openMenu}
        accessibilityRole="button"
        accessibilityLabel={`Product shipment, ${value ? PRODUCT_SHIPMENT_LABELS[value] : 'not set'}`}
        accessibilityState={{ expanded: menu !== null }}
        className="flex-row items-center gap-3 rounded-[18px] border border-[#EFEFEF] bg-[#F8F9FA] px-4 py-3.5 active:opacity-80"
      >
        <Package size={15} color="#BBBBBB" strokeWidth={1.67} />
        <Text
          className={`flex-1 font-inter-medium text-sm leading-[21px] ${
            value ? 'text-[#222222]' : 'text-[#BBBBBB]'
          }`}
        >
          {value ? PRODUCT_SHIPMENT_LABELS[value] : 'Select an option'}
        </Text>
        <ChevronDown size={15} color="#BBBBBB" strokeWidth={1.67} />
      </Pressable>
      <DropdownMenu
        visible={menu !== null}
        onClose={() => setMenu(null)}
        options={SHIPMENT_OPTIONS}
        selected={value ?? undefined}
        onSelect={onChange}
        position={menu ?? {}}
        label="Product shipment"
      />
    </View>
  );
}

interface AddLeadFormProps {
  value: LeadDraft;
  onChange: (next: LeadDraft) => void;
}

export function AddLeadForm({ value, onChange }: AddLeadFormProps) {
  const reduceMotion = useReducedMotion();
  const set = <K extends keyof LeadDraft>(key: K, next: LeadDraft[K]) =>
    onChange({ ...value, [key]: next });
  const barter = value.campaignType === 'barter';

  return (
    <View
      className="gap-5 rounded-[28px] border border-black/[0.03] bg-white p-5"
      style={{ boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.04)' }}
    >
      <Field
        label="Brand Name"
        icon={Briefcase}
        value={value.brand}
        onChangeText={(next) => set('brand', sanitizeLeadText(next, BRAND_NAME_MAX))}
        placeholder="e.g. Lumina Skin"
        autoCapitalize="words"
      />
      <Field
        label="Brand Website"
        icon={Globe}
        value={value.website}
        onChangeText={(next) => set('website', sanitizeLinkInput(next))}
        placeholder="https://"
        keyboardType="url"
        autoCapitalize="none"
        autoComplete="url"
      />
      <Field
        label="Email Address"
        icon={Mail}
        value={value.email}
        onChangeText={(next) => set('email', sanitizeEmailInput(next))}
        placeholder="brand@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <Field
        label="Contact Person"
        icon={UserRound}
        value={value.contactName}
        onChangeText={(next) => set('contactName', sanitizeLeadText(next, CONTACT_NAME_MAX))}
        placeholder="Full name"
        autoCapitalize="words"
        autoComplete="name"
      />
      <Field
        label="Phone Number"
        icon={Phone}
        value={value.phone}
        onChangeText={(next) => set('phone', sanitizePhoneInput(next))}
        placeholder="+91 98765 43210"
        keyboardType="phone-pad"
        autoComplete="tel"
      />

      {/* Swapped with the campaign type, so it fades between the two sets. */}
      <Animated.View
        key={value.campaignType}
        entering={reduceMotion ? undefined : FadeIn.duration(220)}
        exiting={reduceMotion ? undefined : FadeOut.duration(120)}
        className="gap-5"
      >
        <Field
          label={barter ? 'Barter Value' : 'Campaign Budget'}
          prefix="₹"
          value={value.budget}
          onChangeText={(next) => set('budget', sanitizeDigits(next, AMOUNT_DIGITS))}
          placeholder="0"
          keyboardType="number-pad"
        />
        {barter ? (
          <Field
            label="Agency Fee"
            prefix="₹"
            value={value.agencyFee}
            onChangeText={(next) => set('agencyFee', sanitizeDigits(next, AMOUNT_DIGITS))}
            placeholder="0"
            keyboardType="number-pad"
          />
        ) : null}
        {barter ? (
          <ShipmentSelect
            value={value.productShipment}
            onChange={(next) => set('productShipment', next)}
          />
        ) : null}
      </Animated.View>

      <Field
        label="No. of Influencers"
        value={value.influencers}
        onChangeText={(next) => set('influencers', sanitizeDigits(next, INFLUENCER_DIGITS))}
        placeholder="e.g. 5"
        keyboardType="number-pad"
      />
      <Field
        label="Deliverables per Creator"
        icon={ClipboardList}
        value={value.deliverables}
        onChangeText={(next) => set('deliverables', sanitizeLeadText(next, DELIVERABLES_MAX))}
        placeholder="e.g. 2 Reels + 1 Story"
      />
    </View>
  );
}
