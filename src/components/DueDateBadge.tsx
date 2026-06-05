import { StyleSheet, Text, View } from 'react-native';
import { CalendarBlank } from 'phosphor-react-native';
import { colors, rounded, spacing, typography } from '@/theme';
import { formatDate, isOverdue, isSoon } from '@/utils/date';

type Props = {
  dueDate: number;
};

export function DueDateBadge({ dueDate }: Props) {
  const overdue = isOverdue(dueDate);
  const soon = !overdue && isSoon(dueDate);

  const bg = overdue ? colors.accentRedSoft : soon ? colors.accentBlueSoft : colors.surfaceSoft;
  const fg = overdue ? colors.accentRed : soon ? colors.primary : colors.mute;

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <CalendarBlank size={11} color={fg} weight="regular" />
      <Text style={[styles.text, { color: fg }]}>{formatDate(dueDate)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: rounded.xs,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.captionSm,
  },
});
