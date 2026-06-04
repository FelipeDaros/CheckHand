import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, rounded, spacing, typography } from '@/theme';
import { DueDateBadge } from './DueDateBadge';
import type { ChecklistWithProgress } from '@/types';

type Props = {
  checklist: ChecklistWithProgress;
  onPress: () => void;
  onLongPress?: () => void;
};

export function ChecklistCard({ checklist, onPress, onLongPress }: Props) {
  const { title, description, total_items, done_items, due_date } = checklist;
  const progress = total_items > 0 ? done_items / total_items : 0;
  const isCompleted = total_items > 0 && done_items === total_items;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} onLongPress={onLongPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {total_items > 0 && (
          <Text style={[styles.count, isCompleted && styles.countDone]}>
            {done_items}/{total_items}
          </Text>
        )}
      </View>

      {description ? (
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
      ) : null}

      {due_date ? <DueDateBadge dueDate={due_date} /> : null}

      {total_items > 0 && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: rounded.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    ...typography.headingSm,
    color: colors.ink,
    flex: 1,
  },
  count: {
    ...typography.captionMd,
    color: colors.mute,
  },
  countDone: {
    color: colors.accentGreen,
  },
  description: {
    ...typography.bodySm,
    color: colors.body,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.surfaceSoft,
    borderRadius: rounded.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: rounded.xs,
  },
});
