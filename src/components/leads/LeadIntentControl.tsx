import { useRef, useState } from 'react';
import { View } from 'react-native';

import { useSetLeadIntent } from '@/hooks/useLeads';
import type { LeadIntent } from '@/services/leadsService';
import { showToast } from '@/utils/notifications';

// The lead's intent as five bars in a small white pill, as on yunto-private: the first bar sets
// low (one red bar), the next two medium (three amber), the last two high (all five green). Tap a
// bar or drag along the pill to raise or lower it; it's saved when the finger lifts. Once set it
// can be changed but not cleared.

const TONE: Record<LeadIntent, string> = { low: '#E5372F', medium: '#F2A03D', high: '#3BB54A' };
const EMPTY = '#E4E7EC';
const FILLED: Record<LeadIntent, number> = { low: 1, medium: 3, high: 5 };
const LABELS: Record<LeadIntent, string> = { low: 'Low', medium: 'Medium', high: 'High' };
const ORDER: readonly LeadIntent[] = ['low', 'medium', 'high'];

// The pill is 111 wide with five 14-wide bars 4 apart in the middle.
const PILL = 111;
const BAR = 14;
const GAP = 4;
const INSET = (PILL - 5 * BAR - 4 * GAP) / 2;

const levelForBar = (bar: number): LeadIntent => (bar <= 1 ? 'low' : bar <= 3 ? 'medium' : 'high');

// The bar under `x` (from the pill's left edge), clamped to the first and last.
const barAt = (x: number) =>
  Math.min(5, Math.max(1, Math.ceil((x - INSET + GAP / 2) / (BAR + GAP))));

interface LeadIntentControlProps {
  leadId: string;
  intent: LeadIntent | null;
}

export function LeadIntentControl({ leadId, intent }: LeadIntentControlProps) {
  const setIntent = useSetLeadIntent(leadId);
  // The level under the finger while dragging, shown before it's saved.
  const [dragged, setDragged] = useState<LeadIntent | null>(null);
  // Where the drag started: in the pill, and on screen.
  const start = useRef({ x: 0, pageX: 0 });
  const shown = dragged ?? intent;
  const filled = shown ? FILLED[shown] : 0;

  const save = (next: LeadIntent) => {
    if (next === intent) return;
    setIntent.mutate(next, {
      onError: () => showToast('Couldn’t set the intent. Please try again.'),
    });
  };

  const drag = (x: number) => {
    const next = levelForBar(barAt(x));
    if (next !== dragged) setDragged(next);
  };

  const release = () => {
    if (dragged) save(dragged);
    setDragged(null);
  };

  const step = (by: number) => {
    const at = intent ? ORDER.indexOf(intent) : by > 0 ? -1 : ORDER.length;
    const next = ORDER[Math.min(ORDER.length - 1, Math.max(0, at + by))];
    if (next) save(next);
  };

  return (
    <View
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      // Keeps the screen's scroll from taking over mid-drag.
      onResponderTerminationRequest={() => false}
      onResponderGrant={(e) => {
        start.current = { x: e.nativeEvent.locationX, pageX: e.nativeEvent.pageX };
        drag(start.current.x);
      }}
      onResponderMove={(e) => drag(start.current.x + e.nativeEvent.pageX - start.current.pageX)}
      onResponderRelease={release}
      onResponderTerminate={() => setDragged(null)}
      hitSlop={{ top: 6, bottom: 6 }}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Intent"
      accessibilityValue={{ text: intent ? LABELS[intent] : 'Not set' }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
      className="h-8 w-[111px] flex-row items-center justify-center gap-1 rounded-[18px] border-[0.5px] border-[#D9D9D9] bg-white"
    >
      {[1, 2, 3, 4, 5].map((bar) => (
        <View
          key={bar}
          pointerEvents="none"
          className="h-5 w-3.5 rounded-lg"
          style={{ backgroundColor: shown && bar <= filled ? TONE[shown] : EMPTY }}
        />
      ))}
    </View>
  );
}
