import { http } from '@/services/http'
import type { MovimentacaoEstoqueResponse, TipoMovimentacao } from '@/modules/movimentacoes/types/movimentacao'

export const movimentacaoService = {
  async listarTodos() {
    const { data } = await http.get<MovimentacaoEstoqueResponse[]>('/v1/movimentacoes')
    return data
  },

  async listarPorTipo(tipo: TipoMovimentacao) {
    const { data } = await http.get<MovimentacaoEstoqueResponse[]>('/v1/movimentacoes/tipo', { params: { tipo } })
    return data
  },

  async buscarPorId(id: string) {
    const { data } = await http.get<MovimentacaoEstoqueResponse>(`/v1/movimentacoes/${id}`)
    return data
  },
}
