import { Download, Link2, type LucideIcon, Trash2 } from 'lucide-react-native';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';

import { AddCreatorButton } from '@/components/creators/CreatorsToolbar';
import type { LeadCreator } from '@/services/leadCreatorsService';
import { formatCount } from '@/utils/format';
import { showToast } from '@/utils/notifications';

// The row under a lead's creators title, once it has some (before that the screen's footer adds
// them): add creators, share the list, download it, and on the right remove the picked ones
// (left out without `onRemove`, where the screen removes them some other way).

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
  // How many cards are picked; Remove asks to pick some first while it's 0.
  selectedCount: number;
  onRemove?: () => void;
}

export function LeadCreatorsToolbar({
  leadName,
  creators,
  onAdd,
  selectedCount,
  onRemove,
}: LeadCreatorsToolbarProps) {
  const share = () =>
    Share.share({ message: shareMessage(leadName, creators) }).catch(() =>
      showToast('Couldn’t open the share sheet'),
    );

  return (
    <View className="flex-row items-center gap-2 pr-4">
      {/* Scrolls sideways on narrow screens, keeping Remove in view. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ gap: 8, paddingLeft: 16, alignItems: 'center' }}
      >
        <AddCreatorButton label="Add Creators" onPress={onAdd} />
        <QuickAction label="Share link" icon={Link2} onPress={share} />
        {/* TODO(leads): export the list once there's a download endpoint. */}
        <QuickAction
          label="Download"
          icon={Download}
          onPress={() => showToast('Downloading creators is coming soon')}
        />
      </ScrollView>
      {onRemove ? (
        <Pressable
          onPress={() =>
            selectedCount > 0 ? onRemove() : showToast('Select the creators to remove first')
          }
          accessibilityRole="button"
          accessibilityLabel={
            selectedCount > 0 ? `Remove ${selectedCount} selected` : 'Remove creators'
          }
          className={`h-[34px] w-[34px] items-center justify-center rounded-full border border-black/5 bg-white active:opacity-70 ${
            selectedCount > 0 ? '' : 'opacity-50'
          }`}
          style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.04)' }}
        >
          <Trash2 size={14} color="#E74C3C" strokeWidth={1.5} />
          {selectedCount > 0 ? (
            <View className="absolute -right-1 -top-1 h-4 min-w-4 items-center justify-center rounded-full bg-[#141311] px-1">
              <Text className="font-inter-bold text-[9px] leading-3 text-[#FAF7F2]">
                {selectedCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
}
