import { SQLiteDatabase } from 'expo-sqlite';
import type { ChecklistWithProgress } from '@/types';

export async function getAllChecklists(db: SQLiteDatabase): Promise<ChecklistWithProgress[]> {
  return db.getAllAsync<ChecklistWithProgress>(`
    SELECT c.*,
      COUNT(i.id) AS total_items,
      SUM(CASE WHEN i.is_done = 1 THEN 1 ELSE 0 END) AS done_items
    FROM checklists c
    LEFT JOIN items i ON i.checklist_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `);
}

export async function getChecklistById(db: SQLiteDatabase, id: number): Promise<ChecklistWithProgress | null> {
  return db.getFirstAsync<ChecklistWithProgress>(`
    SELECT c.*,
      COUNT(i.id) AS total_items,
      SUM(CASE WHEN i.is_done = 1 THEN 1 ELSE 0 END) AS done_items
    FROM checklists c
    LEFT JOIN items i ON i.checklist_id = c.id
    WHERE c.id = ?
    GROUP BY c.id
  `, id);
}

export async function createChecklist(
  db: SQLiteDatabase,
  title: string,
  description?: string | null,
  dueDate?: number | null,
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO checklists (title, description, due_date) VALUES (?, ?, ?)',
    title,
    description ?? null,
    dueDate ?? null,
  );
  return result.lastInsertRowId;
}

export async function updateChecklist(
  db: SQLiteDatabase,
  id: number,
  title: string,
  description?: string | null,
  dueDate?: number | null,
  notificationId?: string | null,
): Promise<void> {
  await db.runAsync(
    'UPDATE checklists SET title = ?, description = ?, due_date = ?, notification_id = ?, updated_at = unixepoch() WHERE id = ?',
    title,
    description ?? null,
    dueDate ?? null,
    notificationId ?? null,
    id,
  );
}

export async function updateNotificationId(
  db: SQLiteDatabase,
  id: number,
  notificationId: string | null,
): Promise<void> {
  await db.runAsync(
    'UPDATE checklists SET notification_id = ? WHERE id = ?',
    notificationId,
    id,
  );
}

export async function deleteChecklist(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM checklists WHERE id = ?', id);
}
