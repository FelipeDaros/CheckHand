import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { hasPin, deletePin } from '@/utils/security';
import { getSetting, setSetting } from '@/repositories/settingsRepository';

export function useSettings() {
  const db = useSQLiteContext();
  const [pinEnabled, setPinEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [pin, notif] = await Promise.all([
      hasPin(),
      getSetting(db, 'notifications_enabled'),
    ]);
    setPinEnabled(pin);
    setNotificationsEnabled(notif !== '0');
    setLoading(false);
  }, [db]);

  useEffect(() => {
    load();
  }, [load]);

  const togglePin = useCallback(async (enabled: boolean) => {
    if (!enabled) await deletePin();
    setPinEnabled(enabled);
  }, []);

  const toggleNotifications = useCallback(
    async (enabled: boolean) => {
      await setSetting(db, 'notifications_enabled', enabled ? '1' : '0');
      setNotificationsEnabled(enabled);
    },
    [db],
  );

  return { pinEnabled, notificationsEnabled, loading, togglePin, toggleNotifications, refresh: load };
}
