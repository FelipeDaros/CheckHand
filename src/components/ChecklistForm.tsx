import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CalendarBlank, X } from 'phosphor-react-native';
import { colors, rounded, spacing, typography } from '@/theme';
import { dateToUnix, formatDate } from '@/utils/date';

type Props = {
  initialTitle?: string;
  initialDescription?: string;
  initialDueDate?: number | null;
  onSubmit: (title: string, description: string | null, dueDate: number | null) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
};

export function ChecklistForm({
  initialTitle = '',
  initialDescription = '',
  initialDueDate = null,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [dueDate, setDueDate] = useState<number | null>(initialDueDate);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!title.trim()) {
      setError('O título é obrigatório.');
      return;
    }
    setSaving(true);
    setError('');
    await onSubmit(title.trim(), description.trim() || null, dueDate);
    setSaving(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.field}>
        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          value={title}
          onChangeText={(v) => { setTitle(v); setError(''); }}
          placeholder="Ex: Lista de compras"
          placeholderTextColor={colors.stone}
          autoFocus
          maxLength={80}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Opcional"
          placeholderTextColor={colors.stone}
          multiline
          numberOfLines={3}
          maxLength={200}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Prazo</Text>
        {dueDate ? (
          <View style={styles.dateRow}>
            <View style={styles.datePill}>
              <CalendarBlank size={14} color={colors.ink} weight="regular" />
              <Text style={styles.dateText}>{formatDate(dueDate)}</Text>
            </View>
            <TouchableOpacity onPress={() => setDueDate(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={16} color={colors.ash} weight="regular" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
            <CalendarBlank size={16} color={colors.mute} weight="regular" />
            <Text style={styles.dateBtnText}>Definir prazo</Text>
          </TouchableOpacity>
        )}
      </View>

      {showPicker && (
        <DateTimePicker
          value={dueDate ? new Date(dueDate * 1000) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(event, date) => {
            if (Platform.OS === 'android') setShowPicker(false);
            if (event.type === 'set' && date) setDueDate(dateToUnix(date));
          }}
        />
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
          <Text style={styles.btnCancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnSubmit, saving && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.surfaceCard} />
          ) : (
            <Text style={styles.btnSubmitText}>{submitLabel}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.captionMd,
    color: colors.ink,
  },
  input: {
    ...typography.bodyMd,
    color: colors.ink,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: rounded.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.accentRed,
  },
  error: {
    ...typography.captionSm,
    color: colors.accentRed,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: rounded.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  dateBtnText: {
    ...typography.bodyMd,
    color: colors.mute,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: rounded.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dateText: {
    ...typography.bodyMd,
    color: colors.ink,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  btnCancel: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
    borderRadius: rounded.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  btnCancelText: {
    ...typography.buttonMd,
    color: colors.ink,
  },
  btnSubmit: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: rounded.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  btnSubmitText: {
    ...typography.buttonMd,
    color: colors.surfaceCard,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
