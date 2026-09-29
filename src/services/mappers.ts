import type {
  AlertaResponse,
  AnaliseInternaResponse,
  EntregaResponse,
  ItemEstoqueResponse,
  MatriculaResponse,
  TransferenciaResponse,
} from '../types/ApiTypes';
import type {
  Analysis,
  AlertUi,
  DeliveryUi,
  StatusLogisticoUi,
  StockItemUi,
  TransferUi,
  UserProfile,
} from '../types/ui';

export function mapItemEstoqueToUi(item: ItemEstoqueResponse): StockItemUi {
  return {
    id: String(item.id),
    nome: item.nome,
    quantidadeAtual: item.quantidadeAtual,
    quantidadeMinima: item.quantidadeMinima,
    unidadeMedida: item.unidadeMedida,
    localArmazenamento: item.localArmazenamento,
    hospitalId: item.hospitalId,
    hospitalNome: item.hospitalNome,
    validade: item.validade ?? null,
    custoUnitario: item.custoUnitario ?? null,
    altoCustoBaixaDemanda: item.altoCustoBaixaDemanda,
    status: item.nivel.toLowerCase() as StockItemUi['status'],
    tipo: item.altoCustoBaixaDemanda ? 'essencial_baixa_demanda' : 'comum',
  };
}

export function mapAlertaToUi(alerta: AlertaResponse, index: number): AlertUi {
  const prioridade = alerta.tipo.toLowerCase() as AlertUi['prioridade'];
  return {
    id: `${alerta.itemEstoqueId || 'alerta'}-${index}`,
    tipo: prioridade === 'critico' ? 'estoque_critico' : 'aviso',
    titulo: `${alerta.hospitalNome || 'Estoque'} - ${alerta.itemNome}`,
    descricao: alerta.mensagem,
    prioridade,
    acoes: prioridade === 'critico' ? ['Repor', 'Verificar'] : ['Detalhes'],
  };
}

export function mapEntregaToUi(entrega: EntregaResponse): DeliveryUi {
  return {
    id: String(entrega.id),
    codigo: `ENT-${entrega.id}`,
    fornecedor: entrega.transportadora || 'Transportadora Padrão',
    item: entrega.itemNome,
    eta: entrega.dataPrevista ?? null,
    status: entrega.status.toLowerCase() as StatusLogisticoUi,
  };
}

export function mapTransferenciaToUi(transferencia: TransferenciaResponse): TransferUi {
  return {
    id: String(transferencia.id),
    item: transferencia.itemNome,
    origem: transferencia.hospitalOrigemNome,
    destino: transferencia.hospitalDestinoNome,
    quantidade: transferencia.quantidade,
    status: transferencia.status.toLowerCase() as StatusLogisticoUi,
    urgencia: transferencia.geradoPorIa ? 'alta' : 'media',
    sugeridaPorIa: transferencia.geradoPorIa,
  };
}

export function mapAnaliseToUi(analise: AnaliseInternaResponse): Analysis {
  return {
    scoreInterno: analise.scoreOtimizacao,
    classificacao: analise.classificacao,
    itensCriticos: analise.itensCriticos,
    itensPrioritarios: analise.itensPrioritarios,
    previsoes: analise.insights.map((insight) => ({
      itemId: String(insight.itemEstoqueId),
      demandaProjetada: insight.demandaProjetadaUnidades,
      diasProjetados: insight.demandaProjetadaDias,
      mediaMovelSimples: insight.mediaMovelSimples,
      sugestaoCompra: insight.sugestaoCompraUnidades,
      confianca: insight.confiancaPercentual / 100,
    })),
  };
}

export function mapMatriculaToUi(data: MatriculaResponse, previous: UserProfile | null): UserProfile {
  return {
    nome: data.nomeCompleto,
    email: previous?.email ?? '',
    matricula: data.matricula,
    departamento: data.departamento,
    cargo: data.cargo,
    registroProfissional: data.registroProfissional,
    hospital: data.hospital,
  };
}
