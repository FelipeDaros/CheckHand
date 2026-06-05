import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, rounded, spacing, typography } from '@/theme';

export type FilterOption = 'all' | 'active' | 'done';

const FILTERS: { key: FilterOption; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'active', label: 'Em andamento' },
  { key: 'done', label: 'Concluídas' },
];

type Props = {
  active: FilterOption;
  onChange: (filter: FilterOption) => void;
};

export function FilterTabs({ active, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map(({ key, label }) => (
        <TouchableOpacity
          key={key}
          style={[styles.tab, active === key && styles.tabActive]}
          onPress={() => onChange(key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.label, active === key && styles.labelActive]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: rounded.full,
    backgroundColor: colors.surfaceSoft,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  label: {
    ...typography.captionSm,
    color: colors.body,
  },
  labelActive: {
    color: colors.surfaceCard,
    fontWeight: '700',
  },
});
