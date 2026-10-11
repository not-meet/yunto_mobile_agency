import { Sparkles } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { PeopleSection } from '@/components/team/PeopleSection';
import type { People } from '@/services/teamService';

// Birthdays coming up, each on a warm card with the date on the right.

// Cards take these in turn.
const TONES = [
  {
    gradient: 'linear-gradient(135deg, rgba(255, 230, 180, 0.8) 0%, rgba(255, 210, 160, 0.7) 100%)',
    border: 'rgba(255, 190, 120, 0.3)',
    text: '#E8943A',
  },
  {
    gradient: 'linear-gradient(135deg, rgba(255, 215, 235, 0.8) 0%, rgba(250, 200, 225, 0.7) 100%)',
    border: 'rgba(240, 170, 200, 0.3)',
    text: '#CC5580',
  },
];

export function PeopleHighlights({ birthdays }: { birthdays: People['birthdays'] }) {
  return (
    <PeopleSection
      title="People Highlights"
      icon={Sparkles}
      tone={{ color: '#7E5C2A', background: '#FEF9EE' }}
      glow="255, 215, 230"
    >
      <View className="gap-3 px-4 pb-4">
        {birthdays.length === 0 ? (
          <Text className="py-4 text-center font-inter-medium text-sm leading-5 text-muted">
            Nothing coming up.
          </Text>
        ) : (
          birthdays.map((birthday, i) => {
            const tone = TONES[i % TONES.length] ?? TONES[0]!;
            const [year, month, day] = birthday.date.split('-');
            return (
              <View
                key={birthday.id}
                accessible
                accessibilityLabel={`Happy birthday ${birthday.name}, ${day}/${month}/${year}`}
                className="flex-row items-center gap-3 rounded-[18px] border border-white/90 bg-white/65 px-4 py-3.5"
                style={{ boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.03)' }}
              >
                <View
                  className="h-11 w-11 items-center justify-center rounded-full border"
                  style={{ experimental_backgroundImage: tone.gradient, borderColor: tone.border }}
                >
                  <Text className="text-xl leading-[30px]">🎂</Text>
                </View>
                <View className="flex-1 gap-px">
                  <Text
                    className="font-inter-bold text-[10px] uppercase leading-[15px] tracking-[1px]"
                    style={{ color: tone.text }}
                  >
                    Happy Birthday
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="font-inter-semibold text-[15px] leading-[22px] tracking-[-0.375px] text-[#111111]"
                  >
                    {birthday.name}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="font-inter-bold text-[11px] leading-4 text-[#888888]">
                    {day}/{month}
                  </Text>
                  <Text className="font-inter-medium text-[10px] leading-[15px] text-[#AAAAAA]">
                    {year}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </PeopleSection>
  );
}
