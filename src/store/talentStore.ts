import { create } from 'zustand';

import type { IndianState, ShootTier, TalentRole } from '@/services/talentService';

// Choices made while browsing videographers and editors for a lead's or campaign's add-ons.

interface SelectedTalent {
  id: string;
  name: string;
}

// e.g. "lead_01:videographer" or "cmp_02:editor".
export const selectionKey = (targetId: string, role: TalentRole) => `${targetId}:${role}`;

interface TalentState {
  // Where the shoot happens; talents based there are shown first.
  state: IndianState;
  tier: ShootTier;
  // At most one talent per lead (or campaign) and role, keyed by selectionKey.
  selections: Record<string, SelectedTalent>;
  setState: (state: IndianState) => void;
  setTier: (tier: ShootTier) => void;
  select: (targetId: string, role: TalentRole, talent: SelectedTalent) => void;
  deselect: (targetId: string, role: TalentRole) => void;
}

export const useTalentStore = create<TalentState>()((set) => ({
  state: 'Delhi',
  tier: 'standard',
  selections: {},
  setState: (state) => set({ state }),
  setTier: (tier) => set({ tier }),
  select: (targetId, role, talent) =>
    set(({ selections }) => ({
      selections: { ...selections, [selectionKey(targetId, role)]: talent },
    })),
  deselect: (targetId, role) =>
    set(({ selections }) => {
      const next = { ...selections };
      delete next[selectionKey(targetId, role)];
      return { selections: next };
    }),
}));
