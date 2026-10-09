import { router } from 'expo-router';
import { CircleCheck, CirclePlus, type LucideIcon, Scissors, Video } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated, { ZoomIn, useReducedMotion } from 'react-native-reanimated';

import { usePressScale } from '@/hooks/usePressScale';
import type { TalentRole } from '@/services/talentService';
import { selectionKey, useTalentStore } from '@/store/talentStore';

// Extra talent the brand wants booked with the deal, two to a row. Each opens the talent browser
// for this lead, and shows who's been picked (with a check that pops in) once someone is. Hidden
// when the brand asked for none.

const ADD_ONS: Record<TalentRole, { label: string; icon: LucideIcon }> = {
  videographer: { label: 'Videographer', icon: Video },
  editor: { label: 'Editor', icon: Scissors },
};

function AddOnCard({ role, leadId }: { role: TalentRole; leadId: string }) {
  const reduceMotion = useReducedMotion();
  const press = usePressScale(0.96);
  const { label, icon: Icon } = ADD_ONS[role];
  const picked = useTalentStore((s) => s.selections[selectionKey(leadId, role)]?.name);

  return (
    <Animated.View style={press.style} className="flex-1">
      <Pressable
        {...press.handlers}
        onPress={() => router.push({ pathname: '/talent', params: { role, leadId } })}
        accessibilityRole="button"
        accessibilityLabel={picked ? `${label}, ${picked} selected` : label}
        accessibilityHint={`Browse ${label.toLowerCase()}s`}
        className="gap-3 rounded-[20px] border border-[rgba(232,226,217,0.5)] bg-white p-4"
      >
        <View className="flex-row items-start justify-between">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#F4F4F6]">
            <Icon size={20} color="#1D1D1F" strokeWidth={1.67} />
          </View>
          {picked ? (
            <Animated.View entering={reduceMotion ? undefined : ZoomIn.springify()}>
              <CircleCheck size={20} color="#2B9A57" strokeWidth={1.67} />
            </Animated.View>
          ) : (
            <CirclePlus size={20} color="#8A8A8E" strokeWidth={1.67} />
          )}
        </View>
        <View>
          <Text
            numberOfLines={1}
            className="font-inter-semibold text-sm leading-[17px] text-[#1D1D1F]"
          >
            {label}
          </Text>
          {picked ? (
            <Text numberOfLines={1} className="font-inter-medium text-xs leading-4 text-[#8A8A8E]">
              {picked}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function AddOns({ roles, leadId }: { roles: TalentRole[]; leadId: string }) {
  if (roles.length === 0) return null;

  const rows: TalentRole[][] = [];
  for (let i = 0; i < roles.length; i += 2) rows.push(roles.slice(i, i + 2));

  return (
    <View className="gap-3">
      <Text className="px-5 pt-1 font-inter-semibold text-sm uppercase leading-[17px] tracking-[0.5px] text-[#8A8A8E]">
        Add-ons
      </Text>
      {rows.map((row) => (
        <View key={row.join()} className="flex-row gap-3">
          {row.map((role) => (
            <AddOnCard key={role} role={role} leadId={leadId} />
          ))}
          {/* Keeps a lone last card at half width. */}
          {row.length === 1 ? <View className="flex-1" /> : null}
        </View>
      ))}
    </View>
  );
}
