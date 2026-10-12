import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

// A frosted card headed by a tinted icon tile and its title, over its numbers (Leaves, Assign
// Creators). `StatFigure` is one of those numbers: a small caps label, the figure, a caption.

interface StatsCardProps {
  title: string;
  icon: LucideIcon;
  // Icon colour and its tile's tint.
  tone: { color: string; background: string };
  children: ReactNode;
}

export function StatsCard({ title, icon: Icon, tone, children }: StatsCardProps) {
  return (
    <View
      className="overflow-hidden rounded-[28px] border border-black/[0.07] bg-white/[0.52]"
      style={{
        boxShadow: '0px 12px 40px rgba(130, 110, 200, 0.09), 0px 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <View className="flex-row items-center gap-3 border-b border-black/[0.05] px-5 py-4">
        <View
          className="h-12 w-12 items-center justify-center rounded-[20px]"
          style={{
            backgroundColor: tone.background,
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)',
          }}
        >
          <Icon size={24} color={tone.color} strokeWidth={2} />
        </View>
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          className="flex-1 font-inter-semibold text-[15px] leading-[22px] tracking-[-0.375px] text-[#111111]"
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

interface StatFigureProps {
  label?: string;
  value: string;
  caption?: string;
  // The figure's colour, e.g. blue for unassigned creators.
  color?: string;
  // Centred, smaller figure: the Assign Creators breakdown.
  compact?: boolean;
}

export function StatFigure({
  label,
  value,
  caption,
  color = '#111111',
  compact = false,
}: StatFigureProps) {
  return (
    <View
      accessible
      accessibilityLabel={[label, value, caption].filter(Boolean).join(', ')}
      className={compact ? 'items-center gap-2' : 'gap-1'}
    >
      {label ? (
        <Text
          className={`font-inter-bold text-[11px] uppercase leading-4 tracking-[1.1px] text-[#AAAAAA] ${
            compact ? 'text-center' : ''
          }`}
        >
          {label}
        </Text>
      ) : null}
      <Text
        className={`pt-0.5 font-inter-semibold ${
          compact
            ? 'text-[26px] leading-[26px] tracking-[-0.65px]'
            : 'text-[28px] leading-[28px] tracking-[-0.7px]'
        }`}
        style={{ color }}
      >
        {value}
      </Text>
      {caption ? (
        <Text className="font-inter-medium text-xs leading-[18px] text-[#888888]">{caption}</Text>
      ) : null}
    </View>
  );
}
