import * as SecureStore from 'expo-secure-store';

import { STORAGE_KEYS } from '@/utils/constants';

// The only place auth tokens are read/written. SecureStore only — never AsyncStorage/MMKV.

export function getAuthToken(): Promise<string | null> {
  return SecureStore.getItemAsync(STORAGE_KEYS.authToken);
}

export function setAuthToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(STORAGE_KEYS.authToken, token);
}

export function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(STORAGE_KEYS.refreshToken);
}

export function setRefreshToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, token);
}

export async function clearAuthTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(STORAGE_KEYS.authToken),
    SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken),
  ]);
}
