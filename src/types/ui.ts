export type NivelUi = 'normal' | 'atencao' | 'critico';
export type PrioridadeUi = 'critico' | 'atencao' | 'info';
export type StatusLogisticoUi = 'pendente' | 'em_rota' | 'concluida' | 'cancelada' | 'atrasado';

export interface UserProfile {
  nome: string;
  email: string;
  matricula?: string;
  departamento?: string;
  cargo?: string;
  registroProfissional?: string;
  hospital?: string;
}

export interface StockItemUi {
  id: string;
  nome: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  unidadeMedida: string;
  localArmazenamento: string;
  hospitalId: number;
  hospitalNome: string;
  validade: string | null;
  custoUnitario: number | null;
  altoCustoBaixaDemanda: boolean;
  status: NivelUi;
  tipo: 'essencial_baixa_demanda' | 'comum';
}

export interface AlertUi {
  id: string;
  tipo: 'estoque_critico' | 'aviso';
  titulo: string;
  descricao: string;
  prioridade: PrioridadeUi;
  acoes: string[];
}

export interface DeliveryUi {
  id: string;
  codigo: string;
  fornecedor: string;
  item: string;
  eta: string | null;
  status: StatusLogisticoUi;
}

export interface TransferUi {
  id: string;
  item: string;
  origem: string;
  destino: string;
  quantidade: number;
  status: StatusLogisticoUi;
  urgencia: 'alta' | 'media';
  sugeridaPorIa: boolean;
}

export interface ForecastUi {
  itemId: string;
  demandaProjetada: number;
  diasProjetados: number;
  mediaMovelSimples: number;
  sugestaoCompra: number;
  confianca: number;
}

export interface Analysis {
  scoreInterno: number;
  classificacao: string;
  itensCriticos: number;
  itensPrioritarios: number;
  previsoes: ForecastUi[];
}

export const EMPTY_ANALYSIS: Analysis = {
  scoreInterno: 0,
  classificacao: 'INICIAL',
  itensCriticos: 0,
  itensPrioritarios: 0,
  previsoes: [],
};
