import { useLocalSearchParams } from 'expo-router';

import { PaymentSummaryScreen } from '@/components/campaigns/PaymentSummaryScreen';
import { STATUS_STYLES } from '@/components/leads/labels';
import { useLeadPayments, useSetLeadAgencyFee } from '@/hooks/usePayments';
import { useLead } from '@/hooks/useLeads';

// A lead's payment summary, where each creator's payout is agreed: a pencil edits it, or
// approves what their agency proposed. Each group's agency fee can be changed here too. Opened from the lead's payment card with the lead's `id`.

export default function LeadPaymentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lead = useLead(id);
  const payments = useLeadPayments(id);
  const setFee = useSetLeadAgencyFee(id);
  const { data } = lead;
  const creatorCount = payments.data?.groups.reduce((n, g) => n + g.creators.length, 0) ?? 0;

  return (
    <PaymentSummaryScreen
      owner={lead}
      heading={
        data
          ? {
              name: data.campaign ?? data.brand ?? data.name,
              subtitle: [
                data.brand,
                `${creatorCount} ${creatorCount === 1 ? 'creator' : 'creators'}`,
              ]
                .filter(Boolean)
                .join(' · '),
              badge: { label: STATUS_STYLES[data.status].label, active: false },
            }
          : null
      }
      payments={payments}
      editing={{ kind: 'lead', leadId: id }}
      setFee={setFee}
      fallbackHref={{ pathname: '/leads/[id]', params: { id } }}
    />
  );
}
