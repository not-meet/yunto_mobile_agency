import { router } from 'expo-router';
import Animated, { LinearTransition, useReducedMotion } from 'react-native-reanimated';

import { AddOns } from '@/components/leads/AddOns';
import { BrandLinks } from '@/components/leads/BrandLinks';
import { BrandMessageCard } from '@/components/leads/BrandMessageCard';
import { DeliverablesCard } from '@/components/leads/DeliverablesCard';
import { LeadOwnerCard } from '@/components/leads/LeadOwnerCard';
import { LinkRow } from '@/components/leads/LinkRow';
import { PaymentSummary } from '@/components/leads/PaymentSummary';
import type { LeadDetails } from '@/services/leadsService';
import { showToast } from '@/utils/notifications';

// The "Lead Info" tab. Each section glides into place when the brand message opens or closes,
// or a deliverable link is added.

export function LeadInfo({ lead }: { lead: LeadDetails }) {
  const reduceMotion = useReducedMotion();
  const layout = reduceMotion ? undefined : LinearTransition.duration(250);

  return (
    <Animated.View layout={layout} className="gap-3">
      <Animated.View layout={layout} className="gap-3">
        <LeadOwnerCard owner={lead.owner} />
        <BrandLinks name={lead.brand ?? lead.name} email={lead.email} website={lead.website} />
      </Animated.View>
      <BrandMessageCard message={lead.message} />
      <Animated.View layout={layout} className="gap-3">
        {/* TODO(leads): open this once its screen is designed. */}
        <LinkRow
          title="Script & References"
          onPress={() => showToast('Script & references are coming soon')}
        />
        <LinkRow
          title="Creators"
          onPress={() => router.push({ pathname: '/leads/creators', params: { id: lead.id } })}
        />
      </Animated.View>
      <DeliverablesCard leadId={lead.id} deliverables={lead.deliverables} links={lead.links} />
      <Animated.View layout={layout}>
        <AddOns roles={lead.addOns} leadId={lead.id} />
      </Animated.View>
      <Animated.View layout={layout}>
        <PaymentSummary payment={lead.payment} />
      </Animated.View>
    </Animated.View>
  );
}
