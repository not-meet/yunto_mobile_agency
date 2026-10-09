import { Pressable, ScrollView, Text } from 'react-native';

import { CATEGORY_LABELS } from '@/components/talent/labels';
import { LipstickIcon } from '@/components/talent/TalentIcons';
import { type TalentCategory, talentCategorySchema } from '@/services/talentService';

// Horizontally scrolling style chips. Tapping the active chip clears the filter.

const CATEGORIES = talentCategorySchema.options;

interface CategoryFiltersProps {
  selected: TalentCategory | null;
  onSelect: (category: TalentCategory | null) => void;
}

export function CategoryFilters({ selected, onSelect }: CategoryFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="grow-0"
      contentContainerStyle={{ gap: 12, paddingHorizontal: 20, paddingBottom: 16 }}
    >
      {CATEGORIES.map((category) => {
        const active = category === selected;
        return (
          <Pressable
            key={category}
            onPress={() => onSelect(active ? null : category)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={`h-10 flex-row items-center justify-center gap-1.5 rounded-3xl border border-white/80 px-[18px] active:opacity-70 ${
              active ? '' : 'bg-white/50'
            }`}
            style={
              active
                ? {
                    experimental_backgroundImage:
                      'linear-gradient(110.06deg, #E6D4FF 0%, #FFD4E5 100%)',
                    boxShadow:
                      '0px 4px 12px rgba(0, 0, 0, 0.05), inset 0px -2px 4px 1px rgba(0, 0, 0, 0.05), inset 0px 2px 4px 1px #FFFFFF',
                  }
                : {
                    boxShadow:
                      '0px 4px 12px rgba(0, 0, 0, 0.02), inset 0px 2px 4px 1px rgba(255, 255, 255, 0.4)',
                  }
            }
          >
            {category === 'makeup' ? (
              <LipstickIcon size={14} color={active ? '#1D1D1F' : '#6E6E73'} />
            ) : null}
            <Text
              className={`text-center font-inter-semibold text-sm leading-[17px] ${
                active ? 'text-[#1D1D1F]' : 'text-[#6E6E73]'
              }`}
            >
              {CATEGORY_LABELS[category]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
