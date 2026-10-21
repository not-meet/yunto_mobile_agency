import { Download, Link2, type LucideIcon } from 'lucide-react-native';
import { Pressable, Share, Text, View } from 'react-native';

import { AddCreatorButton } from '@/components/creators/CreatorsToolbar';
import type { LeadCreator } from '@/services/leadCreatorsService';
import { formatCount } from '@/utils/format';
import { showToast } from '@/utils/notifications';

// The row under a lead's creators title, once it has some (before that the screen's footer adds
// them): add creators, share the list, download it.

function QuickAction({
  label,
  icon: Icon,
  onPress,
}: {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-[34px] flex-row items-center gap-1.5 rounded-full border border-black/5 bg-white px-3.5 active:opacity-70"
      style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.04)' }}
    >
      <Icon size={14} color="#141311" strokeWidth={1.17} />
      <Text className="font-inter-medium text-xs leading-4 text-[#141311]">{label}</Text>
    </Pressable>
  );
}

function shareMessage(leadName: string, creators: LeadCreator[]): string {
  const lines = creators.map(
    (c) =>
      `${c.name} (${c.handle}) · ${c.niche}\n${formatCount(c.followers)} followers · ${
        c.engagementRate
      }% engagement`,
  );
  return [`Creators for ${leadName}`, ...lines].join('\n\n');
}

interface LeadCreatorsToolbarProps {
  leadName: string;
  creators: LeadCreator[];
  onAdd: () => void;
}

export function LeadCreatorsToolbar({ leadName, creators, onAdd }: LeadCreatorsToolbarProps) {
  const share = () =>
    Share.share({ message: shareMessage(leadName, creators) }).catch(() =>
      showToast('Couldn’t open the share sheet'),
    );

  return (
    <View className="flex-row items-center gap-2 px-4">
      <AddCreatorButton label="Add Creators" onPress={onAdd} />
      <QuickAction label="Share link" icon={Link2} onPress={share} />
      {/* TODO(leads): export the list once there's a download endpoint. */}
      <QuickAction
        label="Download"
        icon={Download}
        onPress={() => showToast('Downloading creators is coming soon')}
      />
    </View>
  );
}
