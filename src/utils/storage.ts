import { TurboModuleRegistry } from 'react-native';
import type { MMKV } from 'react-native-mmkv';

// Non-sensitive cache/storage only. Auth tokens belong in utils/auth.ts.
// MMKV is a native module (on Nitro) that is not bundled in Expo Go, and even loading the package
// there throws, so it's only required once the native side is known to be present. Without it
// (Expo Go, or a build made before MMKV was added) getStorage() returns null and callers keep
// things in memory instead.

let instance: MMKV | null | undefined;

export function getStorage(): MMKV | null {
  if (instance === undefined) {
    if (TurboModuleRegistry.get('NitroModules') === null) {
      instance = null;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createMMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
      instance = createMMKV({ id: 'app-storage' });
    }
  }
  return instance;
}
