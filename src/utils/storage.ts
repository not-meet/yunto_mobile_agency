import { createMMKV, type MMKV } from 'react-native-mmkv';

// Non-sensitive cache/storage only. Auth tokens belong in utils/auth.ts.
// Created lazily: MMKV is a native module that is not bundled in Expo Go.

let instance: MMKV | undefined;

export function getStorage(): MMKV {
  instance ??= createMMKV({ id: 'app-storage' });
  return instance;
}
