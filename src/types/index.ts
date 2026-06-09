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

export type ScheduledNotificationType = 'interval' | 'weekly' | 'date';

export type IntervalConfig = { hours: number };
export type WeeklyConfig = { weekdays: number[]; hour: number; minute: number };
export type DateConfig = { timestamp: number };
export type ScheduleConfig = IntervalConfig | WeeklyConfig | DateConfig;

export type ScheduledNotification = {
  id: number;
  title: string;
  body: string;
  type: ScheduledNotificationType;
  config: ScheduleConfig;
  is_active: boolean;
  notification_ids: string[];
  created_at: number;
};
