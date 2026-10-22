import { Trash2 } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { ConfirmSheet } from '@/components/common/ConfirmSheet';

// Confirming creators come off a lead, as on yunto-private: what removing them does, then
// Cancel / Remove. From the picked cards on a lead's creators, or one creator's details. Stays
// open while `busy`; the caller closes it once it's done.

const CONSEQUENCES = [
  'They will no longer appear on this campaign',
  'Their agreed price on it is cleared',
  'The creators themselves stay on your roster',
];

interface RemoveCreatorsSheetProps {
  visible: boolean;
  onClose: () => void;
  count: number;
  onConfirm: () => void;
  busy: boolean;
  error: string | null;
}

export function RemoveCreatorsSheet({
  visible,
  onClose,
  count,
  onConfirm,
  busy,
  error,
}: RemoveCreatorsSheetProps) {
  const one = count === 1;
  return (
    <ConfirmSheet
      visible={visible}
      onClose={onClose}
      title={one ? 'Remove this creator?' : 'Remove these creators?'}
      message={`This will remove ${count} ${one ? 'creator' : 'creators'} from this campaign. This can’t be undone.`}
      icon={Trash2}
      tone={{ color: '#E74C3C', background: 'rgba(231, 76, 60, 0.12)' }}
      confirmLabel={one ? 'Remove creator' : 'Remove creators'}
      onConfirm={onConfirm}
      busy={busy}
      error={error}
    >
      <View className="gap-2.5 rounded-2xl bg-[#F7F5F2] p-4">
        {CONSEQUENCES.map((line) => (
          <View key={line} className="flex-row items-start gap-2.5">
            <View className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#78736E]" />
            <Text className="flex-1 font-inter text-[13px] leading-5 text-[#4B4743]">{line}</Text>
          </View>
        ))}
      </View>
    </ConfirmSheet>
  );
}
