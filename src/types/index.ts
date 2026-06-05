export type Checklist = {
  id: number;
  title: string;
  description: string | null;
  due_date: number | null;
  notification_id: string | null;
  created_at: number;
  updated_at: number;
};

export type Item = {
  id: number;
  checklist_id: number;
  title: string;
  is_done: 0 | 1;
  position: number;
  due_date: number | null;
  created_at: number;
};

export type ChecklistWithProgress = Checklist & {
  total_items: number;
  done_items: number;
};
