import { http } from '@/services/http'
import type {
  RelatorioEstagiariosFiltros,
  RelatorioEstagiariosResponse,
  RelatorioMovimentacoesFiltros,
  RelatorioMovimentacoesResponse,
} from '@/modules/relatorios/types/relatorio'

export const relatorioService = {
  async listarEstagiarios(filtros: RelatorioEstagiariosFiltros = {}) {
    const { data } = await http.get<RelatorioEstagiariosResponse>('/v1/relatorios/estagiarios', {
      params: filtros,
    })
    return data
  },

  async listarMovimentacoes(filtros: RelatorioMovimentacoesFiltros = {}) {
    const { data } = await http.get<RelatorioMovimentacoesResponse>('/v1/relatorios/movimentacoes', {
      params: filtros,
    })
    return data
  },
}
