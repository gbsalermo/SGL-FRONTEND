import { http } from '@/services/http'
import type {
  RelatorioEstagiariosFiltros,
  RelatorioEstagiariosResponse,
} from '@/modules/relatorios/types/relatorio'

export const relatorioService = {
  async listarEstagiarios(filtros: RelatorioEstagiariosFiltros = {}) {
    const { data } = await http.get<RelatorioEstagiariosResponse>('/v1/relatorios/estagiarios', {
      params: filtros,
    })
    return data
  },
}
