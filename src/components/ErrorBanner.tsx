import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

export function ErrorBanner({
  message,
  onRetry,
  onDismiss,
}: {
  message: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  if (!message) return null;
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.text}>{message}</Text>
      <View style={styles.actions}>
        {onRetry ? (
          <Pressable onPress={onRetry} hitSlop={8}>
            <Text style={styles.action}>Tentar novamente</Text>
          </Pressable>
        ) : null}
        {onDismiss ? (
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Text style={[styles.action, styles.dismiss]}>Fechar</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(226,75,74,0.12)',
    borderColor: colors.danger,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  text: { color: colors.dangerSoft, fontSize: 13, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 16, marginTop: 8 },
  action: { color: colors.text, fontWeight: '700', fontSize: 13 },
  dismiss: { color: colors.muted, fontWeight: '500' },
});
