import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../theme/colors';
import type { HistoricoConsumoRequest } from '../types/ApiTypes';
import type { StockItemUi } from '../types/ui';
import { currentMonth, isValidMonth } from '../utils/stock';

interface Props {
  item: StockItemUi | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (body: HistoricoConsumoRequest) => void;
}

/** Registra o consumo mensal de um item (alimenta a previsão de demanda da IA). */
export function ConsumoModal({ item, saving, onClose, onSubmit }: Props) {
  return (
    <Modal visible={item !== null} animationType="fade" transparent onRequestClose={onClose}>
      {/* Montado a cada item, para o formulário começar limpo. */}
      {item ? <ConsumoForm key={item.id} item={item} saving={saving} onClose={onClose} onSubmit={onSubmit} /> : null}
    </Modal>
  );
}

function ConsumoForm({ item, saving, onClose, onSubmit }: Omit<Props, 'item'> & { item: StockItemUi }) {
  const [quantidade, setQuantidade] = useState('');
  const [mes, setMes] = useState(currentMonth());
  const [formError, setFormError] = useState<string | null>(null);

  const submit = () => {
    const valor = Number(quantidade);
    if (!Number.isInteger(valor) || valor < 0)
      return setFormError('Informe uma quantidade inteira, maior ou igual a zero.');
    if (!isValidMonth(mes.trim())) return setFormError('O mês deve estar no formato AAAA-MM.');
    setFormError(null);
    onSubmit({
      itemEstoqueId: Number(item.id),
      hospitalId: item.hospitalId,
      mesReferencia: mes.trim(),
      quantidadeConsumida: valor,
    });
  };

  return (
    <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>Registrar consumo</Text>
        <Text style={styles.subtitle}>
          {item.nome} · {item.hospitalNome}
        </Text>

        <Text style={styles.label}>Quantidade consumida</Text>
        <TextInput
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="number-pad"
          placeholder="Ex.: 25"
          placeholderTextColor="rgba(255,255,255,0.3)"
          style={styles.input}
        />

        <Text style={styles.label}>Mês de referência (AAAA-MM)</Text>
        <TextInput
          value={mes}
          onChangeText={setMes}
          autoCapitalize="none"
          placeholder="2026-09"
          placeholderTextColor="rgba(255,255,255,0.3)"
          style={styles.input}
        />

        {formError ? <Text style={styles.error}>{formError}</Text> : null}

        <View style={styles.actions}>
          <Pressable onPress={onClose} disabled={saving} style={[styles.button, styles.secondary]}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </Pressable>
          <Pressable onPress={submit} disabled={saving} style={[styles.button, saving && styles.disabled]}>
            <Text style={styles.buttonText}>{saving ? 'Enviando...' : 'Registrar'}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 20 },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  label: { color: colors.muted, fontSize: 12, marginTop: 16, marginBottom: 6 },
  input: {
    color: colors.text,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  error: { color: colors.dangerSoft, marginTop: 12, fontSize: 13 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  button: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondary: { backgroundColor: 'rgba(255,255,255,0.08)' },
  disabled: { opacity: 0.6 },
  buttonText: { color: colors.text, fontWeight: '700' },
});
