import { SQLiteDatabase } from 'expo-sqlite';
import { ScheduledNotification, ScheduledNotificationType, ScheduleConfig } from '@/types';

type Row = {
  id: number;
  title: string;
  body: string;
  type: string;
  config: string;
  is_active: number;
  notification_ids: string;
  created_at: number;
};

function parseRow(row: Row): ScheduledNotification {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.type as ScheduledNotificationType,
    config: JSON.parse(row.config) as ScheduleConfig,
    is_active: row.is_active === 1,
    notification_ids: JSON.parse(row.notification_ids) as string[],
    created_at: row.created_at,
  };
}

export async function getAllScheduledNotifications(db: SQLiteDatabase): Promise<ScheduledNotification[]> {
  const rows = await db.getAllAsync<Row>(
    'SELECT * FROM scheduled_notifications ORDER BY created_at DESC'
  );
  return rows.map(parseRow);
}

export async function insertScheduledNotification(
  db: SQLiteDatabase,
  data: Omit<ScheduledNotification, 'id' | 'notification_ids'>
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO scheduled_notifications (title, body, type, config, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    data.title,
    data.body,
    data.type,
    JSON.stringify(data.config),
    data.is_active ? 1 : 0,
    data.created_at
  );
  return result.lastInsertRowId;
}

export async function updateNotificationIds(
  db: SQLiteDatabase,
  id: number,
  ids: string[]
): Promise<void> {
  await db.runAsync(
    'UPDATE scheduled_notifications SET notification_ids = ? WHERE id = ?',
    JSON.stringify(ids),
    id
  );
}

export async function setScheduledNotificationActive(
  db: SQLiteDatabase,
  id: number,
  active: boolean
): Promise<void> {
  await db.runAsync(
    'UPDATE scheduled_notifications SET is_active = ? WHERE id = ?',
    active ? 1 : 0,
    id
  );
}

export async function deleteScheduledNotification(
  db: SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync('DELETE FROM scheduled_notifications WHERE id = ?', id);
}
