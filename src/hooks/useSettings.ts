import { useCallback, useEffect, useState } from 'react';
import { hasPin, deletePin } from '@/utils/security';

export function useSettings() {
  const [pinEnabled, setPinEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const v = await hasPin();
    setPinEnabled(v);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const togglePin = useCallback(async (enabled: boolean) => {
    if (!enabled) await deletePin();
    setPinEnabled(enabled);
  }, []);

  return { pinEnabled, loading, togglePin, refresh: load };
}
