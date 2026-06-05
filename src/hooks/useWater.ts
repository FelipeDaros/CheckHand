import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import {
  getTodayTotal,
  addIntake,
  clearToday,
  getHistory,
  scheduleWaterNotifications,
  cancelWaterNotifications,
  type DayHistory,
} from '@/repositories/waterRepository';
import { getSetting, setSetting } from '@/repositories/settingsRepository';

const DEFAULTS = {
  goalMl: 2000,
  intervalH: 2,
  startH: 8,
  endH: 22,
};

type Settings = {
  goalMl: number;
  notifEnabled: boolean;
  intervalH: number;
  startH: number;
  endH: number;
};

async function loadSettingsFromDb(db: ReturnType<typeof useSQLiteContext>): Promise<Settings> {
  const [goalStr, notifStr, intervalStr, startStr, endStr] = await Promise.all([
    getSetting(db, 'water_goal_ml'),
    getSetting(db, 'water_notif_enabled'),
    getSetting(db, 'water_notif_interval_h'),
    getSetting(db, 'water_notif_start_h'),
    getSetting(db, 'water_notif_end_h'),
  ]);
  return {
    goalMl: goalStr ? parseInt(goalStr, 10) : DEFAULTS.goalMl,
    notifEnabled: notifStr !== '0',
    intervalH: intervalStr ? parseInt(intervalStr, 10) : DEFAULTS.intervalH,
    startH: startStr ? parseInt(startStr, 10) : DEFAULTS.startH,
    endH: endStr ? parseInt(endStr, 10) : DEFAULTS.endH,
  };
}

export function useWater() {
  const db = useSQLiteContext();
  const [todayMl, setTodayMl] = useState(0);
  const [history, setHistory] = useState<DayHistory[]>([]);
  const [settings, setSettings] = useState<Settings>({
    goalMl: DEFAULTS.goalMl,
    notifEnabled: true,
    intervalH: DEFAULTS.intervalH,
    startH: DEFAULTS.startH,
    endH: DEFAULTS.endH,
  });
  const [loading, setLoading] = useState(true);

  const loadToday = useCallback(async (goalMl: number): Promise<number> => {
    const [total, hist] = await Promise.all([
      getTodayTotal(db),
      getHistory(db, goalMl),
    ]);
    setTodayMl(total);
    setHistory(hist);
    return total;
  }, [db]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const s = await loadSettingsFromDb(db);
      setSettings(s);

      const [total, hist] = await Promise.all([
        getTodayTotal(db),
        getHistory(db, s.goalMl),
      ]);
      setTodayMl(total);
      setHistory(hist);

      if (s.notifEnabled && total < s.goalMl) {
        const lastDay = (await getSetting(db, 'water_notif_last_day')) ?? '';
        const today = new Date().toISOString().slice(0, 10);
        if (lastDay !== today) {
          await scheduleWaterNotifications(db, s.startH, s.endH, s.intervalH);
        }
      }

      setLoading(false);
    }
    init();
  }, [db]);

  const add = useCallback(
    async (ml: number) => {
      await addIntake(db, ml);
      const newTotal = await loadToday(settings.goalMl);
      if (newTotal >= settings.goalMl && settings.notifEnabled) {
        await cancelWaterNotifications(db);
      }
    },
    [db, loadToday, settings.goalMl, settings.notifEnabled],
  );

  const reset = useCallback(async () => {
    await clearToday(db);
    await loadToday(settings.goalMl);
    if (settings.notifEnabled) {
      await scheduleWaterNotifications(db, settings.startH, settings.endH, settings.intervalH);
    }
  }, [db, loadToday, settings]);

  const saveSettings = useCallback(
    async (next: Settings) => {
      await Promise.all([
        setSetting(db, 'water_goal_ml', String(next.goalMl)),
        setSetting(db, 'water_notif_enabled', next.notifEnabled ? '1' : '0'),
        setSetting(db, 'water_notif_interval_h', String(next.intervalH)),
        setSetting(db, 'water_notif_start_h', String(next.startH)),
        setSetting(db, 'water_notif_end_h', String(next.endH)),
      ]);
      setSettings(next);

      if (next.notifEnabled) {
        await scheduleWaterNotifications(db, next.startH, next.endH, next.intervalH);
      } else {
        await cancelWaterNotifications(db);
      }
    },
    [db],
  );

  const progress = settings.goalMl > 0 ? Math.min(todayMl / settings.goalMl, 1) : 0;

  return {
    todayMl,
    goalMl: settings.goalMl,
    progress,
    isComplete: todayMl >= settings.goalMl,
    history,
    settings,
    loading,
    add,
    reset,
    saveSettings,
  };
}
