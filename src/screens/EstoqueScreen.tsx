import React, { useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '../components/Badge';
import { ConsumoModal } from '../components/ConsumoModal';
import { ErrorBanner } from '../components/ErrorBanner';
import { ItemFormModal } from '../components/ItemFormModal';
import { ScoreBar } from '../components/ScoreBar';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import type { StockItemUi } from '../types/ui';
import { filterStock, type StockFilter } from '../utils/stock';

const FILTERS: { key: StockFilter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'critico', label: 'Críticos' },
  { key: 'atencao', label: 'Atenção' },
  { key: 'normal', label: 'Normais' },
];

export function EstoqueScreen() {
  const { items, hospitals, loading, error, clearError, refreshData, saveItem, removeItem, registerConsumption } =
    useApp();
  const [filter, setFilter] = useState<StockFilter>('todos');
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StockItemUi | null>(null);
  const [consumoItem, setConsumoItem] = useState<StockItemUi | null>(null);

  const visibleItems = useMemo(() => filterStock(items, filter, query), [items, filter, query]);
  const criticalCount = items.filter((item) => item.status === 'critico').length;

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (item: StockItemUi) => {
    setEditing(item);
    setFormOpen(true);
  };

  const confirmDelete = (item: StockItemUi) => {
    Alert.alert('Excluir item', `Excluir "${item.nome}" do estoque?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => void removeItem(Number(item.id)),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Estoque</Text>
        <View style={styles.headerRight}>
          <Badge label={`${criticalCount} críticos`} variant="critico" />
          <Pressable onPress={openNew} style={styles.addButton} accessibilityLabel="Novo item">
            <Text style={styles.addText}>+ Novo</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.toolbar}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por item, local ou hospital"
          placeholderTextColor="rgba(255,255,255,0.3)"
          style={styles.search}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        <View style={styles.filters}>
          {FILTERS.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => setFilter(option.key)}
              style={[styles.chip, filter === option.key && styles.chipActive]}
            >
              <Text style={[styles.chipText, filter === option.key && styles.chipTextActive]}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshData} tintColor={colors.primarySoft} />}
      >
        <ErrorBanner message={error} onRetry={refreshData} onDismiss={clearError} />

        {visibleItems.length === 0 ? (
          <Text style={styles.empty}>
            {items.length === 0 ? 'Nenhum item cadastrado ainda.' : 'Nenhum item corresponde à busca.'}
          </Text>
        ) : null}

        {visibleItems.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.nome}</Text>
                <Text style={styles.itemMeta}>
                  Atual: {item.quantidadeAtual} · Mín: {item.quantidadeMinima} {item.unidadeMedida ?? ''}
                </Text>
                <Text style={styles.itemMeta}>{item.hospitalNome}</Text>
              </View>
              <Badge
                label={item.status === 'critico' ? 'CRÍTICO' : item.status === 'atencao' ? 'ATENÇÃO' : 'NORMAL'}
                variant={item.status}
              />
            </View>

            <View style={styles.spacing} />
            <ScoreBar score={item.quantidadeAtual} max={item.quantidadeMinima * 3} />
            <Text style={styles.local}>Local: {item.localArmazenamento ?? 'Não definido'}</Text>

            <View style={styles.actions}>
              <Pressable onPress={() => setConsumoItem(item)} style={styles.actionPrimary}>
                <Text style={styles.actionText}>Registrar consumo</Text>
              </Pressable>
              <Pressable onPress={() => openEdit(item)} style={styles.actionGhost}>
                <Text style={styles.actionText}>Editar</Text>
              </Pressable>
              <Pressable onPress={() => confirmDelete(item)} style={styles.actionDanger}>
                <Text style={[styles.actionText, { color: colors.dangerSoft }]}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <ItemFormModal
        visible={formOpen}
        item={editing}
        hospitals={hospitals}
        saving={loading}
        onClose={() => setFormOpen(false)}
        onSubmit={async (body, id) => {
          if (await saveItem(body, id)) setFormOpen(false);
        }}
      />

      <ConsumoModal
        item={consumoItem}
        saving={loading}
        onClose={() => setConsumoItem(null)}
        onSubmit={async (body) => {
          if (await registerConsumption(body)) {
            setConsumoItem(null);
            Alert.alert('Consumo registrado', 'A previsão de demanda da IA foi atualizada.');
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  toolbar: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  search: {
    color: colors.text,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    marginTop: 12,
  },
  filters: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.muted, fontSize: 12 },
  chipTextActive: { color: colors.text, fontWeight: '600' },
  content: { padding: 16 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 32 },
  card: {
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemName: { color: colors.text, fontWeight: '600', fontSize: 14 },
  itemMeta: { marginTop: 4, color: colors.muted, fontSize: 12 },
  spacing: { height: 8 },
  local: { marginTop: 8, color: colors.muted, fontSize: 12 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  actionPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionGhost: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionDanger: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: { color: colors.text, fontWeight: '700', fontSize: 12 },
});
