import { http } from '@/services/http'
import type {
  AtualizarLoteRequest,
  DescarteProdutoRequest,
  EntradaLoteRequest,
  EstoqueCentralResponse,
  LoteResponse,
  MovimentacaoLoteResponse,
} from '@/modules/estoque/types/estoque'

function validarContratoLote(lote: LoteResponse) {
  if (!lote.codigoInterno || !lote.tipoEmbalagem) {
    throw new Error(
      'O backend em execução está desatualizado para o fluxo atual de lotes. Reinicie a API com a main mais recente e confirme as migrations V7 e V8.',
    )
  }
  return lote
}

function validarContratoLotes(lotes: LoteResponse[]) {
  lotes.forEach(validarContratoLote)
  return lotes
}

export const estoqueService = {
  async listarPorUnidade(unidadeId: string) {
    const { data } = await http.get<EstoqueCentralResponse[]>('/v1/estoque-central/por-unidade', { params: { unidadeId } })
    return data
  },

  async listarEstoqueBaixo(unidadeId: string) {
    const { data } = await http.get<EstoqueCentralResponse[]>('/v1/estoque-central/estoque-baixo', { params: { unidadeId } })
    return data
  },

  async buscarPorId(id: string) {
    const { data } = await http.get<EstoqueCentralResponse>(`/v1/estoque-central/${id}`)
    return data
  },

  async listarLotesPorEstoque(estoqueId: string) {
    const { data } = await http.get<LoteResponse[]>('/v1/lotes/por-estoque', { params: { estoqueId } })
    return validarContratoLotes(data)
  },

  async listarLotesVencidos() {
    const { data } = await http.get<LoteResponse[]>('/v1/lotes/vencidos')
    return validarContratoLotes(data)
  },

  async listarMovimentacoesPorLote(loteId: string) {
    const { data } = await http.get<MovimentacaoLoteResponse[]>('/v1/movimentacoes/lote', { params: { loteId } })
    return data
  },

  async registrarEntradaLote(estoqueId: string, usuarioId: string, payload: EntradaLoteRequest) {
    const { data } = await http.post<LoteResponse>(`/v1/movimentacoes/estoques/${estoqueId}/lotes`, payload, { params: { usuarioId } })
    return validarContratoLote(data)
  },

  async atualizarLote(loteId: string, payload: AtualizarLoteRequest) {
    const { data } = await http.put<LoteResponse>(`/v1/lotes/${loteId}`, payload)
    return validarContratoLote(data)
  },

  async descartarVencidos(estoqueId: string, usuarioId: string, payload: DescarteProdutoRequest) {
    const { data } = await http.post(`/v1/movimentacoes/estoques/${estoqueId}/descarte-vencimento`, payload, { params: { usuarioId } })
    return data
  },
}
