import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Configurações — em breve</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  placeholder: {
    ...typography.bodyMd,
    color: colors.mute,
  },
});
