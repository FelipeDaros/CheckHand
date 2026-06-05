import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'phosphor-react-native';
import { ChecklistCard } from '@/components/ChecklistCard';
import { FilterTabs } from '@/components/FilterTabs';
import { SearchBar } from '@/components/SearchBar';
import { useChecklists } from '@/hooks/useChecklists';
import { colors, rounded, spacing, typography } from '@/theme';

export default function ChecklistsScreen() {
  const router = useRouter();
  const { checklists, loading, query, setQuery, filter, setFilter, remove } = useChecklists();

  function handleDelete(id: number, title: string) {
    Alert.alert(
      'Excluir checklist',
      `Tem certeza que deseja excluir "${title}"? Todos os itens serão removidos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => remove(id) },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar checklist..." />
        <FilterTabs active={filter} onChange={setFilter} />
      </View>

      <FlatList
        data={checklists}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ChecklistCard
            checklist={item}
            onPress={() => router.push(`/checklist/${item.id}`)}
            onLongPress={() => handleDelete(item.id, item.title)}
          />
        )}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {query || filter !== 'all' ? 'Nenhum resultado' : 'Nenhuma checklist ainda'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {query || filter !== 'all'
                  ? 'Tente outro filtro ou termo de busca'
                  : 'Toque no botão + para criar sua primeira lista'}
              </Text>
            </View>
          )
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/checklist/new')}
        activeOpacity={0.8}
      >
        <Plus size={28} color={colors.surfaceCard} weight="bold" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  toolbar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.headingSm,
    color: colors.ink,
  },
  emptySubtitle: {
    ...typography.bodySm,
    color: colors.mute,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: rounded.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
