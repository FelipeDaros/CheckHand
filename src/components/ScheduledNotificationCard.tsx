import { useEffect } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { TrashIcon } from 'phosphor-react-native';
import { ScheduledNotification, IntervalConfig, WeeklyConfig, DateConfig } from '@/types';
import { colors, spacing, typography } from '@/theme';
import { AnimatedToggle } from '@/components/AnimatedToggle';

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function describeSchedule(n: ScheduledNotification): string {
  if (n.type === 'interval') {
    const { hours } = n.config as IntervalConfig;
    return `A cada ${hours}h`;
  }
  if (n.type === 'weekly') {
    const { weekdays, hour, minute } = n.config as WeeklyConfig;
    const days = weekdays.map((w) => WEEKDAY_NAMES[w - 1]).join(', ');
    return `Toda ${days} às ${pad(hour)}:${pad(minute)}`;
  }
  if (n.type === 'date') {
    const { timestamp } = n.config as DateConfig;
    const d = new Date(timestamp * 1000);
    return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }
  return '';
}

type Props = {
  notification: ScheduledNotification;
  index: number;
  onToggle: (id: number, active: boolean) => void;
  onDelete: (id: number) => void;
};

export function ScheduledNotificationCard({ notification, index, onToggle, onDelete }: Props) {
  const translateX = useSharedValue(400);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 80;
    translateX.value = withDelay(delay, withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 220 }));
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  function handleDelete() {
    translateX.value = withTiming(400, { duration: 600 });
    opacity.value = withTiming(0, { duration: 600 }, () => {
      scheduleOnRN(() => onDelete(notification.id));
    });
  }

  function confirmDelete() {
    Alert.alert(
      'Excluir lembrete',
      `Deseja excluir "${notification.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: handleDelete },
      ]
    );
  }

  return (
    <Animated.View style={[styles.card, !notification.is_active && styles.cardInactive, cardStyle]}>
      <Animated.View style={styles.content}>
        <Text style={[styles.title, !notification.is_active && styles.inactive]}>
          {notification.title}
        </Text>
        <Text style={styles.schedule}>{describeSchedule(notification)}</Text>
        {notification.type === 'date' && !notification.is_active && (
          <Text style={styles.fired}>Disparado</Text>
        )}
      </Animated.View>
      <Animated.View style={styles.actions}>
        <AnimatedToggle
          value={notification.is_active}
          onValueChange={(val) => onToggle(notification.id, val)}
        />
        <TouchableOpacity onLongPress={confirmDelete} style={styles.deleteBtn}>
          <TrashIcon size={20} color={colors.mute} weight="regular" />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 6,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardInactive: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: typography.bodyMd.fontSize,
    fontWeight: '600',
    color: colors.ink,
  },
  inactive: {
    color: colors.mute,
  },
  schedule: {
    fontSize: typography.bodySm.fontSize,
    color: colors.body,
  },
  fired: {
    fontSize: typography.bodySm.fontSize,
    color: colors.mute,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deleteBtn: {
    padding: spacing.xs,
  },
});
