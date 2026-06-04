import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import {
  getAllChecklists,
  createChecklist,
  updateChecklist,
  deleteChecklist,
} from '@/repositories/checklistRepository';
import type { ChecklistWithProgress } from '@/types';
import type { FilterOption } from '@/components/FilterTabs';

export function useChecklists() {
  const db = useSQLiteContext();
  const [checklists, setChecklists] = useState<ChecklistWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');

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

  const filtered = useMemo(() => {
    let result = checklists;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((c) => c.title.toLowerCase().includes(q));
    }
    if (filter === 'active') {
      result = result.filter((c) => c.total_items === 0 || c.done_items < c.total_items);
    } else if (filter === 'done') {
      result = result.filter((c) => c.total_items > 0 && c.done_items === c.total_items);
    }
    return result;
  }, [checklists, query, filter]);

  const add = useCallback(
    async (title: string, description?: string | null, dueDate?: number | null) => {
      await createChecklist(db, title, description, dueDate);
      await load();
    },
    [db, load],
  );

  const update = useCallback(
    async (id: number, title: string, description?: string | null, dueDate?: number | null) => {
      await updateChecklist(db, id, title, description, dueDate);
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

  return { checklists: filtered, loading, query, setQuery, filter, setFilter, add, update, remove, refresh: load };
}
