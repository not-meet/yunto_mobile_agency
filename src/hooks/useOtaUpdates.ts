import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { AppState } from 'react-native';

// Checks EAS Update on launch and whenever the app returns to the foreground,
// and reloads straight into a new bundle instead of waiting for the next cold start.
export function useOtaUpdates() {
  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;

    let checking = false;
    const check = async () => {
      if (checking) return;
      checking = true;
      try {
        const { isAvailable } = await Updates.checkForUpdateAsync();
        if (!isAvailable) return;
        const { isNew } = await Updates.fetchUpdateAsync();
        if (isNew) await Updates.reloadAsync();
      } catch {
        // Offline or update server unreachable: keep running the current bundle.
      } finally {
        checking = false;
      }
    };

    void check();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void check();
    });
    return () => sub.remove();
  }, []);
}
