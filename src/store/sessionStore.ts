import { create } from 'zustand';

import type { Agency, Role, User } from '@/services/authService';

// Who's signed in and which agency they're working in. In memory only while the app runs on
// dummy data; tokens will go through utils/auth.ts once there's a real API.

interface SessionState {
  user: User | null;
  agency: Agency | null;
  // TODO(rbac): take this from the signed-in user once the API returns it.
  role: Role;
  setUser: (user: User) => void;
  setAgency: (agency: Agency) => void;
  setRole: (role: Role) => void;
  // Log Out on the profile. The role stays, since it's only a dev setting for now.
  signOut: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  user: null,
  agency: null,
  role: 'admin',
  setUser: (user) => set({ user }),
  setAgency: (agency) => set({ agency }),
  setRole: (role) => set({ role }),
  signOut: () => set({ user: null, agency: null }),
}));
