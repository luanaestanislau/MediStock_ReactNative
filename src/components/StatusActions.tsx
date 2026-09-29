import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import type { StatusLogistico } from '../types/ApiTypes';
import type { StatusLogisticoUi } from '../types/ui';
import { nextStatusActions } from '../utils/logistics';

export function StatusActions({
  status,
  disabled,
  subject,
  onChange,
}: {
  status: StatusLogisticoUi;
  disabled?: boolean;
  subject: string;
  onChange: (to: StatusLogistico) => void;
}) {
  const actions = nextStatusActions(status);
  if (actions.length === 0) return null;

  const press = (to: StatusLogistico, label: string, destructive?: boolean) => {
    if (!destructive) return onChange(to);
    Alert.alert(label, `Confirmar: ${label.toLowerCase()} ${subject}?`, [
      { text: 'Voltar', style: 'cancel' },
      { text: 'Confirmar', style: 'destructive', onPress: () => onChange(to) },
    ]);
  };

  return (
    <View style={styles.row}>
      {actions.map((action) => (
        <Pressable
          key={action.to}
          disabled={disabled}
          onPress={() => press(action.to, action.label, action.destructive)}
          style={[styles.button, action.destructive && styles.destructive, disabled && styles.disabled]}
        >
          <Text style={[styles.text, action.destructive && styles.destructiveText]}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginTop: 10 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  destructive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  disabled: { opacity: 0.5 },
  text: { color: colors.text, fontWeight: '700', fontSize: 12 },
  destructiveText: { color: colors.dangerSoft },
});
