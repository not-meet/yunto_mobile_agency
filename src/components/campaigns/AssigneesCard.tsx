import { Pressable, Text, View } from 'react-native';

import { assigneeTone, firstName, initialOf } from '@/components/campaigns/labels';
import type { Assignee } from '@/services/leadsService';

// Who's working the lead or running the campaign: up to two overlapping initials, their first names, and "+ Add"
// to change them. "No one yet" until someone is.

const SHOWN = 2;

export function AssigneesCard({
  assignees,
  onEdit,
}: {
  assignees: Assignee[];
  onEdit: () => void;
}) {
  const names = assignees.map((a) => firstName(a.name)).join(', ');

  return (
    <View className="flex-row items-center justify-between gap-3 rounded-[20px] border border-[rgba(232,226,217,0.61)] bg-white/60 px-5 py-4">
      <View
        accessible
        accessibilityLabel={`Assignees: ${names || 'no one yet'}`}
        className="shrink flex-row items-center gap-3"
      >
        {assignees.length > 0 ? (
          <View className="flex-row">
            {assignees.slice(0, SHOWN).map((assignee, i) => {
              const tone = assigneeTone(i);
              return (
                <View
                  key={assignee.id}
                  className={`h-8 w-8 items-center justify-center rounded-full border-2 border-white ${
                    i > 0 ? '-ml-2.5' : ''
                  }`}
                  style={{ backgroundColor: tone.background }}
                >
                  <Text
                    className="font-inter-semibold text-[11px] leading-4"
                    style={{ color: tone.text }}
                  >
                    {initialOf(assignee.name)}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}
        <View className="shrink">
          <Text className="font-inter-semibold text-[10px] uppercase leading-[15px] tracking-[0.5px] text-[#94A3B8]">
            Assignees
          </Text>
          <Text
            numberOfLines={1}
            className="font-inter-semibold text-xs leading-[15px] text-[#1E293B]"
          >
            {names || 'No one yet'}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={onEdit}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Change assignees"
        className="h-[25px] items-center justify-center rounded-full bg-cocoa px-3 active:opacity-80"
      >
        <Text className="font-inter-semibold text-[11px] leading-4 text-white">+ Add</Text>
      </Pressable>
    </View>
  );
}
