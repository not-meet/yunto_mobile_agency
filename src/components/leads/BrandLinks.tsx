import { Globe, type LucideIcon, Mail } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { openWebsite, sendEmail } from '@/components/leads/contact';

// The brand's email and website, as pills that open them. A missing one shows its fallback text
// in the same pill, which then opens nothing.

const PILL_CLASS =
  'h-8 shrink flex-row items-center gap-1.5 rounded-2xl border border-[rgba(232,226,217,0.5)] bg-white px-4';

function LinkPill({
  label,
  icon: Icon,
  onPress,
}: {
  label: string;
  icon: LucideIcon;
  onPress: (() => void) | null;
}) {
  return (
    <Pressable
      onPress={onPress ?? undefined}
      disabled={!onPress}
      accessibilityRole={onPress ? 'link' : undefined}
      accessibilityLabel={label}
      className={`${PILL_CLASS} active:opacity-70`}
    >
      <Icon size={16} color="#8A8A8E" strokeWidth={1.33} />
      <Text
        numberOfLines={1}
        className="shrink text-center font-inter-medium text-[13px] leading-4 text-[#1D1D1F]"
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface BrandLinksProps {
  name: string;
  email: string | null;
  website: string | null;
}

export function BrandLinks({ name, email, website }: BrandLinksProps) {
  return (
    <View className="flex-row justify-between gap-3 pt-1">
      <LinkPill
        label={email ?? 'No email yet'}
        icon={Mail}
        onPress={email ? () => sendEmail(email, name) : null}
      />
      <LinkPill
        label={website ?? 'No website'}
        icon={Globe}
        onPress={website ? () => openWebsite(website) : null}
      />
    </View>
  );
}
