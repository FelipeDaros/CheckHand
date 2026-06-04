import { useCallback, useEffect, useState } from 'react';
import { hasPin, createPin, verifyPin, deletePin } from '@/utils/security';

export function usePin() {
  const [pinExists, setPinExists] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hasPin().then((v) => {
      setPinExists(v);
      setLoading(false);
    });
  }, []);

  const create = useCallback(async (pin: string): Promise<void> => {
    await createPin(pin);
    setPinExists(true);
  }, []);

  const verify = useCallback(async (pin: string): Promise<boolean> => {
    return verifyPin(pin);
  }, []);

  const remove = useCallback(async (): Promise<void> => {
    await deletePin();
    setPinExists(false);
  }, []);

  return { pinExists, loading, create, verify, remove };
}
