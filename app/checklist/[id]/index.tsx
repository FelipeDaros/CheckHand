import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { PencilSimple } from 'phosphor-react-native';
import { AddItemInput } from '@/components/AddItemInput';
import { ItemRow } from '@/components/ItemRow';
import { useItems } from '@/hooks/useItems';
import { getChecklistById } from '@/repositories/checklistRepository';
import { colors, spacing, typography } from '@/theme';
import type { Checklist } from '@/types';

export default function ChecklistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const numericId = Number(id);
  const { items, loading, add, toggle, remove } = useItems(numericId);
  const [checklist, setChecklist] = useState<Checklist | null>(null);

  useEffect(() => {
    getChecklistById(db, numericId).then(setChecklist);
  }, [db, numericId]);

  function handleDelete(itemId: number) {
    Alert.alert('Excluir item', 'Deseja remover este item?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => remove(itemId) },
    ]);
  }

  const doneCount = items.filter((i) => i.is_done === 1).length;
  const totalCount = items.length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          title: checklist?.title ?? 'Checklist',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push(`/checklist/${id}/edit`)}
              style={styles.editBtn}
            >
              <PencilSimple size={20} color={colors.primary} weight="regular" />
            </TouchableOpacity>
          ),
        }}
      />

      {totalCount > 0 && (
        <View style={styles.progressBar}>
          <Text style={styles.progressText}>{doneCount}/{totalCount} concluídos</Text>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${(doneCount / totalCount) * 100}%` }]}
            />
          </View>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ItemRow item={item} onToggle={toggle} onDelete={handleDelete} />
        )}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhum item ainda. Adicione o primeiro!</Text>
            </View>
          )
        }
      />

      <AddItemInput onAdd={add} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  editBtn: {
    paddingHorizontal: spacing.sm,
  },
  progressBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
    backgroundColor: colors.canvas,
  },
  progressText: {
    ...typography.captionSm,
    color: colors.mute,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    ...typography.bodySm,
    color: colors.mute,
    textAlign: 'center',
  },
});
