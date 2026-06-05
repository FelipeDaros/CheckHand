import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  scheduleChecklistNotification,
  cancelChecklistNotification,
  cancelAllChecklistNotifications,
} from '@/repositories/notificationRepository';

export function useNotifications() {
  const [permissionDenied, setPermissionDenied] = useState(false);

  const checkPermission = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionDenied(status === 'denied');
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const { status: current } = await Notifications.getPermissionsAsync();
    if (current === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === 'granted';
    setPermissionDenied(!granted);

    if (!granted) {
      Alert.alert(
        'Notificações bloqueadas',
        'Ative as notificações nas configurações do dispositivo para receber lembretes de prazo.',
      );
    }

    return granted;
  }, []);

  const scheduleNotification = useCallback(
    async (
      checklistId: number,
      title: string,
      dueDate: number,
    ): Promise<string | null> => {
      const granted = await requestPermission();
      if (!granted) return null;
      return scheduleChecklistNotification(checklistId, title, dueDate);
    },
    [requestPermission],
  );

  return {
    permissionDenied,
    checkPermission,
    requestPermission,
    scheduleNotification,
    cancelNotification: cancelChecklistNotification,
    cancelAllNotifications: cancelAllChecklistNotifications,
  };
}
