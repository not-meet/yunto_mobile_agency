import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';

import {
  connectAgency,
  generateAgencyCode,
  signIn,
  signInWithGoogle,
  type Agency,
  type User,
} from '@/services/authService';
import { useSessionStore } from '@/store/sessionStore';

// Onboarding mutations. Each one saves what it got back and lands on home, clearing the
// onboarding screens so back doesn't return to them.

function goHome() {
  if (router.canDismiss()) router.dismissAll();
  router.replace('/home');
}

function useSaveUser() {
  const setUser = useSessionStore((s) => s.setUser);
  return (user: User) => {
    setUser(user);
    goHome();
  };
}

function useSaveAgency() {
  const setAgency = useSessionStore((s) => s.setAgency);
  return (agency: Agency) => {
    setAgency(agency);
    goHome();
  };
}

export function useSignIn() {
  return useMutation({ mutationFn: signIn, onSuccess: useSaveUser() });
}

export function useGoogleSignIn() {
  return useMutation({ mutationFn: signInWithGoogle, onSuccess: useSaveUser() });
}

export function useGenerateAgencyCode() {
  return useMutation({ mutationFn: generateAgencyCode, onSuccess: useSaveAgency() });
}

export function useConnectAgency() {
  return useMutation({ mutationFn: connectAgency, onSuccess: useSaveAgency() });
}
