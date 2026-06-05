import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useWater } from '@/hooks/useWater';
import { WaterGlass } from '@/components/WaterGlass';
import { colors, rounded, spacing, typography } from '@/theme';
import type { DayHistory } from '@/repositories/waterRepository';


const DAYS_PT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const WEEK_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// ─── Histórico (lista de dias anteriores) ────────────────────────────────────

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
  return `${DAYS_PT[date.getDay()]}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

function HistoryRow({ day, goalMl }: { day: DayHistory; goalMl: number }) {
  const pct = Math.min(1, day.totalMl / goalMl);
  return (
    <View style={histStyles.row}>
      <Text style={histStyles.dateLabel}>{formatDate(day.date)}</Text>
      <View style={histStyles.barTrack}>
        <View style={[histStyles.barFill, { width: `${Math.round(pct * 100)}%` as any }]} />
      </View>
      <Text style={[histStyles.amount, day.metGoal && histStyles.amountMet]}>
        {day.totalMl.toLocaleString('pt-BR')} ml
      </Text>
    </View>
  );
}

const histStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dateLabel: {
    ...typography.captionMd,
    color: colors.mute,
    width: 72,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.hairline,
    borderRadius: rounded.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: rounded.full,
  },
  amount: {
    ...typography.captionMd,
    color: colors.mute,
    width: 68,
    textAlign: 'right',
  },
  amountMet: {
    color: colors.primary,
    fontWeight: '700',
  },
});

// ─── Ofensiva + dias da semana ────────────────────────────────────────────────

type WeekDay = {
  date: string;
  label: string;
  dayNum: number;
  totalMl: number;
  isToday: boolean;
};

function buildWeekDays(history: DayHistory[], todayMl: number): WeekDay[] {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const histMap = new Map(history.map((h) => [h.date, h.totalMl]));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const isToday = dateStr === todayStr;
    return {
      date: dateStr,
      label: WEEK_LABELS[d.getDay()],
      dayNum: d.getDate(),
      totalMl: isToday ? todayMl : (histMap.get(dateStr) ?? 0),
      isToday,
    };
  });
}

function computeStreak(history: DayHistory[], todayMl: number): number {
  const today = new Date();
  const histMap = new Map(history.map((h) => [h.date, h.totalMl]));
  histMap.set(today.toISOString().slice(0, 10), todayMl);
  let streak = 0;
  const check = new Date(today);
  while (streak <= 365) {
    const dateStr = check.toISOString().slice(0, 10);
    if ((histMap.get(dateStr) ?? 0) > 0) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function WeekStrip({ history, todayMl }: { history: DayHistory[]; todayMl: number }) {
  const days = buildWeekDays(history, todayMl);
  const streak = computeStreak(history, todayMl);
  return (
    <View style={weekStyles.container}>
      <View style={weekStyles.daysRow}>
        {days.map((day) => {
          const active = day.totalMl > 0;
          return (
            <View key={day.date} style={weekStyles.dayCol}>
              <Text style={weekStyles.dayLabel}>{day.label}</Text>
              <View
                style={[
                  weekStyles.bubble,
                  active ? weekStyles.bubbleActive : weekStyles.bubbleInactive,
                ]}
              >
                <Text
                  style={[
                    weekStyles.dayNum,
                    active ? weekStyles.dayNumActive : weekStyles.dayNumInactive,
                  ]}
                >
                  {day.dayNum}
                </Text>
              </View>
              {day.isToday && <View style={weekStyles.todayDot} />}
            </View>
          );
        })}
      </View>
      {streak > 0 && (
        <View style={weekStyles.streakRow}>
          <Text style={weekStyles.flame}>🔥</Text>
          <Text style={weekStyles.streakText}>
            {streak} {streak === 1 ? 'dia' : 'dias'} seguido(s)
          </Text>
        </View>
      )}
    </View>
  );
}

const weekStyles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.sm,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  flame: {
    fontSize: 18,
  },
  streakText: {
    ...typography.bodyMd,
    color: colors.ink,
    fontWeight: '700',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    gap: 4,
  },
  dayLabel: {
    fontSize: 11,
    color: colors.mute,
    fontWeight: '500',
  },
  bubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleActive: {
    backgroundColor: colors.primary,
  },
  bubbleInactive: {
    backgroundColor: colors.surfaceSoft,
  },
  dayNum: {
    fontSize: 13,
    fontWeight: '600',
  },
  dayNumActive: {
    color: colors.surfaceCard,
  },
  dayNumInactive: {
    color: colors.ash,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function WaterScreen() {
  const { todayMl, goalMl, progress, isComplete, history, settings, loading, add, reset } = useWater();
  const quickAmounts = [settings.quick1, settings.quick2];
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  function handleAddCustom() {
    const ml = parseInt(customInput, 10);
    if (!ml || ml <= 0 || ml > 5000) {
      Alert.alert('Quantidade inválida', 'Insira um valor entre 1 e 5.000 ml.');
      return;
    }
    add(ml);
    setCustomInput('');
    setShowCustom(false);
  }

  function handleReset() {
    Alert.alert(
      'Zerar dia',
      'Tem certeza que deseja remover todos os registros de hoje?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Zerar', style: 'destructive', onPress: () => reset() },
      ],
    );
  }

  const percentLabel = `${Math.round(progress * 100)}%`;
  const totalLabel = `${todayMl.toLocaleString('pt-BR')} / ${goalMl.toLocaleString('pt-BR')} ml`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Glass */}
      <View style={styles.glassArea}>
        <WaterGlass progress={progress} />
        {isComplete && <Text style={styles.completeMsg}>Meta atingida! 🎉</Text>}
      </View>

      {/* Progress text */}
      <View style={styles.progressArea}>
        <Text style={styles.percent}>{percentLabel}</Text>
        <Text style={styles.total}>{totalLabel}</Text>
      </View>

      {/* Quick add buttons */}
      <View style={styles.quickRow}>
        {quickAmounts.map((ml) => (
          <TouchableOpacity
            key={ml}
            style={styles.quickBtn}
            onPress={() => add(ml)}
            disabled={loading}
          >
            <Text style={styles.quickBtnText}>+{ml} ml</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.quickBtn, styles.quickBtnOutline]}
          onPress={() => setShowCustom((v) => !v)}
          disabled={loading}
        >
          <Text style={[styles.quickBtnText, styles.quickBtnOutlineText]}>Outro</Text>
        </TouchableOpacity>
      </View>

      {/* Custom amount input */}
      {showCustom && (
        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            value={customInput}
            onChangeText={setCustomInput}
            keyboardType="numeric"
            placeholder="Quantidade em ml"
            placeholderTextColor={colors.stone}
            maxLength={4}
            autoFocus
          />
          <TouchableOpacity style={styles.customConfirm} onPress={handleAddCustom}>
            <Text style={styles.customConfirmText}>Adicionar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reset */}
      {todayMl > 0 && (
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetBtnText}>Zerar dia</Text>
        </TouchableOpacity>
      )}

      {/* Ofensiva + dias da semana */}
      <WeekStrip history={history} todayMl={todayMl} />

      {/* Histórico de dias anteriores */}
      {history.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Histórico</Text>
          {history.map((day) => (
            <HistoryRow key={day.date} day={day} goalMl={goalMl} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  glassArea: {
    alignItems: 'center',
    gap: spacing.md,
  },
  completeMsg: {
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: '700',
  },
  progressArea: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  percent: {
    ...typography.headingLg,
    color: colors.ink,
  },
  total: {
    ...typography.bodyMd,
    color: colors.mute,
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  quickBtn: {
    backgroundColor: colors.primary,
    borderRadius: rounded.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  quickBtnText: {
    ...typography.buttonMd,
    color: colors.surfaceCard,
  },
  quickBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  quickBtnOutlineText: {
    color: colors.body,
  },
  customRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  customInput: {
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
  customConfirm: {
    backgroundColor: colors.primary,
    borderRadius: rounded.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
  customConfirmText: {
    ...typography.buttonMd,
    color: colors.surfaceCard,
  },
  resetBtn: {
    paddingVertical: spacing.sm,
  },
  resetBtnText: {
    ...typography.captionMd,
    color: colors.accentRed,
  },
  historySection: {
    width: '100%',
    gap: spacing.xs,
  },
  historyTitle: {
    ...typography.headingSm,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
});
