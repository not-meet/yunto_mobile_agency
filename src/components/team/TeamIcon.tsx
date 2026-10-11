import { Briefcase } from 'lucide-react-native';
import { View } from 'react-native';

import { FOCUS_STYLES } from '@/components/team/labels';
import type { Team } from '@/services/teamService';

// A team's round badge, tinted by what the team works on.

const SIZES = {
  40: { box: 'h-10 w-10', icon: 18 },
  44: { box: 'h-11 w-11', icon: 18 },
  48: { box: 'h-12 w-12', icon: 20 },
} as const;

export function TeamIcon({ focus, size }: { focus: Team['focus']; size: keyof typeof SIZES }) {
  const style = FOCUS_STYLES[focus];
  const { box, icon } = SIZES[size];

  return (
    <View
      className={`${box} items-center justify-center rounded-full border`}
      style={{ experimental_backgroundImage: style.gradient, borderColor: style.border }}
    >
      <Briefcase size={icon} color={style.color} strokeWidth={2} />
    </View>
  );
}
