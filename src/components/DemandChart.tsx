import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

export interface DemandPoint {
  id: string;
  label: string;
  projetada: number;
  media: number;
}

export function DemandChart({ data }: { data: DemandPoint[] }) {
  const max = Math.max(1, ...data.flatMap((point) => [point.projetada, point.media]));

  return (
    <View>
      <View style={styles.legend}>
        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        <Text style={styles.legendText}>Demanda projetada</Text>
        <View style={[styles.dot, { backgroundColor: colors.warning }]} />
        <Text style={styles.legendText}>Média móvel</Text>
      </View>
      {data.map((point) => (
        <View key={point.id} style={styles.group}>
          <Text style={styles.label} numberOfLines={1}>
            {point.label}
          </Text>
          <Bar value={point.projetada} max={max} color={colors.primary} />
          <Bar value={point.media} max={max} color={colors.warning} />
        </View>
      ))}
    </View>
  );
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const width = `${Math.max(2, Math.min(100, (value / max) * 100))}%` as `${number}%`;
  return (
    <View style={styles.row}>
      <View style={styles.track}>
        <View style={[styles.fill, { width, backgroundColor: color }]} />
      </View>
      <Text style={styles.value}>{Math.round(value * 10) / 10}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.muted, fontSize: 11, marginRight: 8 },
  group: { marginBottom: 12 },
  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  fill: { height: 8, borderRadius: 4 },
  value: { width: 40, color: colors.muted, fontSize: 11, textAlign: 'right' },
});