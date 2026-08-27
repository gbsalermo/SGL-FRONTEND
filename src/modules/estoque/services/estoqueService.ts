import { http } from '@/services/http'
import type {
  DescarteProdutoRequest,
  EntradaLoteRequest,
  EstoqueCentralResponse,
  LoteResponse,
} from '@/modules/estoque/types/estoque'

export const estoqueService = {
  async listarPorUnidade(unidadeId: string) {
    const { data } = await http.get<EstoqueCentralResponse[]>('/v1/estoque-central/por-unidade', {
      params: { unidadeId },
    })
    return data
  },

  async listarEstoqueBaixo(unidadeId: string) {
    const { data } = await http.get<EstoqueCentralResponse[]>('/v1/estoque-central/estoque-baixo', {
      params: { unidadeId },
    })
    return data
  },

  async buscarPorId(id: string) {
    const { data } = await http.get<EstoqueCentralResponse>(`/v1/estoque-central/${id}`)
    return data
  },

  async listarLotesPorEstoque(estoqueId: string) {
    const { data } = await http.get<LoteResponse[]>('/v1/lotes/por-estoque', {
      params: { estoqueId },
    })
    return data
  },

  async listarLotesVencidos() {
    const { data } = await http.get<LoteResponse[]>('/v1/lotes/vencidos')
    return data
  },

  async registrarEntradaLote(estoqueId: string, usuarioId: string, payload: EntradaLoteRequest) {
    const { data } = await http.post<LoteResponse>(`/v1/movimentacoes/estoques/${estoqueId}/lotes`, payload, {
      params: { usuarioId },
    })
    return data
  },

  async descartarVencidos(estoqueId: string, usuarioId: string, payload: DescarteProdutoRequest) {
    const { data } = await http.post(`/v1/movimentacoes/estoques/${estoqueId}/descarte-vencimento`, payload, {
      params: { usuarioId },
    })
    return data
  },
}
