import { useCallback, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { useSQLiteContext } from 'expo-sqlite';
import {
  getAllScheduledNotifications,
  insertScheduledNotification,
  updateNotificationIds,
  setScheduledNotificationActive,
  deleteScheduledNotification,
} from '@/repositories/scheduledNotificationRepository';
import { useNotifications } from '@/hooks/useNotifications';
import {
  ScheduledNotification,
  ScheduledNotificationType,
  ScheduleConfig,
  IntervalConfig,
  WeeklyConfig,
  DateConfig,
} from '@/types';

export type CreateScheduledNotificationInput = {
  title: string;
  body: string;
  type: ScheduledNotificationType;
  config: ScheduleConfig;
};

async function scheduleByType(
  type: ScheduledNotificationType,
  config: ScheduleConfig,
  title: string,
  body: string
): Promise<string[]> {
  if (type === 'interval') {
    const { hours } = config as IntervalConfig;
    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: hours * 3600,
        repeats: true,
      },
    });
    return [id];
  }

  if (type === 'weekly') {
    const { weekdays, hour, minute } = config as WeeklyConfig;
    const ids = await Promise.all(
      weekdays.map((weekday) =>
        Notifications.scheduleNotificationAsync({
          content: { title, body },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday,
            hour,
            minute,
          },
        })
      )
    );
    return ids;
  }

  if (type === 'date') {
    const { timestamp } = config as DateConfig;
    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(timestamp * 1000),
      },
    });
    return [id];
  }

  return [];
}

async function cancelIds(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

export function useScheduledNotifications() {
  const db = useSQLiteContext();
  const { requestPermission } = useNotifications();
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);

  const load = useCallback(async () => {
    const rows = await getAllScheduledNotifications(db);

    // Auto-desativar agendamentos por data que já passaram
    const now = Math.floor(Date.now() / 1000);
    const updated: ScheduledNotification[] = [];
    for (const n of rows) {
      if (n.type === 'date' && n.is_active && (n.config as DateConfig).timestamp <= now) {
        await setScheduledNotificationActive(db, n.id, false);
        updated.push({ ...n, is_active: false });
      } else {
        updated.push(n);
      }
    }

    setNotifications(updated);
  }, [db]);

  const create = useCallback(
    async (input: CreateScheduledNotificationInput): Promise<void> => {
      const granted = await requestPermission();
      if (!granted) return;

      const now = Math.floor(Date.now() / 1000);
      const id = await insertScheduledNotification(db, {
        title: input.title,
        body: input.body,
        type: input.type,
        config: input.config,
        is_active: true,
        created_at: now,
      });

      const ids = await scheduleByType(input.type, input.config, input.title, input.body);
      await updateNotificationIds(db, id, ids);

      const newItem: ScheduledNotification = {
        id,
        title: input.title,
        body: input.body,
        type: input.type,
        config: input.config,
        is_active: true,
        notification_ids: ids,
        created_at: now,
      };

      setNotifications((prev) => [newItem, ...prev]);
    },
    [db, requestPermission]
  );

  const deactivate = useCallback(
    async (id: number): Promise<void> => {
      const item = notifications.find((n) => n.id === id);
      if (!item) return;

      await cancelIds(item.notification_ids);
      await setScheduledNotificationActive(db, id, false);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_active: false, notification_ids: [] } : n))
      );
      await updateNotificationIds(db, id, []);
    },
    [db, notifications]
  );

  const activate = useCallback(
    async (id: number): Promise<void> => {
      const item = notifications.find((n) => n.id === id);
      if (!item) return;

      const granted = await requestPermission();
      if (!granted) return;

      const ids = await scheduleByType(item.type, item.config, item.title, item.body);
      await updateNotificationIds(db, id, ids);
      await setScheduledNotificationActive(db, id, true);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_active: true, notification_ids: ids } : n))
      );
    },
    [db, notifications, requestPermission]
  );

  const remove = useCallback(
    async (id: number): Promise<void> => {
      const item = notifications.find((n) => n.id === id);
      if (item) await cancelIds(item.notification_ids);

      await deleteScheduledNotification(db, id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    },
    [db, notifications]
  );

  return { notifications, load, create, deactivate, activate, remove };
}
