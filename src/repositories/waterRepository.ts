import { SQLiteDatabase } from 'expo-sqlite';
import * as Notifications from 'expo-notifications';
import { getSetting, setSetting } from '@/repositories/settingsRepository';

export type DayHistory = {
  date: string;
  totalMl: number;
  metGoal: boolean;
};

export async function getHistory(
  db: SQLiteDatabase,
  goalMl: number,
  limit = 30,
): Promise<DayHistory[]> {
  const rows = await db.getAllAsync<{ day: string; total: number }>(
    `SELECT date(logged_at, 'unixepoch', 'localtime') as day,
            SUM(amount_ml) as total
     FROM water_log
     WHERE logged_at < unixepoch('now', 'start of day')
     GROUP BY day
     ORDER BY day DESC
     LIMIT ?`,
    limit,
  );
  return rows.map((r) => ({
    date: r.day,
    totalMl: r.total,
    metGoal: r.total >= goalMl,
  }));
}

export async function getTodayTotal(db: SQLiteDatabase): Promise<number> {
  const result = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(amount_ml), 0) as total FROM water_log WHERE logged_at >= unixepoch('now', 'start of day')",
  );
  return result?.total ?? 0;
}

export async function addIntake(db: SQLiteDatabase, amountMl: number): Promise<void> {
  await db.runAsync('INSERT INTO water_log (amount_ml) VALUES (?)', amountMl);
}

export async function clearToday(db: SQLiteDatabase): Promise<void> {
  await db.runAsync(
    "DELETE FROM water_log WHERE logged_at >= unixepoch('now', 'start of day')",
  );
}

export async function cancelWaterNotifications(db: SQLiteDatabase): Promise<void> {
  const idsJson = (await getSetting(db, 'water_notif_ids')) ?? '[]';
  const ids: string[] = JSON.parse(idsJson);
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})),
  );
  await setSetting(db, 'water_notif_ids', '[]');
}

export async function scheduleWaterNotifications(
  db: SQLiteDatabase,
  startHour: number,
  endHour: number,
  intervalHours: number,
): Promise<void> {
  await cancelWaterNotifications(db);

  const now = new Date();
  const today = new Date();
  const ids: string[] = [];

  let hour = startHour;
  while (hour <= endHour) {
    const slot = new Date(today);
    slot.setHours(hour, 0, 0, 0);

    if (slot > now) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Hora de beber água! 💧',
          body: 'Mantenha-se hidratado durante o dia.',
          data: { type: 'water' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: slot,
        },
      });
      ids.push(id);
    }
    hour += intervalHours;
  }

  const todayStr = now.toISOString().slice(0, 10);
  await setSetting(db, 'water_notif_ids', JSON.stringify(ids));
  await setSetting(db, 'water_notif_last_day', todayStr);
}
