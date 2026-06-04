import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePin } from '@/hooks/usePin';
import { colors, rounded, spacing, typography } from '@/theme';

type Step = 'unlock' | 'create' | 'confirm' | 'change' | 'change_new' | 'change_confirm' | 'disable';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export default function PinScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const router = useRouter();
  const { verify, create, remove } = usePin();

  const initialStep: Step = (mode as Step) ?? 'unlock';
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [step, setStep] = useState<Step>(initialStep);
  const [error, setError] = useState('');

  const titles: Record<Step, string> = {
    unlock: 'Digite seu PIN',
    create: 'Criar PIN',
    confirm: 'Confirmar PIN',
    change: 'PIN atual',
    change_new: 'Novo PIN',
    change_confirm: 'Confirmar novo PIN',
    disable: 'Confirme o PIN para desativar',
  };

  function pressKey(key: string) {
    if (key === '⌫') {
      setPin((p) => p.slice(0, -1));
      setError('');
      return;
    }
    if (pin.length >= 4) return;
    const next = pin + key;
    setPin(next);
    if (next.length === 4) submitPin(next);
  }

  async function submitPin(entered: string) {
    setPin('');

    if (step === 'unlock') {
      const ok = await verify(entered);
      if (ok) { router.replace('/'); }
      else { setError('PIN incorreto. Tente novamente.'); }

    } else if (step === 'create') {
      setFirstPin(entered);
      setStep('confirm');

    } else if (step === 'confirm') {
      if (entered !== firstPin) {
        setError('Os PINs não coincidem.');
        setStep('create');
        setFirstPin('');
        return;
      }
      await create(entered);
      router.back();

    } else if (step === 'change') {
      const ok = await verify(entered);
      if (!ok) { setError('PIN incorreto.'); return; }
      setStep('change_new');

    } else if (step === 'change_new') {
      setFirstPin(entered);
      setStep('change_confirm');

    } else if (step === 'change_confirm') {
      if (entered !== firstPin) {
        setError('Os PINs não coincidem.');
        setStep('change_new');
        setFirstPin('');
        return;
      }
      await create(entered);
      router.back();

    } else if (step === 'disable') {
      const ok = await verify(entered);
      if (!ok) { setError('PIN incorreto.'); return; }
      await remove();
      router.back();
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{titles[step]}</Text>

      <View style={styles.dots}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
        ))}
      </View>

      {error
        ? <Text style={styles.error}>{error}</Text>
        : <View style={styles.errorPlaceholder} />}

      <View style={styles.keypad}>
        {KEYS.map((key, idx) =>
          key === '' ? (
            <View key={idx} style={styles.keyEmpty} />
          ) : (
            <TouchableOpacity
              key={idx}
              style={[styles.key, key === '⌫' && styles.keyDelete]}
              onPress={() => pressKey(key)}
              activeOpacity={0.6}
            >
              <Text style={[styles.keyText, key === '⌫' && styles.keyDeleteText]}>{key}</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {step !== 'unlock' && (
        <TouchableOpacity onPress={() => router.canGoBack() && router.back()}>
          <Text style={styles.cancel}>Cancelar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    padding: spacing.xl,
  },
  title: {
    ...typography.headingMd,
    color: colors.ink,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: rounded.full,
    borderWidth: 2,
    borderColor: colors.stone,
  },
  dotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  error: {
    ...typography.captionSm,
    color: colors.accentRed,
    textAlign: 'center',
  },
  errorPlaceholder: {
    height: 18,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 252,
    gap: spacing.md,
    justifyContent: 'center',
  },
  key: {
    width: 68,
    height: 68,
    borderRadius: rounded.full,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    ...typography.headingMd,
    color: colors.ink,
  },
  keyEmpty: {
    width: 68,
    height: 68,
  },
  keyDelete: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  keyDeleteText: {
    ...typography.headingLg,
    color: colors.mute,
  },
  cancel: {
    ...typography.bodyMd,
    color: colors.mute,
    paddingVertical: spacing.sm,
  },
});
