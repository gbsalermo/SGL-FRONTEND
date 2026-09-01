import { http } from '@/services/http'
import type {
  CriarResiduoRequest,
  ProdutoResiduoResponse,
  ProjetoResiduoResponse,
  ResiduoResponse,
} from '@/modules/residuos/types/residuo'

export const residuoService = {
  async criar(payload: CriarResiduoRequest) {
    const { data } = await http.post<ResiduoResponse>('/v1/residuos', payload)
    return data
  },

  async listarProjetosPorLaboratorio(laboratorioId: string) {
    const { data } = await http.get<ProjetoResiduoResponse[]>('/v1/projetos/por-laboratorio', {
      params: { laboratorioId },
    })
    return data.filter((projeto) => projeto.ativo)
  },

  async listarProdutosAtivos() {
    const { data } = await http.get<ProdutoResiduoResponse[]>('/v1/produtos')
    return data
      .filter((produto) => produto.ativo)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  },
}
