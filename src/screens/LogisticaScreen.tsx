import React, { useMemo } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, type Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, SectionDivider } from '../components/Badge';
import { ErrorBanner } from '../components/ErrorBanner';
import { StatusActions } from '../components/StatusActions';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

const SAO_PAULO_REGION: Region = {
  latitude: -23.5505,
  longitude: -46.6333,
  latitudeDelta: 0.22,
  longitudeDelta: 0.22,
};

function makeRegion(hospitais: { latitude: number; longitude: number }[]): Region {
  if (hospitais.length === 0) return SAO_PAULO_REGION;
  if (hospitais.length === 1) {
    return {
      latitude: hospitais[0].latitude,
      longitude: hospitais[0].longitude,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }

  const latitudes = hospitais.map((hospital) => hospital.latitude);
  const longitudes = hospitais.map((hospital) => hospital.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    latitudeDelta: Math.max((maxLatitude - minLatitude) * 1.5, 0.04),
    longitudeDelta: Math.max((maxLongitude - minLongitude) * 1.5, 0.04),
  };
}

export function LogisticaScreen() {
  const {
    deliveries,
    transfers,
    logisticsMap,
    redistributionSuggestions,
    confirmRedistribution,
    refreshData,
    loading,
    error,
    clearError,
    updateDeliveryStatus,
    updateTransferStatus,
  } = useApp();
  const region = useMemo(() => makeRegion(logisticsMap.hospitais), [logisticsMap.hospitais]);
  const suggestionsToMove = redistributionSuggestions.filter((suggestion) => suggestion.necessitaTransferencia);
  const hospitalsById = useMemo(
    () => new Map(logisticsMap.hospitais.map((hospital) => [hospital.id, hospital])),
    [logisticsMap.hospitais],
  );

  const confirmSuggestion = (itemEstoqueId: number, itemNome: string, destino: string) => {
    Alert.alert('Confirmar transferência da IA', `Criar uma transferência pendente de ${itemNome} para ${destino}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          const created = await confirmRedistribution(itemEstoqueId);
          if (!created) {
            Alert.alert('Transferência não criada', 'Verifique a mensagem de erro e tente novamente.');
          } else {
            Alert.alert('Transferência criada', 'A rota, a Home e os Alertas já foram atualizados.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshData} tintColor={colors.primarySoft} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Logística</Text>
          <Badge label={`${logisticsMap.transferenciasAtivas.length} ativas`} variant="info" />
        </View>

        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <View>
              <Text style={styles.mapTitle}>Mapa da rede</Text>
              <Text style={styles.mapSubtitle}>Hospitais e rotas de transferências ativas</Text>
            </View>
            <Pressable onPress={refreshData} disabled={loading} style={styles.refreshButton}>
              <Text style={styles.refreshText}>{loading ? '...' : 'Atualizar'}</Text>
            </Pressable>
          </View>
          <MapView style={styles.map} region={region}>
            {logisticsMap.hospitais.map((hospital) => (
              <Marker
                key={hospital.id}
                coordinate={{
                  latitude: hospital.latitude,
                  longitude: hospital.longitude,
                }}
                title={hospital.nome}
                description={`${hospital.cidade ?? 'Rede MediStock'} · ${hospital.itensCriticos} item(ns) crítico(s)`}
                pinColor={hospital.itensCriticos > 0 ? colors.danger : colors.primary}
              />
            ))}
            {logisticsMap.transferenciasAtivas.map((transferencia) => (
              <Polyline
                key={transferencia.id}
                coordinates={[
                  {
                    latitude: transferencia.origem.latitude,
                    longitude: transferencia.origem.longitude,
                  },
                  {
                    latitude: transferencia.destino.latitude,
                    longitude: transferencia.destino.longitude,
                  },
                ]}
                strokeColor={transferencia.geradoPorIa ? colors.primary : colors.info}
                strokeWidth={4}
              />
            ))}
            {suggestionsToMove.map((suggestion) => {
              const origem = hospitalsById.get(suggestion.hospitalAtualId);
              const destino = hospitalsById.get(suggestion.hospitalIdealId);
              if (!origem || !destino) return null;
              return (
                <Polyline
                  key={`sugestao-${suggestion.itemEstoqueId}`}
                  coordinates={[
                    { latitude: origem.latitude, longitude: origem.longitude },
                    {
                      latitude: destino.latitude,
                      longitude: destino.longitude,
                    },
                  ]}
                  strokeColor={colors.warning}
                  strokeWidth={3}
                  lineDashPattern={[8, 6]}
                />
              );
            })}
          </MapView>
          <View style={styles.legend}>
            <Text style={styles.legendText}>● Hospital com item crítico</Text>
            <Text style={styles.legendText}>━ Rota ativa</Text>
            <Text style={styles.legendText}>┅ Sugestão da IA</Text>
          </View>
        </View>

        <SectionDivider label="Sugestões da IA" />
        {suggestionsToMove.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardText}>
              Não há redistribuições necessárias para os insumos de alto custo neste momento.
            </Text>
          </View>
        ) : (
          suggestionsToMove.map((suggestion) => (
            <View key={suggestion.itemEstoqueId} style={styles.suggestionCard}>
              <View style={styles.row}>
                <Text style={styles.cardTitle}>{suggestion.itemNome}</Text>
                <Badge label="IA" variant="ia" />
              </View>
              <Text style={styles.cardText}>De: {suggestion.hospitalAtualNome}</Text>
              <Text style={styles.cardText}>Para: {suggestion.hospitalIdealNome}</Text>
              {suggestion.rotaSugerida ? (
                <Text style={styles.cardText}>
                  Rota: {suggestion.rotaSugerida.distanciaKm.toFixed(1)} km ·{' '}
                  {Math.round(suggestion.rotaSugerida.tempoEstimadoMinutos)} min
                </Text>
              ) : null}
              <Text style={styles.justification}>{suggestion.justificativaIA}</Text>
              <Pressable
                style={styles.confirmButton}
                onPress={() =>
                  confirmSuggestion(suggestion.itemEstoqueId, suggestion.itemNome, suggestion.hospitalIdealNome)
                }
              >
                <Text style={styles.confirmButtonText}>Criar transferência</Text>
              </Pressable>
            </View>
          ))
        )}
        <ErrorBanner message={error} onRetry={refreshData} onDismiss={clearError} />

        <SectionDivider label="Entregas" />
        {deliveries.map((delivery) => (
          <View key={delivery.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{delivery.codigo}</Text>
              <Badge
                label={delivery.status.replace('_', ' ')}
                variant={delivery.status === 'em_rota' ? 'info' : 'normal'}
              />
            </View>
            <Text style={styles.cardText}>Fornecedor: {delivery.fornecedor}</Text>
            <Text style={styles.cardText}>Item: {delivery.item}</Text>
            <Text style={styles.cardText}>ETA: {delivery.eta ?? '--'}</Text>
            <StatusActions
              status={delivery.status}
              disabled={loading}
              subject={`a entrega ${delivery.codigo}`}
              onChange={(to) => void updateDeliveryStatus(Number(delivery.id), to)}
            />
          </View>
        ))}

        <SectionDivider label="Transferências" />
        {transfers.map((transfer) => (
          <View key={transfer.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{transfer.item}</Text>
              <Badge
                label={transfer.sugeridaPorIa ? 'IA' : transfer.status.toUpperCase()}
                variant={transfer.sugeridaPorIa ? 'ia' : 'info'}
              />
            </View>
            <Text style={styles.cardText}>Origem: {transfer.origem}</Text>
            <Text style={styles.cardText}>Destino: {transfer.destino}</Text>
            <Text style={styles.cardText}>
              Qtd: {transfer.quantidade} · Status: {transfer.status}
            </Text>
            <StatusActions
              status={transfer.status}
              disabled={loading}
              subject={`a transferência de ${transfer.item}`}
              onChange={(to) => void updateTransferStatus(Number(transfer.id), to)}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  mapCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
    alignItems: 'center',
  },
  mapTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  mapSubtitle: { color: colors.muted, fontSize: 11, marginTop: 2 },
  map: { height: 250, width: '100%' },
  refreshButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshText: { color: colors.primarySoft, fontWeight: '600', fontSize: 12 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 10 },
  legendText: { color: colors.muted, fontSize: 10 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  suggestionCard: {
    backgroundColor: '#24213F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 12,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: { color: colors.text, fontWeight: '600', fontSize: 14, flex: 1 },
  cardText: { color: colors.muted, marginTop: 4, fontSize: 12 },
  justification: {
    color: colors.primarySoftBg,
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 12,
    paddingVertical: 10,
  },
  confirmButtonText: { color: colors.text, fontWeight: '700', fontSize: 13 },
});
