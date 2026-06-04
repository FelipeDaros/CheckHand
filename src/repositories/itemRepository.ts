import { SQLiteDatabase } from 'expo-sqlite';
import type { Item } from '@/types';

export async function getItemsByChecklist(db: SQLiteDatabase, checklistId: number): Promise<Item[]> {
  return db.getAllAsync<Item>(
    'SELECT * FROM items WHERE checklist_id = ? ORDER BY position ASC, created_at ASC',
    checklistId,
  );
}

export async function createItem(
  db: SQLiteDatabase,
  checklistId: number,
  title: string,
  position: number,
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO items (checklist_id, title, position) VALUES (?, ?, ?)',
    checklistId,
    title,
    position,
  );
  return result.lastInsertRowId;
}

export async function toggleItem(db: SQLiteDatabase, id: number, isDone: boolean): Promise<void> {
  await db.runAsync('UPDATE items SET is_done = ? WHERE id = ?', isDone ? 1 : 0, id);
}

export async function deleteItem(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM items WHERE id = ?', id);
}
