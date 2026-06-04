import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Trash } from 'phosphor-react-native';
import { colors, rounded, spacing, typography } from '@/theme';
import { DueDateBadge } from './DueDateBadge';
import type { Item } from '@/types';

type Props = {
  item: Item;
  onToggle: (id: number, isDone: boolean) => void;
  onDelete: (id: number) => void;
};

export function ItemRow({ item, onToggle, onDelete }: Props) {
  const isDone = item.is_done === 1;

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.checkbox, isDone && styles.checkboxDone]}
        onPress={() => onToggle(item.id, !isDone)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {isDone && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={2}>
          {item.title}
        </Text>
        {item.due_date ? <DueDateBadge dueDate={item.due_date} /> : null}
      </View>

      <TouchableOpacity
        onPress={() => onDelete(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Trash size={18} color={colors.ash} weight="regular" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: rounded.xs,
    borderWidth: 2,
    borderColor: colors.stone,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onPrimary,
    lineHeight: 16,
  },
  content: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    ...typography.bodyMd,
    color: colors.ink,
  },
  titleDone: {
    color: colors.mute,
    textDecorationLine: 'line-through',
  },
});
