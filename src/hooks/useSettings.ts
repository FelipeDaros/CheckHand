import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getSetting, setSetting } from '@/repositories/settingsRepository';

export function useSettings() {
  const db = useSQLiteContext();
  const [pinEnabled, setPinEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const val = await getSetting(db, 'pin_enabled');
    setPinEnabled(val === 'true');
    setLoading(false);
  }, [db]);

  useEffect(() => {
    load();
  }, [load]);

  const togglePin = useCallback(
    async (enabled: boolean) => {
      await setSetting(db, 'pin_enabled', enabled ? 'true' : 'false');
      setPinEnabled(enabled);
    },
    [db],
  );

  return { pinEnabled, loading, togglePin };
}
