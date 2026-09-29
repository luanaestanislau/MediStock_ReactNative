import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import type { HospitalResponse, ItemEstoqueRequest } from '../types/ApiTypes';
import type { StockItemUi } from '../types/ui';
import { isValidIsoDate } from '../utils/stock';

interface Props {
  visible: boolean;
  item: StockItemUi | null;
  hospitals: HospitalResponse[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (body: ItemEstoqueRequest, id?: number) => void;
}

export function ItemFormModal({ visible, item, hospitals, saving, onClose, onSubmit }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {visible ? (
        <ItemForm
          key={item?.id ?? 'novo'}
          item={item}
          hospitals={hospitals}
          saving={saving}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Modal>
  );
}

function ItemForm({ item, hospitals, saving, onClose, onSubmit }: Omit<Props, 'visible'>) {
  const [nome, setNome] = useState(item?.nome ?? '');
  const [atual, setAtual] = useState(item ? String(item.quantidadeAtual) : '');
  const [minima, setMinima] = useState(item ? String(item.quantidadeMinima) : '');
  const [unidade, setUnidade] = useState(item?.unidadeMedida ?? '');
  const [local, setLocal] = useState(item?.localArmazenamento ?? '');
  const [validade, setValidade] = useState(item?.validade ?? '');
  const [custo, setCusto] = useState(item?.custoUnitario != null ? String(item.custoUnitario) : '');
  const [altoCusto, setAltoCusto] = useState(item?.altoCustoBaixaDemanda ?? false);
  const [hospitalId, setHospitalId] = useState<number | null>(item?.hospitalId ?? hospitals[0]?.id ?? null);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = () => {
    const quantidadeAtual = Number(atual);
    const quantidadeMinima = Number(minima);
    const custoUnitario = custo.trim() ? Number(custo.replace(',', '.')) : null;

    if (!nome.trim()) return setFormError('Informe o nome do item.');
    if (!Number.isInteger(quantidadeAtual) || quantidadeAtual < 0) return setFormError('Quantidade atual inválida.');
    if (!Number.isInteger(quantidadeMinima) || quantidadeMinima < 0) return setFormError('Quantidade mínima inválida.');
    if (hospitalId == null) return setFormError('Selecione o hospital.');
    if (validade.trim() && !isValidIsoDate(validade.trim())) return setFormError('Validade deve ser AAAA-MM-DD.');
    if (custoUnitario != null && (Number.isNaN(custoUnitario) || custoUnitario < 0)) {
      return setFormError('Custo unitário inválido.');
    }

    setFormError(null);
    onSubmit(
      {
        nome: nome.trim(),
        quantidadeAtual,
        quantidadeMinima,
        unidadeMedida: unidade.trim() || undefined,
        localArmazenamento: local.trim() || undefined,
        hospitalId,
        validade: validade.trim() || null,
        custoUnitario,
        altoCustoBaixaDemanda: altoCusto,
      },
      item ? Number(item.id) : undefined,
    );
  };

  return (
    <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.sheet}>
        <Text style={styles.title}>{item ? 'Editar item' : 'Novo item de estoque'}</Text>
        <ScrollView keyboardShouldPersistTaps="handled">
          <Field label="Nome" value={nome} onChangeText={setNome} placeholder="Ex.: Dipirona 500 mg" />
          <View style={styles.twoCols}>
            <Field label="Qtd. atual" value={atual} onChangeText={setAtual} keyboardType="number-pad" flex />
            <Field label="Qtd. mínima" value={minima} onChangeText={setMinima} keyboardType="number-pad" flex />
          </View>
          <View style={styles.twoCols}>
            <Field label="Unidade" value={unidade} onChangeText={setUnidade} placeholder="un, cx, ml" flex />
            <Field label="Custo unit. (R$)" value={custo} onChangeText={setCusto} keyboardType="decimal-pad" flex />
          </View>
          <Field
            label="Local de armazenamento"
            value={local}
            onChangeText={setLocal}
            placeholder="Ex.: Farmácia — A2"
          />
          <Field label="Validade (AAAA-MM-DD)" value={validade} onChangeText={setValidade} placeholder="2027-12-31" />

          <Text style={styles.label}>Hospital</Text>
          <View style={styles.chips}>
            {hospitals.map((hospital) => (
              <Pressable
                key={hospital.id}
                onPress={() => setHospitalId(hospital.id)}
                style={[styles.chip, hospitalId === hospital.id && styles.chipActive]}
              >
                <Text style={[styles.chipText, hospitalId === hospital.id && styles.chipTextActive]}>
                  {hospital.nome}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Alto custo e baixa demanda</Text>
            <Switch value={altoCusto} onValueChange={setAltoCusto} trackColor={{ true: colors.primary }} />
          </View>

          {formError ? <Text style={styles.error}>{formError}</Text> : null}
        </ScrollView>

        <View style={styles.actions}>
          <Pressable onPress={onClose} style={[styles.button, styles.secondary]} disabled={saving}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </Pressable>
          <Pressable onPress={submit} style={[styles.button, saving && styles.disabled]} disabled={saving}>
            <Text style={styles.buttonText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  flex,
  ...inputProps
}: { label: string; flex?: boolean } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={flex ? styles.flex : undefined}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        placeholderTextColor="rgba(255,255,255,0.3)"
        autoCapitalize="none"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '92%',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  label: { color: colors.muted, fontSize: 12, marginTop: 12, marginBottom: 6 },
  input: {
    color: colors.text,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  twoCols: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.muted, fontSize: 12 },
  chipTextActive: { color: colors.text, fontWeight: '600' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  switchLabel: { color: colors.text, fontSize: 14 },
  error: { color: colors.dangerSoft, marginTop: 12, fontSize: 13 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
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
