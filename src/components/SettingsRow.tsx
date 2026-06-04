import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

type Props = {
  label: string;
  description?: string;
  right?: ReactNode;
};

export function SettingsRow({ label, description, right }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.captionMd,
    color: colors.mute,
    paddingHorizontal: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.surfaceCard,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.hairline,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
    gap: spacing.md,
    minHeight: 52,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
  label: {
    ...typography.bodyMd,
    color: colors.ink,
  },
  description: {
    ...typography.captionSm,
    color: colors.mute,
  },
  right: {
    flexShrink: 0,
  },
});
