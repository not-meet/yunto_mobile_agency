import { Briefcase } from 'lucide-react-native';
import { Text, View } from 'react-native';

// Briefcase badge, title and subtitle at the top of the agency code screens.

interface AgencyHeaderProps {
  title: string;
  subtitle: string;
}

export function AgencyHeader({ title, subtitle }: AgencyHeaderProps) {
  return (
    <View className="items-center gap-3">
      <View
        className="h-16 w-16 items-center justify-center rounded-full border border-indigo/30"
        style={{
          experimental_backgroundImage:
            'linear-gradient(135deg, rgba(129, 140, 248, 0.25) 0%, rgba(196, 181, 253, 0.18) 100%)',
          boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Briefcase size={28} color="#6366F1" strokeWidth={2} />
      </View>
      <View className="items-center gap-1">
        <Text
          accessibilityRole="header"
          className="text-center font-inter-semibold text-2xl leading-8 tracking-[-0.6px] text-ink"
        >
          {title}
        </Text>
        <Text className="text-center font-inter text-sm leading-5 text-slate">{subtitle}</Text>
      </View>
    </View>
  );
}
