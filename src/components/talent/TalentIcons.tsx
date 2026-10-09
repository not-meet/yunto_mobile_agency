import Svg, { Path, Rect } from 'react-native-svg';

import type { ShootTier } from '@/services/talentService';

// Icons lucide doesn't have: a lipstick for the makeup filter, and the three flames that stand
// for the shoot tiers (hotter flame, bigger job).

interface IconProps {
  size?: number;
  color?: string;
}

export function LipstickIcon({ size = 16, color = '#6E6E73' }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M10 3.5 14 2v8h-4z" />
      <Rect x={8.5} y={10} width={7} height={4} rx={0.8} />
      <Rect x={7.5} y={14} width={9} height={8} rx={1.2} />
    </Svg>
  );
}

const FLAME_PATH =
  'M12 2c.6 3.2 2.6 5 4.3 6.9C17.9 10.7 19 12.8 19 15a7 7 0 1 1-14 0c0-2.4 1.2-4.2 2.6-5.6.2 1.6.9 2.7 2 3.3C9.3 9 10.4 5.2 12 2z';
const FLAME_CORE = 'M12 13c1.2 1.4 2.5 2.7 2.5 4.3a2.5 2.5 0 0 1-5 0c0-1.6 1.3-2.9 2.5-4.3z';

const FLAMES: Record<ShootTier, { outer: string; core: string; stroke?: string }> = {
  basic: { outer: '#FCEA2B', core: '#F1B31C', stroke: '#000000' },
  standard: { outer: '#FF6D00', core: '#FFF176' },
  premium: { outer: '#FF5141', core: '#FFDA2F' },
};

export function FlameIcon({ tier, size = 20 }: { tier: ShootTier; size?: number }) {
  const { outer, core, stroke } = FLAMES[tier];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={FLAME_PATH} fill={outer} stroke={stroke} strokeWidth={stroke ? 0.6 : 0} />
      <Path d={FLAME_CORE} fill={core} />
    </Svg>
  );
}
