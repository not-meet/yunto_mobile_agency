import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

// Outline logos for the platforms a lead can run on; lucide dropped its brand icons.

export interface PlatformIconProps {
  size: number;
  color: string;
}

function Outline({ size, color, children }: PlatformIconProps & { children: ReactNode }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </Svg>
  );
}

export function InstagramIcon(props: PlatformIconProps) {
  return (
    <Outline {...props}>
      <Rect x={2} y={2} width={20} height={20} rx={5} />
      <Path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <Path d="M17.5 6.5h.01" />
    </Outline>
  );
}

export function YoutubeIcon(props: PlatformIconProps) {
  return (
    <Outline {...props}>
      <Path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <Path d="m10 15 5-3-5-3z" />
    </Outline>
  );
}

export function FacebookIcon(props: PlatformIconProps) {
  return (
    <Outline {...props}>
      <Path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </Outline>
  );
}

export function LinkedinIcon(props: PlatformIconProps) {
  return (
    <Outline {...props}>
      <Path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <Rect x={2} y={9} width={4} height={12} />
      <Circle cx={4} cy={4} r={2} />
    </Outline>
  );
}

export function XIcon(props: PlatformIconProps) {
  return (
    <Outline {...props}>
      <Path d="M4 4l11.733 16h4.267l-11.733-16z" />
      <Path d="M4 20l6.768-6.768m2.46-2.46L20 4" />
    </Outline>
  );
}

export function TiktokIcon(props: PlatformIconProps) {
  return (
    <Outline {...props}>
      <Path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </Outline>
  );
}
