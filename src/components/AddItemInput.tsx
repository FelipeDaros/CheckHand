import { useState } from 'react';
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { PlusCircle } from 'phosphor-react-native';
import { colors, rounded, spacing, typography } from '@/theme';

type Props = {
  onAdd: (title: string) => Promise<void>;
};

export function AddItemInput({ onAdd }: Props) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const title = text.trim();
    if (!title || submitting) return;
    setSubmitting(true);
    await onAdd(title);
    setText('');
    setSubmitting(false);
  }

  const canSubmit = text.trim().length > 0 && !submitting;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Novo item..."
        placeholderTextColor={colors.ash}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        blurOnSubmit={false}
      />
      <TouchableOpacity onPress={handleSubmit} disabled={!canSubmit}>
        <PlusCircle
          size={32}
          color={canSubmit ? colors.primary : colors.stone}
          weight="fill"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.surfaceCard,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  input: {
    flex: 1,
    height: 40,
    ...typography.bodyMd,
    color: colors.ink,
    backgroundColor: colors.canvas,
    borderRadius: rounded.md,
    paddingHorizontal: spacing.md,
  },
});
