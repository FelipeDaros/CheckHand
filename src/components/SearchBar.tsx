import { StyleSheet, TextInput, View } from 'react-native';
import { MagnifyingGlass } from 'phosphor-react-native';
import { colors, rounded, spacing, typography } from '@/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChangeText, placeholder = 'Buscar...' }: Props) {
  return (
    <View style={styles.container}>
      <MagnifyingGlass size={18} color={colors.ash} weight="regular" />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.ash}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: rounded.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    height: 40,
  },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.ink,
  },
});
