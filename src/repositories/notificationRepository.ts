import * as Notifications from 'expo-notifications';

export async function scheduleChecklistNotification(
  checklistId: number,
  title: string,
  dueDateUnix: number,
): Promise<string | null> {
  const triggerDate = new Date(dueDateUnix * 1000);
  triggerDate.setHours(9, 0, 0, 0);

  if (triggerDate <= new Date()) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: 'Prazo hoje!',
      data: { checklistId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

export async function cancelChecklistNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function cancelAllChecklistNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
