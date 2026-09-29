import type {
  AlertaResponse,
  AnaliseInternaResponse,
  AuthResponse,
  EntregaResponse,
  HistoricoConsumoRequest,
  HospitalResponse,
  ItemEstoqueRequest,
  ItemEstoqueResponse,
  LogisticaMapaResponse,
  MatriculaResponse,
  RedistribuicaoResponse,
  StatusLogistico,
  TransferenciaResponse,
} from '../types/ApiTypes';
import { api } from './api';

export const authService = {
  login: (emailInstitucional: string, senha: string) =>
    api.post<AuthResponse>('/auth/login', { emailInstitucional, senha }).then((r) => r.data),

  register: (primeiroNome: string, ultimoNome: string, emailInstitucional: string, senha: string) =>
    api
      .post<AuthResponse>('/auth/registrar', {
        primeiroNome,
        ultimoNome,
        emailInstitucional,
        senha,
      })
      .then((r) => r.data),

  matricula: () => api.get<MatriculaResponse>('/perfil/matricula').then((r) => r.data),
};

export const estoqueService = {
  listar: () => api.get<ItemEstoqueResponse[]>('/estoque').then((r) => r.data),
  criar: (body: ItemEstoqueRequest) => api.post<ItemEstoqueResponse>('/estoque', body).then((r) => r.data),
  atualizar: (id: number, body: ItemEstoqueRequest) =>
    api.put<ItemEstoqueResponse>(`/estoque/${id}`, body).then((r) => r.data),
  remover: (id: number) => api.delete<void>(`/estoque/${id}`).then(() => undefined),
};

export const hospitalService = {
  listar: () => api.get<HospitalResponse[]>('/hospitais').then((r) => r.data),
};

export const alertaService = {
  listar: () => api.get<AlertaResponse[]>('/alertas').then((r) => r.data),
};

export const logisticaService = {
  entregas: () => api.get<EntregaResponse[]>('/logistica/entregas').then((r) => r.data),
  transferencias: () => api.get<TransferenciaResponse[]>('/logistica/transferencias').then((r) => r.data),
  mapa: () => api.get<LogisticaMapaResponse>('/logistica/mapa').then((r) => r.data),
  atualizarStatusEntrega: (id: number, status: StatusLogistico) =>
    api
      .patch<EntregaResponse>(`/logistica/entregas/${id}/status`, null, {
        params: { status },
      })
      .then((r) => r.data),
  atualizarStatusTransferencia: (id: number, status: StatusLogistico) =>
    api
      .patch<TransferenciaResponse>(`/logistica/transferencias/${id}/status`, null, { params: { status } })
      .then((r) => r.data),
};

export const iaService = {
  analiseInterna: () => api.get<AnaliseInternaResponse>('/ia/analise-interna').then((r) => r.data),
  redistribuicao: () => api.get<RedistribuicaoResponse[]>('/ia/redistribuicao').then((r) => r.data),
  confirmarRedistribuicao: (itemEstoqueId: number, quantidade?: number) =>
    api.post(`/ia/redistribuicao/${itemEstoqueId}/confirmar`, quantidade ? { quantidade } : undefined),
};

export const consumoService = {
  registrar: (body: HistoricoConsumoRequest) => api.post<void>('/historico-consumo', body).then(() => undefined),
};
