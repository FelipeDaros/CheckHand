import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import {
  getItemsByChecklist,
  createItem,
  toggleItem,
  deleteItem,
} from '@/repositories/itemRepository';
import type { Item } from '@/types';

export function useItems(checklistId: number) {
  const db = useSQLiteContext();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getItemsByChecklist(db, checklistId);
    setItems(data);
    setLoading(false);
  }, [db, checklistId]);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(
    async (title: string) => {
      const position = items.length;
      await createItem(db, checklistId, title, position);
      await load();
    },
    [db, checklistId, items.length, load],
  );

  const toggle = useCallback(
    async (id: number, isDone: boolean) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_done: isDone ? 1 : 0 } : item)),
      );
      await toggleItem(db, id, isDone);
    },
    [db],
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteItem(db, id);
      await load();
    },
    [db, load],
  );

  return { items, loading, add, toggle, remove, refresh: load };
}
