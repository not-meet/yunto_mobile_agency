import { useState } from 'react';
import { View } from 'react-native';

import { toggle } from '@/components/talent/BookingChips';
import { FieldLabel } from '@/components/leads/FieldLabel';
import { nicheTone, PRESET_NICHES } from '@/components/leads/labels';
import { NicheSheet } from '@/components/leads/NicheSheet';
import { AddChip, TagChip } from '@/components/leads/TagChip';
import { NICHES_MAX } from '@/services/leadsService';
import { showToast } from '@/utils/notifications';

// The campaign's niches (pick any number): a few presets, plus any typed in through "Add",
// which join the row already selected.

interface NichePickerProps {
  selected: string[];
  onChange: (next: string[]) => void;
}

export function NichePicker({ selected, onChange }: NichePickerProps) {
  // Any picked already (editing requirements) are listed too.
  const [options, setOptions] = useState(() => [
    ...PRESET_NICHES,
    ...selected.filter((niche) => !PRESET_NICHES.includes(niche)),
  ]);
  const [adding, setAdding] = useState(false);

  const add = (typed: string[]) => {
    // A niche that's already listed (in any case) is picked rather than added twice.
    const existing = new Map(options.map((option) => [option.toLowerCase(), option]));
    const picked = typed.map((niche) => existing.get(niche.toLowerCase()) ?? niche);
    setOptions([...options, ...picked.filter((niche) => !options.includes(niche))]);

    const next = [...selected, ...picked.filter((niche) => !selected.includes(niche))];
    if (next.length > NICHES_MAX) showToast(`A lead can have up to ${NICHES_MAX} niches`);
    onChange(next.slice(0, NICHES_MAX));
  };

  const select = (niche: string) => {
    if (!selected.includes(niche) && selected.length >= NICHES_MAX) {
      showToast(`A lead can have up to ${NICHES_MAX} niches`);
      return;
    }
    onChange(toggle(selected, niche));
  };

  return (
    <View className="gap-3">
      <FieldLabel>Niche</FieldLabel>
      <View className="flex-row flex-wrap gap-2">
        {options.map((niche, i) => (
          <TagChip
            key={niche}
            label={niche}
            tone={nicheTone(i)}
            size="md"
            selected={selected.includes(niche)}
            onPress={() => select(niche)}
          />
        ))}
        <AddChip size="md" onPress={() => setAdding(true)} accessibilityLabel="Add a niche" />
      </View>

      <NicheSheet
        visible={adding}
        onClose={() => setAdding(false)}
        firstIndex={options.length}
        onAdd={add}
      />
    </View>
  );
}
