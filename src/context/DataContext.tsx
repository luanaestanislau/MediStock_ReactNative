import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { API_BASE_URL } from '../services/api';
import {
  alertaService,
  consumoService,
  estoqueService,
  hospitalService,
  iaService,
  logisticaService,
} from '../services/domainServices';
import {
  mapAlertaToUi,
  mapAnaliseToUi,
  mapEntregaToUi,
  mapItemEstoqueToUi,
  mapTransferenciaToUi,
} from '../services/mappers';
import type {
  HistoricoConsumoRequest,
  HospitalResponse,
  ItemEstoqueRequest,
  LogisticaMapaResponse,
  RedistribuicaoResponse,
  StatusLogistico,
} from '../types/ApiTypes';
import { Analysis, AlertUi, DeliveryUi, EMPTY_ANALYSIS, StockItemUi, TransferUi } from '../types/ui';
import { getApiErrorMessage } from '../utils/errors';
import { useAuth } from './AuthContext';

interface DataContextData {
  loading: boolean;
  error: string | null;
  items: StockItemUi[];
  hospitals: HospitalResponse[];
  alerts: AlertUi[];
  deliveries: DeliveryUi[];
  transfers: TransferUi[];
  logisticsMap: LogisticaMapaResponse;
  redistributionSuggestions: RedistribuicaoResponse[];
  analysis: Analysis;
  refreshData: () => Promise<void>;
  confirmRegistration: () => Promise<boolean>;
  confirmRedistribution: (itemEstoqueId: number, quantidade?: number) => Promise<boolean>;
  saveItem: (body: ItemEstoqueRequest, id?: number) => Promise<boolean>;
  removeItem: (id: number) => Promise<boolean>;
  registerConsumption: (body: HistoricoConsumoRequest) => Promise<boolean>;
  updateDeliveryStatus: (id: number, status: StatusLogistico) => Promise<boolean>;
  updateTransferStatus: (id: number, status: StatusLogistico) => Promise<boolean>;
  clearError: () => void;
}

const EMPTY_MAP: LogisticaMapaResponse = {
  hospitais: [],
  transferenciasAtivas: [],
};

const DataContext = createContext<DataContextData>({} as DataContextData);

function DataState({ authenticated, children }: { authenticated: boolean; children: React.ReactNode }) {
  const [loading, setLoading] = useState(authenticated);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<StockItemUi[]>([]);
  const [hospitals, setHospitals] = useState<HospitalResponse[]>([]);
  const [alerts, setAlerts] = useState<AlertUi[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryUi[]>([]);
  const [transfers, setTransfers] = useState<TransferUi[]>([]);
  const [logisticsMap, setLogisticsMap] = useState<LogisticaMapaResponse>(EMPTY_MAP);
  const [redistributionSuggestions, setRedistributionSuggestions] = useState<RedistribuicaoResponse[]>([]);
  const [analysis, setAnalysis] = useState<Analysis>(EMPTY_ANALYSIS);

  const load = useCallback(async () => {
    try {
      const [estoque, alertas, entregas, transferencias, analise, hospitais] = await Promise.all([
        estoqueService.listar(),
        alertaService.listar(),
        logisticaService.entregas(),
        logisticaService.transferencias(),
        iaService.analiseInterna(),
        hospitalService.listar(),
      ]);
      setItems(estoque.map(mapItemEstoqueToUi));
      setAlerts(alertas.map(mapAlertaToUi));
      setDeliveries(entregas.map(mapEntregaToUi));
      setTransfers(transferencias.map(mapTransferenciaToUi));
      setAnalysis(mapAnaliseToUi(analise));
      setHospitals(hospitais);

      const [mapa, sugestoes] = await Promise.all([
        logisticaService.mapa().catch(() => null),
        iaService.redistribuicao().catch(() => null),
      ]);
      if (mapa) setLogisticsMap(mapa);
      if (sugestoes) setRedistributionSuggestions(sugestoes);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar os dados.', API_BASE_URL));
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    await load();
  }, [load]);

  useEffect(() => {
    if (authenticated) void load();
  }, [authenticated, load]);

  const mutate = useCallback(
    async (action: () => Promise<unknown>, fallback: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await action();
      } catch (err) {
        setError(getApiErrorMessage(err, fallback, API_BASE_URL));
        setLoading(false);
        return false;
      }
      await refreshData();
      return true;
    },
    [refreshData],
  );

  const value = useMemo<DataContextData>(
    () => ({
      loading,
      error,
      items,
      hospitals,
      alerts,
      deliveries,
      transfers,
      logisticsMap,
      redistributionSuggestions,
      analysis,
      refreshData,
      confirmRegistration: async () => true,
      confirmRedistribution: (itemEstoqueId, quantidade) =>
        mutate(
          () => iaService.confirmarRedistribuicao(itemEstoqueId, quantidade),
          'Não foi possível criar a transferência sugerida pela IA.',
        ),
      saveItem: (body, id) =>
        mutate(
          () => (id ? estoqueService.atualizar(id, body) : estoqueService.criar(body)),
          'Não foi possível salvar o item de estoque.',
        ),
      removeItem: (id) => mutate(() => estoqueService.remover(id), 'Não foi possível excluir o item.'),
      registerConsumption: (body) =>
        mutate(() => consumoService.registrar(body), 'Não foi possível registrar o consumo.'),
      updateDeliveryStatus: (id, status) =>
        mutate(() => logisticaService.atualizarStatusEntrega(id, status), 'Não foi possível atualizar a entrega.'),
      updateTransferStatus: (id, status) =>
        mutate(
          () => logisticaService.atualizarStatusTransferencia(id, status),
          'Não foi possível atualizar a transferência.',
        ),
      clearError: () => setError(null),
    }),
    [
      loading,
      error,
      items,
      hospitals,
      alerts,
      deliveries,
      transfers,
      logisticsMap,
      redistributionSuggestions,
      analysis,
      refreshData,
      mutate,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authenticated } = useAuth();
  return (
    <DataState key={authenticated ? 'sessao' : 'sem-sessao'} authenticated={authenticated}>
      {children}
    </DataState>
  );
};

export const useData = () => useContext(DataContext);
