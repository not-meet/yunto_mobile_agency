import { Pressable, Text, TextInput, View } from 'react-native';

import { EditorCard, SelectField, ToggleRow } from '@/components/content/EditorParts';
import { DEALS, DISCLOSURES } from '@/components/content/labels';
import { BRAND_NAME_MAX, type BrandDeal, DEAL_AMOUNT_MAX } from '@/services/contentService';
import { PLACEHOLDER_COLOR } from '@/utils/constants';
import { groupDigits } from '@/utils/format';
import { sanitizeDigits, sanitizeLeadText } from '@/utils/sanitize';

// A paid collab: the brand (typed, or one of the agency's), the deal's value and kind, and how
// it's disclosed. The day then shows as a brand day on the calendar.

const DISCLOSURE_OPTIONS = DISCLOSURES.map((d) => ({ value: d, label: d }));

interface BrandCollabCardProps {
  on: boolean;
  name: string;
  amount: number | null;
  deal: BrandDeal;
  disclosure: string;
  brandOptions: string[];
  editable: boolean;
  onChange: (patch: {
    brandCollab?: boolean;
    brandName?: string;
    brandAmount?: number | null;
    brandDeal?: BrandDeal;
    disclosure?: string;
  }) => void;
}

export function BrandCollabCard({
  on,
  name,
  amount,
  deal,
  disclosure,
  brandOptions,
  editable,
  onChange,
}: BrandCollabCardProps) {
  const query = name.trim().toLowerCase();
  const matches = brandOptions
    .filter((b) => b.toLowerCase() !== query && b.toLowerCase().includes(query))
    .slice(0, 6);

  return (
    <EditorCard>
      <ToggleRow
        label="Brand collab"
        value={on}
        onChange={(next) => onChange({ brandCollab: next })}
        disabled={!editable}
      />
      {!on ? (
        <Text className="font-inter text-[11px] leading-4 text-[#94A3B8]">
          Off — turn on to attach brand products and open this piece to collab offers.
        </Text>
      ) : (
        <View className="gap-3 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-3">
          <View className="gap-1">
            <Text className="font-inter-semibold text-[10px] uppercase tracking-[0.4px] text-[#92400E]">
              Brand
            </Text>
            <TextInput
              value={name}
              onChangeText={(text) =>
                onChange({ brandName: sanitizeLeadText(text, BRAND_NAME_MAX) })
              }
              editable={editable}
              placeholder="e.g. Kova"
              placeholderTextColor={PLACEHOLDER_COLOR}
              accessibilityLabel="Brand"
              className="h-10 rounded-lg border border-[#FDE68A] bg-white px-2.5 py-0 font-inter text-[13px] text-[#0F172A]"
            />
            {editable && matches.length > 0 ? (
              <View className="flex-row flex-wrap gap-1.5 pt-1">
                {matches.map((brand) => (
                  <Pressable
                    key={brand}
                    onPress={() => onChange({ brandName: brand })}
                    accessibilityRole="button"
                    accessibilityLabel={`Use ${brand}`}
                    className="rounded-full bg-white px-2.5 py-1 active:opacity-70"
                  >
                    <Text className="font-inter-medium text-[11px] text-[#92400E]">{brand}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <View className="gap-1">
            <Text className="font-inter-semibold text-[10px] uppercase tracking-[0.4px] text-[#92400E]">
              Deal value
            </Text>
            <View className="h-10 flex-row items-center rounded-lg border border-[#FDE68A] bg-white px-2.5">
              <Text className="font-inter text-[13px] text-[#92400E]">₹</Text>
              <TextInput
                value={amount !== null ? groupDigits(amount) : ''}
                onChangeText={(text) => {
                  const n = Number(sanitizeDigits(text, 10));
                  onChange({ brandAmount: n > 0 ? Math.min(n, DEAL_AMOUNT_MAX) : null });
                }}
                editable={editable}
                keyboardType="number-pad"
                placeholder="40,000"
                placeholderTextColor={PLACEHOLDER_COLOR}
                accessibilityLabel="Deal value in rupees"
                className="ml-1 flex-1 p-0 font-inter text-[13px] text-[#0F172A]"
              />
            </View>
          </View>

          <View className="flex-row flex-wrap gap-1.5">
            {DEALS.map((d) => (
              <Pressable
                key={d.key}
                onPress={() => onChange({ brandDeal: d.key })}
                disabled={!editable}
                accessibilityRole="radio"
                accessibilityState={{ checked: deal === d.key }}
                className={`rounded-full px-3 py-1 ${deal === d.key ? 'bg-[#92400E]' : 'bg-white'}`}
              >
                <Text
                  className={`font-inter-medium text-[11px] ${deal === d.key ? 'text-white' : 'text-[#92400E]'}`}
                >
                  {d.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <SelectField
            label="Disclosure"
            value={disclosure}
            options={DISCLOSURE_OPTIONS}
            onChange={(next) => onChange({ disclosure: next })}
            disabled={!editable}
          />
          <Text className="font-inter text-[10px] leading-[14px] text-[#92400E]/80">
            The day becomes a brand day on the calendar.
          </Text>
        </View>
      )}
    </EditorCard>
  );
}

interface ShiftCardProps {
  on: boolean;
  hint: string;
  editable: boolean;
  onChange: (on: boolean) => void;
}

// Make room on the day: everything from it onward (not posted yet) moves a day later on save.
export function ShiftCard({ on, hint, editable, onChange }: ShiftCardProps) {
  return (
    <EditorCard>
      <ToggleRow
        label="Shift existing content"
        value={on}
        onChange={onChange}
        disabled={!editable}
      />
      <Text className="font-inter text-[11px] leading-4 text-[#94A3B8]">{hint}</Text>
    </EditorCard>
  );
}
