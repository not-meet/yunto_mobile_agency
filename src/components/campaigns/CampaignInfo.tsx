import { router } from 'expo-router';
import { useState } from 'react';
import Animated, { LinearTransition, useReducedMotion } from 'react-native-reanimated';

import { AssigneesCard } from '@/components/campaigns/AssigneesCard';
import { AssigneesSheet } from '@/components/campaigns/AssigneesSheet';
import { CampaignCreators } from '@/components/campaigns/CampaignCreators';
import { CampaignPaymentCard } from '@/components/campaigns/CampaignPaymentCard';
import { AddOns } from '@/components/leads/AddOns';
import { BrandLinks } from '@/components/leads/BrandLinks';
import { DeliverablesSection } from '@/components/leads/DeliverablesSection';
import { LeadOwnerCard } from '@/components/leads/LeadOwnerCard';
import { RequirementsSection } from '@/components/leads/RequirementsSection';
import {
  useAddCampaignDeliverables,
  useRemoveCampaignDeliverable,
  useSetCampaignAssignees,
  useSetCampaignRequirements,
  useUpdateCampaignDeliverable,
} from '@/hooks/useCampaigns';
import type { CampaignDetails } from '@/services/campaignsService';
import { showToast } from '@/utils/notifications';

// The "Campaign Info" tab: who brought it in and who runs it, the brand's links and
// requirements, its top creators, deliverables (add or edit), add-ons and payment summary. Each
// section glides into place when one above it changes size.

export function CampaignInfo({ campaign }: { campaign: CampaignDetails }) {
  const reduceMotion = useReducedMotion();
  const layout = reduceMotion ? undefined : LinearTransition.duration(250);
  const addDeliverables = useAddCampaignDeliverables(campaign.id);
  const updateDeliverable = useUpdateCampaignDeliverable(campaign.id);
  const removeDeliverable = useRemoveCampaignDeliverable(campaign.id);
  const setAssignees = useSetCampaignAssignees(campaign.id);
  const setRequirements = useSetCampaignRequirements(campaign.id);
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
        <LeadOwnerCard owner={campaign.owner} />
        <BrandLinks
          name={campaign.brand ?? campaign.name}
          email={campaign.email}
          website={campaign.website}
        />
        <AssigneesCard assignees={campaign.assignees} onEdit={openAssignees} />
      </Animated.View>
      <RequirementsSection
        message={campaign.message}
        requirements={campaign.requirements}
        save={setRequirements}
      />
      <Animated.View layout={layout} className="gap-3">
        <CampaignCreators leadId={campaign.leadId} />
      </Animated.View>
      <DeliverablesSection
        deliverables={campaign.deliverables}
        add={addDeliverables}
        update={updateDeliverable}
        remove={removeDeliverable}
      />
      <Animated.View layout={layout}>
        {/* Keyed by the lead, so talent picked while it was a lead carries over. */}
        <AddOns roles={campaign.addOns} leadId={campaign.leadId} />
      </Animated.View>
      <Animated.View layout={layout}>
        <CampaignPaymentCard
          payment={campaign.payment}
          onOpen={() =>
            router.push({ pathname: '/campaigns/payments', params: { id: campaign.id } })
          }
        />
      </Animated.View>

      <AssigneesSheet
        key={sheetKey}
        visible={assigning}
        onClose={() => setAssigning(false)}
        initialIds={campaign.assignees.map((a) => a.id)}
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
