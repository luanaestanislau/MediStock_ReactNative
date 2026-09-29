export type StatusLogistico = 'PENDENTE' | 'EM_ROTA' | 'CONCLUIDA' | 'CANCELADA';

export interface UsuarioResponse {
  id: number;
  primeiroNome: string;
  ultimoNome: string;
  emailInstitucional: string;
}

export interface AuthResponse {
  token: string;
  tipo: string;
  expiraEmMinutos: number;
  usuario: UsuarioResponse;
}

export interface MatriculaResponse {
  nomeCompleto: string;
  matricula: string;
  departamento: string;
  cargo: string;
  registroProfissional: string;
  perfil: string;
  hospital: string;
}

export interface ItemEstoqueResponse {
  id: number;
  nome: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  unidadeMedida: string;
  localArmazenamento: string;
  hospitalId: number;
  hospitalNome: string;
  validade: string;
  custoUnitario: number;
  altoCustoBaixaDemanda: boolean;
  nivel: 'NORMAL' | 'ATENCAO' | 'CRITICO';
  vencido: boolean;
  validadeProxima: boolean;
  diasParaVencer: number;
  percentualEstoque: number;
}

export interface AlertaResponse {
  itemEstoqueId: number;
  itemNome: string;
  tipo: 'CRITICO' | 'ATENCAO' | 'INFO';
  mensagem: string;
  hospitalNome: string;
  localArmazenamento: string;
}

export interface EntregaResponse {
  id: number;
  itemNome: string;
  hospitalDestinoNome: string;
  quantidade: number;
  status: StatusLogistico | 'ATRASADO';
  dataPrevista: string;
  transportadora: string;
}

export interface TransferenciaResponse {
  id: number;
  itemNome: string;
  hospitalOrigemNome: string;
  hospitalDestinoNome: string;
  quantidade: number;
  status: StatusLogistico;
  distanciaKm: number;
  tempoEstimadoMinutos: number;
  motivo: string;
  geradoPorIa: boolean;
}

export interface HospitalMapaPonto {
  id: number;
  nome: string;
  cidade: string | null;
  latitude: number;
  longitude: number;
  itensCriticos: number;
}

export interface TransferenciaMapaResponse {
  id: number;
  itemNome: string;
  origem: HospitalMapaPonto;
  destino: HospitalMapaPonto;
  distanciaKm: number;
  tempoEstimadoMinutos: number;
  status: 'PENDENTE' | 'EM_ROTA';
  geradoPorIa: boolean;
  motivo: string | null;
}

export interface LogisticaMapaResponse {
  hospitais: HospitalMapaPonto[];
  transferenciasAtivas: TransferenciaMapaResponse[];
}

export interface CandidatoHospitalResponse {
  hospitalId: number;
  hospitalNome: string;
  demandaHistoricaMedia: number;
  distanciaPonderadaKm: number;
  pontuacao: number;
}

export interface RedistribuicaoResponse {
  itemEstoqueId: number;
  itemNome: string;
  hospitalAtualId: number;
  hospitalAtualNome: string;
  hospitalIdealId: number;
  hospitalIdealNome: string;
  necessitaTransferencia: boolean;
  rotaSugerida: {
    hospitalOrigemId: number;
    hospitalOrigemNome: string;
    hospitalDestinoId: number;
    hospitalDestinoNome: string;
    distanciaKm: number;
    tempoEstimadoMinutos: number;
  } | null;
  candidatos: CandidatoHospitalResponse[];
  justificativaIA: string;
}

export interface InsightItemResponse {
  itemEstoqueId: number;
  itemNome: string;
  hospitalNome: string;
  demandaProjetadaUnidades: number;
  demandaProjetadaDias: number;
  mediaMovelSimples: number;
  sugestaoCompraUnidades: number;
  confiancaPercentual: number;
}

export interface AnaliseInternaResponse {
  scoreOtimizacao: number;
  classificacao: string;
  itensCriticos: number;
  itensPrioritarios: number;
  previsoesGeradas: number;
  insights: InsightItemResponse[];
}

export interface HospitalResponse {
  id: number;
  nome: string;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  latitude: number;
  longitude: number;
}

export interface ItemEstoqueRequest {
  nome: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  unidadeMedida?: string;
  localArmazenamento?: string;
  hospitalId: number;
  validade?: string | null;
  custoUnitario?: number | null;
  altoCustoBaixaDemanda: boolean;
}

export interface HistoricoConsumoRequest {
  itemEstoqueId: number;
  hospitalId: number;
  mesReferencia: string;
  quantidadeConsumida: number;
}
