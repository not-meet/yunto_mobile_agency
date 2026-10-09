import { Briefcase, Clock, type LucideIcon, Star } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import type { Talent } from '@/services/talentService';

// Under a profile's pitch: what they're good at (colour-coded tags), then their rating, when
// they're free and the brands they've worked with.

// Tags take these tints in turn.
const TAG_TONES = [
  { background: '#E8F5E9', text: '#2E7D32' },
  { background: '#FFF3E0', text: '#E65100' },
  { background: '#F3E5F5', text: '#6A1B9A' },
  { background: '#E3F2FD', text: '#1565C0' },
  { background: '#FCE4EC', text: '#C2185B' },
] as const;

// Past clients shown before the rest fold into "+N".
const MAX_CLIENTS = 3;

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <Text
      accessibilityRole="header"
      className="font-inter-bold text-base leading-[19px] tracking-[-0.16px] text-[#1A1A1A]"
    >
      {children}
    </Text>
  );
}

export function ExpertiseTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;

  return (
    <View className="gap-3">
      <SectionHeading>Expertise</SectionHeading>
      <View className="flex-row flex-wrap gap-2.5">
        {tags.map((tag, i) => {
          const tone = TAG_TONES[i % TAG_TONES.length] ?? TAG_TONES[0];
          return (
            <View
              key={tag}
              className="rounded-[20px] border border-white/60 px-4 py-2"
              style={{
                backgroundColor: tone.background,
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.03)',
              }}
            >
              <Text
                className="font-inter-semibold text-[13px] leading-4"
                style={{ color: tone.text }}
              >
                {tag}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function StatCard({
  icon: Icon,
  iconColor = '#666666',
  label,
  className = '',
  children,
}: {
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <View
      className={`gap-2 rounded-[20px] border border-white/80 bg-white/70 p-4 ${className}`}
      accessible
    >
      <View className="flex-row items-center gap-1.5">
        <Icon size={14} color={iconColor} strokeWidth={1.17} />
        <Text className="font-inter-medium text-[13px] leading-4 text-[#666666]">{label}</Text>
      </View>
      {children}
    </View>
  );
}

export function TalentStats({ talent }: { talent: Talent }) {
  const clients = talent.brands.slice(0, MAX_CLIENTS);
  const moreClients = talent.brands.length - clients.length;

  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <StatCard icon={Star} iconColor="#F5A623" label="Rating" className="flex-1">
          <Text className="font-inter-bold text-lg leading-[22px] text-[#1A1A1A]">
            {talent.rating.toFixed(1)}
            {talent.reviewCount !== null ? (
              <Text className="font-inter-medium text-[13px] leading-4 text-[#888888]">
                {' '}
                ({talent.reviewCount})
              </Text>
            ) : null}
          </Text>
        </StatCard>
        <StatCard icon={Clock} label="Availability" className="flex-1">
          {talent.availability.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {talent.availability.map((slot) => (
                <View key={slot} className="rounded-xl bg-[#E8F5E9] px-3 py-1.5">
                  <Text className="font-inter-semibold text-xs leading-[15px] text-[#2E7D32]">
                    {slot}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="font-inter-medium text-xs leading-[15px] text-[#888888]">
              Ask for dates
            </Text>
          )}
        </StatCard>
      </View>

      {clients.length > 0 ? (
        <StatCard icon={Briefcase} label="Past Clients">
          <View className="flex-row flex-wrap gap-2">
            {clients.map((brand) => (
              <ClientPill key={brand} label={brand} />
            ))}
            {moreClients > 0 ? <ClientPill label={`+${moreClients}`} muted /> : null}
          </View>
        </StatCard>
      ) : null}
    </View>
  );
}

function ClientPill({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <View
      className="rounded-xl border border-[#F0F0F0] bg-white px-3 py-1.5"
      style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.02)' }}
    >
      <Text
        className={`font-inter-bold text-xs leading-[15px] ${
          muted ? 'text-[#888888]' : 'text-[#333333]'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}
