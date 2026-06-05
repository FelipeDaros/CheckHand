import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ChecklistForm } from '@/components/ChecklistForm';
import { useChecklists } from '@/hooks/useChecklists';
import { useNotifications } from '@/hooks/useNotifications';
import { useSettings } from '@/hooks/useSettings';
import { getChecklistById } from '@/repositories/checklistRepository';
import { colors } from '@/theme';
import type { ChecklistWithProgress } from '@/types';

export default function EditChecklistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const { update } = useChecklists();
  const { scheduleNotification, cancelNotification } = useNotifications();
  const { notificationsEnabled } = useSettings();
  const [checklist, setChecklist] = useState<ChecklistWithProgress | null>(null);

  useEffect(() => {
    getChecklistById(db, Number(id)).then(setChecklist);
  }, [db, id]);

  async function handleSubmit(title: string, description: string | null, dueDate: number | null) {
    const prevDueDate = checklist!.due_date;
    const prevNotifId = checklist!.notification_id;
    let newNotifId: string | null = prevNotifId;

    const dueDateChanged = dueDate !== prevDueDate;

    if (dueDateChanged && prevNotifId) {
      await cancelNotification(prevNotifId);
      newNotifId = null;
    }

    if (dueDate && dueDateChanged && notificationsEnabled) {
      newNotifId = await scheduleNotification(Number(id), title, dueDate);
    } else if (!dueDate) {
      newNotifId = null;
    }

    await update(Number(id), title, description, dueDate, newNotifId);
    router.back();
  }

  if (!checklist) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ChecklistForm
      initialTitle={checklist.title}
      initialDescription={checklist.description ?? ''}
      initialDueDate={checklist.due_date}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      submitLabel="Salvar"
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
  },
});
