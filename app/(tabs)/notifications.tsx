import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { PlusIcon } from 'phosphor-react-native';
import { useScheduledNotifications } from '@/hooks/useScheduledNotifications';
import { ScheduledNotificationCard } from '@/components/ScheduledNotificationCard';
import { colors, spacing, typography } from '@/theme';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, load, activate, deactivate, remove } = useScheduledNotifications();
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([
        load(),
        new Promise<void>((resolve) => setTimeout(resolve, 1000)),
      ]).then(() => setLoading(false));
    }, [load])
  );

  function handleToggle(id: number, active: boolean) {
    if (active) {
      activate(id);
    } else {
      deactivate(id);
    }
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={48} color={colors.primary} />
          <Text style={styles.loadingText}>Carregando lembretes...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <ScheduledNotificationCard
              notification={item}
              index={index}
              onToggle={handleToggle}
              onDelete={remove}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhum lembrete criado</Text>
              <Text style={styles.emptyHint}>
                Toque no + para criar um lembrete recorrente ou por data
              </Text>
            </View>
          }
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/notification-form')}
        activeOpacity={0.8}
      >
        <PlusIcon size={28} color={colors.surfaceCard} weight="bold" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.bodySm.fontSize,
    color: colors.body,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  empty: {
    marginTop: 80,
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: typography.bodyMd.fontSize,
    fontWeight: '600',
    color: colors.ink,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: typography.bodySm.fontSize,
    color: colors.body,
    textAlign: 'center',
    lineHeight: typography.bodySm.lineHeight,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
