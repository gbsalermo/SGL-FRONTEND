import { http } from '@/services/http'
import type {
  EstoqueCentralResponse,
  PedidoRequest,
  PedidoResponse,
  ProjetoResponse,
} from '@/modules/pedidos/types/pedido'

export const pedidoService = {
  async listarPorUsuario(usuarioId: string) {
    const { data } = await http.get<PedidoResponse[]>('/v1/pedidos/por-usuario', {
      params: { usuarioId },
    })
    return data
  },

  async criar(payload: PedidoRequest) {
    const { data } = await http.post<PedidoResponse>('/v1/pedidos', payload)
    return data
  },

  async listarProjetosPorLaboratorio(laboratorioId: string) {
    const { data } = await http.get<ProjetoResponse[]>('/v1/projetos/por-laboratorio', {
      params: { laboratorioId },
    })
    return data.filter((projeto) => projeto.ativo)
  },

  async listarEstoquePorUnidade(unidadeId: string) {
    const { data } = await http.get<EstoqueCentralResponse[]>('/v1/estoque-central/por-unidade', {
      params: { unidadeId },
    })
    return data.filter((estoque) => estoque.ativo)
  },
}
