import { router } from 'expo-router';
import { useState } from 'react';
import Animated, { LinearTransition, useReducedMotion } from 'react-native-reanimated';

import { AssigneesCard } from '@/components/campaigns/AssigneesCard';
import { AssigneesSheet } from '@/components/campaigns/AssigneesSheet';
import { AddOns } from '@/components/leads/AddOns';
import { BrandLinks } from '@/components/leads/BrandLinks';
import { DeliverablesSection } from '@/components/leads/DeliverablesSection';
import { LeadOwnerCard } from '@/components/leads/LeadOwnerCard';
import { LinkRow } from '@/components/leads/LinkRow';
import { PaymentSummary } from '@/components/leads/PaymentSummary';
import { RequirementsSection } from '@/components/leads/RequirementsSection';
import {
  useAddLeadDeliverables,
  useRemoveLeadDeliverable,
  useSetLeadAssignees,
  useSetLeadRequirements,
  useUpdateLeadDeliverable,
} from '@/hooks/useLeads';
import type { LeadDetails } from '@/services/leadsService';
import { showToast } from '@/utils/notifications';

// The "Lead Info" tab: who brought it in and who's working it, the brand's links and
// requirements, its creators, deliverables (add or edit), add-ons and payment. Each section
// glides into place when one above it changes size.

export function LeadInfo({ lead }: { lead: LeadDetails }) {
  const reduceMotion = useReducedMotion();
  const layout = reduceMotion ? undefined : LinearTransition.duration(250);
  const setAssignees = useSetLeadAssignees(lead.id);
  const setRequirements = useSetLeadRequirements(lead.id);
  const addDeliverables = useAddLeadDeliverables(lead.id);
  const updateDeliverable = useUpdateLeadDeliverable(lead.id);
  const removeDeliverable = useRemoveLeadDeliverable(lead.id);
  const [assigning, setAssigning] = useState(false);
  // Re-keys the sheet per opening, so it starts from the current assignees.
  const [sheetKey, setSheetKey] = useState(0);

  const openAssignees = () => {
    setAssignees.reset();
    setSheetKey((key) => key + 1);
    setAssigning(true);
  };

  return (
    <Animated.View layout={layout} className="gap-3">
      <Animated.View layout={layout} className="gap-3">
        <LeadOwnerCard owner={lead.owner} />
        <BrandLinks name={lead.brand ?? lead.name} email={lead.email} website={lead.website} />
        <AssigneesCard assignees={lead.assignees} onEdit={openAssignees} />
      </Animated.View>
      <RequirementsSection
        message={lead.message}
        requirements={lead.requirements}
        save={setRequirements}
      />
      <Animated.View layout={layout} className="gap-3">
        <LinkRow
          title="Creators"
          onPress={() => router.push({ pathname: '/leads/creators', params: { id: lead.id } })}
        />
      </Animated.View>
      <DeliverablesSection
        deliverables={lead.deliverables}
        add={addDeliverables}
        update={updateDeliverable}
        remove={removeDeliverable}
      />
      <Animated.View layout={layout}>
        <AddOns roles={lead.addOns} leadId={lead.id} />
      </Animated.View>
      <Animated.View layout={layout}>
        <PaymentSummary
          payment={lead.payment}
          onOpen={() => router.push({ pathname: '/leads/payments', params: { id: lead.id } })}
        />
      </Animated.View>

      <AssigneesSheet
        key={sheetKey}
        visible={assigning}
        onClose={() => setAssigning(false)}
        initialIds={lead.assignees.map((a) => a.id)}
        onSave={(memberIds) =>
          setAssignees.mutate(memberIds, {
            onSuccess: () => {
              setAssigning(false);
              showToast('Assignees updated');
            },
          })
        }
        busy={setAssignees.isPending}
        error={setAssignees.isError ? 'Couldn’t update the assignees. Please try again.' : null}
      />
    </Animated.View>
  );
}
