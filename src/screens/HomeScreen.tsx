import React, { useMemo, useState } from 'react';
import { Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertCard } from '../components/AlertCard';
import { AiBadge, Badge } from '../components/Badge';
import { ErrorBanner } from '../components/ErrorBanner';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

export function HomeScreen() {
  const { user, alerts, items, analysis, deliveries, transfers, logout, refreshData, loading, error, clearError } =
    useApp();
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = useMemo(() => {
    const parts = user?.nome?.split(' ').slice(0, 2) ?? [];
    return parts.map((part) => part[0]).join('') || 'AS';
  }, [user?.nome]);

  const criticalCount = alerts.filter((alert) => alert.prioridade === 'critico').length;
  const attentionCount = alerts.filter((alert) => alert.prioridade === 'atencao').length;
  const inRoute = deliveries.filter((delivery) => delivery.status === 'em_rota').length;
  const delayed = deliveries.filter((delivery) => delivery.status === 'atrasado').length;
  const inRouteFirst = deliveries.find((delivery) => delivery.status === 'em_rota');
  const activeTransfers = transfers.filter(
    (transfer) => transfer.status === 'pendente' || transfer.status === 'em_rota',
  );
  const firstActiveTransfer = activeTransfers[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>MediStock</Text>
        <View style={styles.headerActions}>
          <Badge label={`${criticalCount} críticos`} variant="critico" />
          <Pressable onPress={() => setProfileOpen(true)} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshData} tintColor={colors.primarySoft} />}
      >
        <ErrorBanner message={error} onRetry={refreshData} onDismiss={clearError} />
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Alertas ativos</Text>
          <Badge label={`${criticalCount} críticos`} variant="critico" />
          <Badge label={`${attentionCount} atenção`} variant="atencao" />
        </View>

        {alerts.slice(0, 2).map((alert) => (
          <AlertCard
            key={`${alert.tipo}-${alert.id}`}
            title={alert.titulo}
            description={alert.descricao}
            variant={alert.prioridade === 'critico' ? 'critico' : 'atencao'}
            badgeLabel={alert.prioridade.toUpperCase()}
            actions={alert.acoes.map((action) => ({
              label: action,
              primary: action === 'Repor',
            }))}
            progress={null}
          />
        ))}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{items.length}</Text>
            <Text style={styles.statLabel}>Itens em estoque</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.danger }]}>{criticalCount}</Text>
            <Text style={styles.statLabel}>Críticos</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>IA Interna</Text>
            <AiBadge />
          </View>
          <Text style={styles.cardText}>
            {items.filter((item) => item.tipo === 'essencial_baixa_demanda').length} itens prioritários para armazenagem
          </Text>
          <Text style={[styles.cardText, { color: colors.warning, marginTop: 4 }]}>
            Otimização interna: {analysis.scoreInterno}/100
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Entregas hoje</Text>
            <Badge label={`${inRoute} em rota`} variant="info" />
            {delayed > 0 ? <Badge label={`${delayed} atrasado`} variant="critico" /> : null}
          </View>
          <Text style={styles.cardText}>{inRouteFirst?.codigo ?? 'Nenhuma entrega em rota'}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Transferências da rede</Text>
            <Badge label={`${activeTransfers.length} ativas`} variant={activeTransfers.length > 0 ? 'ia' : 'normal'} />
          </View>
          <Text style={styles.cardText}>
            {firstActiveTransfer
              ? `${firstActiveTransfer.item}: ${firstActiveTransfer.origem} → ${firstActiveTransfer.destino}`
              : 'Nenhuma transferência pendente ou em rota'}
          </Text>
        </View>

        <Pressable onPress={refreshData} style={styles.refreshButton}>
          <Text style={styles.refreshText}>Atualizar indicadores</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={profileOpen} transparent animationType="slide" onRequestClose={() => setProfileOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.sheet} onPress={() => setProfileOpen(false)}>
            <Pressable style={styles.sheetHandle} onPress={() => setProfileOpen(false)} />
            <View style={styles.profileRow}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>{initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profileName}>{user?.nome ?? 'Usuário'}</Text>
                <Text style={styles.profileSmall}>{user?.cargo ?? ''}</Text>
                <Text style={styles.profileSmall}>
                  {user?.hospital ?? ''} · {user?.registroProfissional ?? ''}
                </Text>
              </View>
            </View>

            {['Notificações e alertas', 'Auditoria de IA', 'Controle de acesso (LGPD)'].map((item) => (
              <Text key={item} style={styles.profileItem}>
                {item}
              </Text>
            ))}

            <View style={styles.profileItemRow}>
              <Text style={styles.profileItem}>Sincronização Firebase</Text>
              <Badge label="Online" variant="normal" />
            </View>

            <Pressable
              onPress={async () => {
                await logout();
                setProfileOpen(false);
              }}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutText}>Sair da conta</Text>
            </Pressable>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 18,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoftBg,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  content: {
    padding: 16,
    gap: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 5,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statValue: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '500',
  },
  statLabel: {
    marginTop: 2,
    color: '#64748B',
    fontSize: 11,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  cardText: {
    color: colors.text,
    fontSize: 12,
    marginTop: 4,
  },
  refreshButton: {
    marginTop: 6,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  refreshText: {
    color: colors.primarySoftBg,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 8,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginBottom: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoftBg,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  profileName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  profileSmall: {
    color: colors.muted,
    fontSize: 11,
  },
  profileItem: {
    color: colors.muted,
    fontSize: 13,
    paddingVertical: 8,
  },
  profileItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoutButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F7C1C1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '600',
  },
});
