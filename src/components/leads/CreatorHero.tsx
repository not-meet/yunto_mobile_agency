import { ChevronDown } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View, type ViewStyle } from 'react-native';

import { DropdownMenu } from '@/components/common/DropdownMenu';
import { CreatorAvatar } from '@/components/leads/CreatorAvatar';
import { CREATOR_STATUS_LABELS } from '@/components/leads/labels';
import type { LeadCreatorDetails } from '@/services/leadCreatorsService';
import { dayMonth, fromDateKey } from '@/utils/dates';
import { groupDigits } from '@/utils/format';

// Top card of a creator on a lead: who they are, their niche and city, the status (tap to change
// it), and the deal at a glance.

type SettableStatus = 'pending' | 'shortlisted' | 'done';

const STATUS_OPTIONS: { value: SettableStatus; label: string }[] = [
  { value: 'pending', label: CREATOR_STATUS_LABELS.pending },
  { value: 'shortlisted', label: CREATOR_STATUS_LABELS.shortlisted },
  { value: 'done', label: CREATOR_STATUS_LABELS.done },
];

const EMPTY = '—';

function Chip({ label }: { label: string }) {
  return (
    <View
      className="max-w-[120px] rounded-full border border-[rgba(232,229,223,0.1)] bg-white/90 px-2 py-0.5"
      style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
    >
      <Text numberOfLines={1} className="font-inter-bold text-[9px] leading-[14px] text-[#141311]">
        {label}
      </Text>
    </View>
  );
}

function Fact({ label, value, end }: { label: string; value: string; end?: boolean }) {
  return (
    <View className={`shrink ${end ? 'items-end' : 'items-start'}`}>
      <Text className="font-inter text-[9px] uppercase leading-[14px] tracking-[0.45px] text-[#8C8A84]">
        {label}
      </Text>
      <Text numberOfLines={1} className="font-inter-bold text-xs leading-4 text-[#141311]">
        {value}
      </Text>
    </View>
  );
}

interface CreatorHeroProps {
  creator: LeadCreatorDetails;
  onStatusChange: (status: SettableStatus) => void;
  // A status change is in flight; the pill can't be opened again until it lands.
  updating: boolean;
}

export function CreatorHero({ creator, onStatusChange, updating }: CreatorHeroProps) {
  const { width } = useWindowDimensions();
  const pill = useRef<View>(null);
  const [menu, setMenu] = useState<ViewStyle | null>(null);
  const deadline = creator.deadline ? fromDateKey(creator.deadline) : null;

  // Opens the menu just under the pill, lined up with its right edge.
  const openMenu = () =>
    pill.current?.measureInWindow((x, y, w, h) =>
      setMenu({ top: y + h + 8, right: Math.max(16, width - x - w) }),
    );

  return (
    <View
      className="gap-4 rounded-[28px] p-5"
      style={{
        experimental_backgroundImage:
          'linear-gradient(135deg, #F2EDFF 0%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 236, 243, 0.6) 100%)',
        boxShadow: '0px 8px 28px rgba(0, 0, 0, 0.03)',
      }}
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-3.5">
          <CreatorAvatar
            name={creator.name}
            url={creator.avatarUrl}
            platform={creator.platform}
            size={56}
          />
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="font-inter-extrabold text-lg leading-[22px] tracking-[-0.45px] text-[#141311]"
            >
              {creator.name}
            </Text>
            <Text numberOfLines={1} className="font-inter text-xs leading-4 text-[#8C8A84]">
              {creator.handle}
            </Text>
            <View className="mt-1.5 flex-row flex-wrap gap-1.5">
              <Chip label={creator.niche} />
              {creator.location ? <Chip label={creator.location} /> : null}
            </View>
          </View>
        </View>
        <Pressable
          ref={pill}
          onPress={openMenu}
          disabled={updating}
          accessibilityRole="button"
          accessibilityLabel={`Status, ${CREATOR_STATUS_LABELS[creator.status]}. Change status`}
          accessibilityState={{ expanded: menu !== null, busy: updating }}
          className={`flex-row items-center gap-1.5 rounded-full bg-[#141311] px-3 py-2 active:opacity-80 ${
            updating ? 'opacity-60' : ''
          }`}
          style={{
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Text className="font-inter-bold text-[10px] leading-[15px] tracking-[0.25px] text-[#FAF7F2]">
            {CREATOR_STATUS_LABELS[creator.status]}
          </Text>
          <ChevronDown size={10} color="#FAF7F2" strokeWidth={2} />
        </Pressable>
      </View>

      <View
        className="flex-row items-center justify-between gap-2 rounded-[18px] bg-white/70 p-3"
        style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
      >
        <Fact label="Campaign" value={creator.campaign ?? EMPTY} />
        <Fact
          label="Deadline"
          value={deadline ? `${dayMonth(deadline)} ${deadline.getFullYear()}` : EMPTY}
          end
        />
        <Fact
          label="Budget"
          value={creator.budget === null ? EMPTY : `₹${groupDigits(creator.budget)}`}
          end
        />
      </View>

      <DropdownMenu
        visible={menu !== null}
        onClose={() => setMenu(null)}
        options={STATUS_OPTIONS}
        selected={creator.status === 'UNKNOWN' ? undefined : creator.status}
        onSelect={(status) => {
          if (status !== creator.status) onStatusChange(status);
        }}
        position={menu ?? {}}
        label="Creator status"
      />
    </View>
  );
}
