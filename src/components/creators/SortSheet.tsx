import { Fragment } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import { SORT_OPTIONS } from '@/components/creators/labels';
import type { CreatorSort } from '@/services/creatorsService';

// "Sort By" sheet: one radio row per order. Picking one applies it and closes the sheet.

function Radio({ selected }: { selected: boolean }) {
  return (
    <View
      className={`h-6 w-6 items-center justify-center rounded-full border bg-white ${
        selected ? 'border-[#151515]' : 'border-[#EBEFF3]'
      }`}
    >
      {selected ? <View className="h-3.5 w-3.5 rounded-full bg-[#171718]" /> : null}
    </View>
  );
}

interface SortSheetProps {
  visible: boolean;
  onClose: () => void;
  value: CreatorSort;
  onChange: (next: CreatorSort) => void;
}

export function SortSheet({ visible, onClose, value, onChange }: SortSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Sort By">
      <View accessibilityRole="radiogroup" className="mt-[26px] gap-4">
        {SORT_OPTIONS.map(({ key, label }, i) => {
          const selected = key === value;
          return (
            <Fragment key={key}>
              {i > 0 ? <View className="h-px bg-[#EBEFF3]" /> : null}
              <Pressable
                onPress={() => {
                  onChange(key);
                  onClose();
                }}
                accessibilityRole="radio"
                accessibilityLabel={label}
                accessibilityState={{ selected }}
                className="flex-row items-center justify-between gap-3 active:opacity-70"
              >
                <Text className="flex-1 font-inter-medium text-base capitalize leading-[21px] text-black/70">
                  {label}
                </Text>
                <Radio selected={selected} />
              </Pressable>
            </Fragment>
          );
        })}
      </View>
    </BottomSheet>
  );
}
