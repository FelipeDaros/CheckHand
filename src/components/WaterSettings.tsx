import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, rounded, spacing, typography } from '@/theme';

type Settings = {
  goalMl: number;
  notifEnabled: boolean;
  intervalH: number;
  startH: number;
  endH: number;
};

type Props = {
  initialSettings: Settings;
  onSave: (next: Settings) => Promise<void>;
};

const INTERVALS = [1, 2, 3, 4];

function hourLabel(h: number): string {
  return `${String(h).padStart(2, '0')}:00`;
}

function HourStepper({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <View style={stepperStyles.row}>
      <Text style={stepperStyles.label}>{label}</Text>
      <View style={stepperStyles.controls}>
        <TouchableOpacity
          style={stepperStyles.btn}
          onPress={() => onChange(Math.max(min, value - 1))}
        >
          <Text style={stepperStyles.btnText}>−</Text>
        </TouchableOpacity>
        <Text style={stepperStyles.value}>{hourLabel(value)}</Text>
        <TouchableOpacity
          style={stepperStyles.btn}
          onPress={() => onChange(Math.min(max, value + 1))}
        >
          <Text style={stepperStyles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const stepperStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { ...typography.bodyMd, color: colors.ink },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  btn: {
    width: 32,
    height: 32,
    borderRadius: rounded.md,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { ...typography.headingSm, color: colors.ink },
  value: { ...typography.bodyMd, color: colors.ink, width: 52, textAlign: 'center' },
});

export function WaterSettings({ initialSettings, onSave }: Props) {
  const [goalInput, setGoalInput] = useState(String(initialSettings.goalMl));
  const [notifEnabled, setNotifEnabled] = useState(initialSettings.notifEnabled);
  const [intervalH, setIntervalH] = useState(initialSettings.intervalH);
  const [startH, setStartH] = useState(initialSettings.startH);
  const [endH, setEndH] = useState(initialSettings.endH);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const goal = parseInt(goalInput, 10);
    if (!goal || goal < 100 || goal > 10000) {
      Alert.alert('Meta inválida', 'Insira um valor entre 100 e 10.000 ml.');
      return;
    }
    if (startH >= endH) {
      Alert.alert('Horário inválido', 'O horário de início deve ser anterior ao de fim.');
      return;
    }
    setSaving(true);
    await onSave({ goalMl: goal, notifEnabled, intervalH, startH, endH });
    setSaving(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meta diária</Text>
        <View style={styles.field}>
          <TextInput
            style={styles.input}
            value={goalInput}
            onChangeText={setGoalInput}
            keyboardType="numeric"
            maxLength={5}
            placeholder="2000"
            placeholderTextColor={colors.stone}
          />
          <Text style={styles.unit}>ml</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lembretes</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Ativar lembretes</Text>
          <Switch
            value={notifEnabled}
            onValueChange={setNotifEnabled}
            trackColor={{ false: colors.hairline, true: colors.primary }}
            thumbColor={colors.surfaceCard}
          />
        </View>

        {notifEnabled && (
          <>
            <Text style={styles.subLabel}>Intervalo entre lembretes</Text>
            <View style={styles.pills}>
              {INTERVALS.map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[styles.pill, intervalH === h && styles.pillActive]}
                  onPress={() => setIntervalH(h)}
                >
                  <Text style={[styles.pillText, intervalH === h && styles.pillTextActive]}>
                    {h}h
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.steppers}>
              <HourStepper label="Início" value={startH} onChange={setStartH} min={0} max={23} />
              <HourStepper label="Fim" value={endH} onChange={setEndH} min={0} max={23} />
            </View>
          </>
        )}
      </View>

      <TouchableOpacity
        style={[styles.btnSave, saving && styles.btnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.btnSaveText}>{saving ? 'Salvando…' : 'Salvar'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  section: { gap: spacing.md },
  sectionTitle: {
    ...typography.captionMd,
    color: colors.mute,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  field: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.ink,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: rounded.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  unit: { ...typography.bodyMd, color: colors.mute, width: 24 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { ...typography.bodyMd, color: colors.ink },
  subLabel: { ...typography.captionSm, color: colors.mute },
  pills: { flexDirection: 'row', gap: spacing.sm },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: rounded.full,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { ...typography.captionMd, color: colors.body },
  pillTextActive: { color: colors.surfaceCard, fontWeight: '700' },
  steppers: { gap: spacing.md },
  btnSave: {
    backgroundColor: colors.primary,
    borderRadius: rounded.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnSaveText: { ...typography.buttonMd, color: colors.surfaceCard },
});
