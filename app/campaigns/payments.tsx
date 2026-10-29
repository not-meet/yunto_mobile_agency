import { useLocalSearchParams } from 'expo-router';

import { STATUS_STYLES } from '@/components/campaigns/labels';
import { PaymentSummaryScreen } from '@/components/campaigns/PaymentSummaryScreen';
import { useCampaign } from '@/hooks/useCampaigns';
import { useCampaignPayments, useSetCampaignAgencyFee } from '@/hooks/usePayments';

// A campaign's payment summary. The payouts were settled on the lead, so only the agency fees
// can be changed here. Opened from the campaign's payment card with the campaign's `id`.

const RUNNING = ['live', 'in_progress'];

export default function CampaignPaymentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const campaign = useCampaign(id);
  const payments = useCampaignPayments(id);
  const setFee = useSetCampaignAgencyFee(id);
  const { data } = campaign;

  return (
    <PaymentSummaryScreen
      owner={campaign}
      heading={
        data
          ? {
              name: data.name,
              subtitle: [
                data.brand,
                `${data.creatorCount} ${data.creatorCount === 1 ? 'creator' : 'creators'}`,
              ]
                .filter(Boolean)
                .join(' · '),
              badge: RUNNING.includes(data.status)
                ? { label: 'Active', active: true }
                : { label: STATUS_STYLES[data.status].label, active: false },
            }
          : null
      }
      payments={payments}
      editing={{ kind: 'campaign', campaignId: id }}
      setFee={setFee}
      fallbackHref={{ pathname: '/campaigns/[id]', params: { id } }}
    />
  );
}
