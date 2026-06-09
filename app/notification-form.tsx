import { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useScheduledNotifications } from '@/hooks/useScheduledNotifications';
import { ScheduledNotificationType, IntervalConfig, WeeklyConfig, DateConfig } from '@/types';
import { colors, spacing, typography } from '@/theme';

const INTERVAL_OPTIONS = [1, 2, 4, 6, 8, 12, 24];
const WEEKDAYS = [
  { label: 'Dom', value: 1 },
  { label: 'Seg', value: 2 },
  { label: 'Ter', value: 3 },
  { label: 'Qua', value: 4 },
  { label: 'Qui', value: 5 },
  { label: 'Sex', value: 6 },
  { label: 'Sáb', value: 7 },
];

export default function NotificationFormScreen() {
  const router = useRouter();
  const { create } = useScheduledNotifications();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<ScheduledNotificationType>('interval');

  // Interval
  const [intervalHours, setIntervalHours] = useState(4);

  // Weekly
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [weeklyTime, setWeeklyTime] = useState(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [showWeeklyTimePicker, setShowWeeklyTimePicker] = useState(false);

  // Date
  const [dateValue, setDateValue] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function openAndroidDate() {
    DateTimePickerAndroid.open({
      value: dateValue,
      mode: 'date',
      minimumDate: new Date(),
      onChange: (_, date) => {
        if (!date) return;
        const merged = new Date(date);
        merged.setHours(dateValue.getHours(), dateValue.getMinutes());
        setDateValue(merged);
        DateTimePickerAndroid.open({
          value: merged,
          mode: 'time',
          is24Hour: true,
          onChange: (__, time) => {
            if (!time) return;
            setDateValue(time);
          },
        });
      },
    });
  }

  function openAndroidWeeklyTime() {
    DateTimePickerAndroid.open({
      value: weeklyTime,
      mode: 'time',
      is24Hour: true,
      onChange: (_, time) => {
        if (time) setWeeklyTime(time);
      },
    });
  }

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Título obrigatório', 'Informe um título para o lembrete.');
      return;
    }

    let config: IntervalConfig | WeeklyConfig | DateConfig;

    if (type === 'interval') {
      config = { hours: intervalHours };
    } else if (type === 'weekly') {
      if (selectedDays.length === 0) {
        Alert.alert('Selecione os dias', 'Escolha ao menos um dia da semana.');
        return;
      }
      config = {
        weekdays: selectedDays,
        hour: weeklyTime.getHours(),
        minute: weeklyTime.getMinutes(),
      };
    } else {
      const now = new Date();
      if (dateValue <= now) {
        Alert.alert('Data inválida', 'Escolha uma data e hora no futuro.');
        return;
      }
      config = { timestamp: Math.floor(dateValue.getTime() / 1000) };
    }

    await create({
      title: title.trim(),
      body: body.trim() || 'Lembrete!',
      type,
      config,
    });

    router.back();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Beber água"
        placeholderTextColor={colors.mute}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Mensagem (opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Lembrete!"
        placeholderTextColor={colors.mute}
        value={body}
        onChangeText={setBody}
      />

      <Text style={styles.label}>Tipo de agendamento</Text>
      <View style={styles.typeRow}>
        {(['interval', 'weekly', 'date'] as ScheduledNotificationType[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.typeBtn, type === t && styles.typeBtnActive]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
              {t === 'interval' ? 'Intervalo' : t === 'weekly' ? 'Semanal' : 'Data'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {type === 'interval' && (
        <View>
          <Text style={styles.label}>A cada quantas horas?</Text>
          <View style={styles.chipRow}>
            {INTERVAL_OPTIONS.map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.chip, intervalHours === h && styles.chipActive]}
                onPress={() => setIntervalHours(h)}
              >
                <Text style={[styles.chipText, intervalHours === h && styles.chipTextActive]}>
                  {h}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {type === 'weekly' && (
        <View>
          <Text style={styles.label}>Dias da semana</Text>
          <View style={styles.chipRow}>
            {WEEKDAYS.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                style={[styles.chip, selectedDays.includes(value) && styles.chipActive]}
                onPress={() => toggleDay(value)}
              >
                <Text style={[styles.chipText, selectedDays.includes(value) && styles.chipTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Horário</Text>
          {Platform.OS === 'android' ? (
            <TouchableOpacity style={styles.dateButton} onPress={openAndroidWeeklyTime}>
              <Text style={styles.dateButtonText}>
                {String(weeklyTime.getHours()).padStart(2, '0')}:
                {String(weeklyTime.getMinutes()).padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowWeeklyTimePicker((v) => !v)}
              >
                <Text style={styles.dateButtonText}>
                  {String(weeklyTime.getHours()).padStart(2, '0')}:
                  {String(weeklyTime.getMinutes()).padStart(2, '0')}
                </Text>
              </TouchableOpacity>
              {showWeeklyTimePicker && (
                <DateTimePicker
                  value={weeklyTime}
                  mode="time"
                  display="spinner"
                  onChange={(_, d) => { if (d) setWeeklyTime(d); }}
                />
              )}
            </>
          )}
        </View>
      )}

      {type === 'date' && (
        <View>
          <Text style={styles.label}>Data e hora</Text>
          {Platform.OS === 'android' ? (
            <TouchableOpacity style={styles.dateButton} onPress={openAndroidDate}>
              <Text style={styles.dateButtonText}>
                {dateValue.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => { setShowDatePicker((v) => !v); setShowTimePicker(false); }}
              >
                <Text style={styles.dateButtonText}>
                  {dateValue.toLocaleDateString('pt-BR')}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dateValue}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={(_, d) => { if (d) setDateValue(d); }}
                />
              )}
              <TouchableOpacity
                style={[styles.dateButton, { marginTop: spacing.xs }]}
                onPress={() => { setShowTimePicker((v) => !v); setShowDatePicker(false); }}
              >
                <Text style={styles.dateButtonText}>
                  {dateValue.toLocaleTimeString('pt-BR', { timeStyle: 'short' })}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={dateValue}
                  mode="time"
                  display="spinner"
                  onChange={(_, d) => { if (d) setDateValue(d); }}
                />
              )}
            </>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
        <Text style={styles.saveBtnText}>Salvar lembrete</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xs,
    paddingBottom: 40,
  },
  label: {
    fontSize: typography.bodySm.fontSize,
    fontWeight: '600',
    color: colors.body,
    marginBottom: 4,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 6,
    padding: spacing.lg,
    fontSize: typography.bodyMd.fontSize,
    color: colors.ink,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.hairline,
  },
  typeBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  typeBtnText: {
    fontSize: typography.bodySm.fontSize,
    fontWeight: '600',
    color: colors.body,
  },
  typeBtnTextActive: {
    color: colors.surfaceCard,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 9999,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: colors.hairline,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: typography.bodySm.fontSize,
    color: colors.body,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.surfaceCard,
  },
  dateButton: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 6,
    padding: spacing.lg,
  },
  dateButtonText: {
    fontSize: typography.bodyMd.fontSize,
    color: colors.ink,
  },
  saveBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 6,
    padding: spacing.lg,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: typography.bodyMd.fontSize,
    fontWeight: '700',
    color: colors.surfaceCard,
  },
});
