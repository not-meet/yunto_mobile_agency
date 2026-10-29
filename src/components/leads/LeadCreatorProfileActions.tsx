import { router } from 'expo-router';

import { CreatorActionsBar } from '@/components/leads/CreatorActionsBar';
import { CREATOR_STATUS_LABELS } from '@/components/leads/labels';
import { useLeadCreator, useSetLeadCreatorStatus } from '@/hooks/useLeadCreators';
import { showToast } from '@/utils/notifications';

// The bar pinned under a creator's profile when it's opened from a lead's creators: their
// calendar, and shortlisting them for that lead. It reads the same cache as the lead's list, so a
// change here shows there too.
export function LeadCreatorProfileActions({
  leadId,
  creatorId,
}: {
  leadId: string;
  creatorId: string;
}) {
  const { data } = useLeadCreator(leadId, creatorId);
  const setStatus = useSetLeadCreatorStatus(leadId);
  const status = data?.status ?? 'pending';

  const shortlist = () => {
    if (!data || setStatus.isPending) return;
    setStatus.mutate(
      { creatorIds: [data.id], status: 'shortlisted' },
      {
        onSuccess: () => showToast(`${data.name} is now shortlisted`),
        onError: () => showToast('Couldn’t update this creator. Please try again.'),
      },
    );
  };

  return (
    <CreatorActionsBar
      buttonHeight={40}
      actions={[
        {
          label: 'Manage Calendar',
          background: '#FFECF3',
          grow: true,
          onPress: () => router.push({ pathname: '/creators/calendar', params: { id: creatorId } }),
        },
        {
          label: status === 'pending' ? 'Mark Shortlist' : CREATOR_STATUS_LABELS[status],
          background: '#E9F6ED',
          grow: true,
          onPress: shortlist,
          disabled: !data || status !== 'pending',
          busy: setStatus.isPending,
        },
      ]}
    />
  );
}
