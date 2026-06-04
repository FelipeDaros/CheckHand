import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useSQLiteContext } from 'expo-sqlite';
import { SettingsRow, SettingsSection } from '@/components/SettingsRow';
import { useSettings } from '@/hooks/useSettings';
import { colors, spacing, typography } from '@/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { pinEnabled, loading, togglePin } = useSettings();

  function handlePinToggle(value: boolean) {
    if (value) {
      router.push('/pin?mode=create');
    } else {
      router.push('/pin?mode=disable');
    }
  }

  function handleClearData() {
    Alert.alert(
      'Limpar todos os dados',
      'Esta ação é irreversível. Todas as checklists, itens e configurações serão apagados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            await db.execAsync('DELETE FROM items; DELETE FROM checklists; DELETE FROM app_settings;');
            Alert.alert('Concluído', 'Todos os dados foram removidos.');
          },
        },
      ],
    );
  }

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SettingsSection title="Segurança">
        <SettingsRow
          label="Usar PIN"
          description="Proteger o app com um PIN de 4 dígitos"
          right={
            <Switch
              value={pinEnabled}
              onValueChange={handlePinToggle}
              disabled={loading}
              trackColor={{ false: colors.hairline, true: colors.primary }}
              thumbColor={colors.surfaceCard}
            />
          }
        />
        {pinEnabled && (
          <TouchableOpacity onPress={() => router.push('/pin?mode=change')}>
            <SettingsRow label="Alterar PIN" />
          </TouchableOpacity>
        )}
      </SettingsSection>

      <SettingsSection title="Sobre">
        <SettingsRow label="Versão" right={<Text style={styles.value}>{version}</Text>} />
      </SettingsSection>

      <SettingsSection title="Dados">
        <TouchableOpacity onPress={handleClearData}>
          <SettingsRow label="Limpar todos os dados" description="Remove checklists, itens e configurações" />
        </TouchableOpacity>
      </SettingsSection>

      <View style={styles.footer}>
        <Text style={styles.footerText}>CheckHand v{version}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },
  value: {
    ...typography.bodyMd,
    color: colors.mute,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: {
    ...typography.captionSm,
    color: colors.stone,
  },
});
