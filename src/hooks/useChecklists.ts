import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import {
  getAllChecklists,
  createChecklist,
  updateChecklist,
  deleteChecklist,
} from '@/repositories/checklistRepository';
import type { ChecklistWithProgress } from '@/types';

export function useChecklists() {
  const db = useSQLiteContext();
  const [checklists, setChecklists] = useState<ChecklistWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getAllChecklists(db);
    setChecklists(data);
    setLoading(false);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const add = useCallback(
    async (title: string, description?: string | null) => {
      await createChecklist(db, title, description);
      await load();
    },
    [db, load],
  );

  const update = useCallback(
    async (id: number, title: string, description?: string | null) => {
      await updateChecklist(db, id, title, description);
      await load();
    },
    [db, load],
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteChecklist(db, id);
      await load();
    },
    [db, load],
  );

  return { checklists, loading, add, update, remove, refresh: load };
}
