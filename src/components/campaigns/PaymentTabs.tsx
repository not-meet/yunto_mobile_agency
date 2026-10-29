import { Pressable, Text, View } from 'react-native';

// The payment summary's "Agency costs" / "Your creators" switch.

export type PaymentTab = 'costs' | 'creators';

const TABS: { key: PaymentTab; label: string }[] = [
  { key: 'costs', label: 'Agency costs' },
  { key: 'creators', label: 'Your creators' },
];

export function PaymentTabs({
  selected,
  onSelect,
}: {
  selected: PaymentTab;
  onSelect: (tab: PaymentTab) => void;
}) {
  return (
    <View
      accessibilityRole="tablist"
      className="flex-row rounded-full border border-[rgba(232,226,217,0.5)] bg-white/65 p-1"
    >
      {TABS.map(({ key, label }) => {
        const active = key === selected;
        return (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            className={`flex-1 items-center justify-center rounded-full px-4 py-3 ${
              active ? 'bg-white/90' : ''
            }`}
            style={active ? { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)' } : undefined}
          >
            <Text
              numberOfLines={1}
              className={`text-center font-inter-semibold text-sm leading-[17px] ${
                active ? 'text-[#1C1C1E]' : 'text-[#6C6C70]'
              }`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
