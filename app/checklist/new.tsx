import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ChecklistForm } from '@/components/ChecklistForm';
import { useChecklists } from '@/hooks/useChecklists';
import { useNotifications } from '@/hooks/useNotifications';
import { useSettings } from '@/hooks/useSettings';
import { updateNotificationId } from '@/repositories/checklistRepository';

export default function NewChecklistScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { add } = useChecklists();
  const { scheduleNotification } = useNotifications();
  const { notificationsEnabled } = useSettings();

  async function handleSubmit(title: string, description: string | null, dueDate: number | null) {
    const id = await add(title, description, dueDate);
    if (dueDate && notificationsEnabled) {
      const notifId = await scheduleNotification(id, title, dueDate);
      if (notifId) await updateNotificationId(db, id, notifId);
    }
    router.back();
  }

  return (
    <ChecklistForm
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      submitLabel="Criar"
    />
  );
}
