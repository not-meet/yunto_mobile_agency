import { Pressable, ScrollView, Text, View } from 'react-native';

// A frosted pill holding a horizontally scrolling row of filter tabs; the selected one is dark.

interface SegmentedFilterProps<T extends string> {
  options: { key: T; label: string }[];
  selected: T;
  onSelect: (key: T) => void;
}

export function SegmentedFilter<T extends string>({
  options,
  selected,
  onSelect,
}: SegmentedFilterProps<T>) {
  return (
    <View
      className="h-[50px] overflow-hidden rounded-[30px] border border-white/80 bg-white/60"
      style={{ boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.04)' }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 4, padding: 6, alignItems: 'center' }}
      >
        {options.map(({ key, label }) => {
          const active = key === selected;
          return (
            <Pressable
              key={key}
              onPress={() => onSelect(key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className="h-9 justify-center rounded-3xl px-[18px] active:opacity-70"
              style={
                active
                  ? {
                      experimental_backgroundImage:
                        'linear-gradient(112.95deg, #1A1A1A 0%, #333333 100%)',
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
                    }
                  : undefined
              }
            >
              <Text
                className={`text-center font-inter-medium text-sm leading-[17px] ${
                  active ? 'text-[#FFF8F8]' : 'text-muted'
                }`}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
