import { http } from '@/services/http'
import type {
  AprovarPedidoRequest,
  EstoqueCentralResponse,
  PedidoRequest,
  PedidoResponse,
  ProjetoResponse,
  StatusPedido,
} from '@/modules/pedidos/types/pedido'

function aplicarUrgenciaOperacional(pedido: PedidoResponse): PedidoResponse {
  return {
    ...pedido,
    urgente: pedido.urgente && pedido.status === 'PENDENTE',
  }
}

function aplicarUrgenciaOperacionalLista(pedidos: PedidoResponse[]) {
  return pedidos.map(aplicarUrgenciaOperacional)
}

export const pedidoService = {
  async listarTodos() {
    const { data } = await http.get<PedidoResponse[]>('/v1/pedidos')
    return aplicarUrgenciaOperacionalLista(data)
  },

  async listarPorStatus(status: StatusPedido) {
    const { data } = await http.get<PedidoResponse[]>('/v1/pedidos/por-status', {
      params: { status },
    })
    return aplicarUrgenciaOperacionalLista(data)
  },

  async listarPorUrgencia(urgente: boolean) {
    const { data } = await http.get<PedidoResponse[]>('/v1/pedidos/por-urgencia', {
      params: { urgente },
    })
    return aplicarUrgenciaOperacionalLista(data)
  },

  async buscarPorId(id: string) {
    const { data } = await http.get<PedidoResponse>(`/v1/pedidos/${id}`)
    return aplicarUrgenciaOperacional(data)
  },

  async aprovar(id: string, payload: AprovarPedidoRequest) {
    const { data } = await http.put<PedidoResponse>(`/v1/pedidos/${id}/aprovar`, payload)
    return aplicarUrgenciaOperacional(data)
  },

  async rejeitar(id: string, observacao: string) {
    const { data } = await http.put<PedidoResponse>(`/v1/pedidos/${id}/rejeitar`, null, {
      params: { observacao },
    })
    return aplicarUrgenciaOperacional(data)
  },

  async entregar(id: string) {
    const { data } = await http.put<PedidoResponse>(`/v1/pedidos/${id}/entregar`)
    return aplicarUrgenciaOperacional(data)
  },

  async cancelar(id: string, observacao: string) {
    const { data } = await http.put<PedidoResponse>(`/v1/pedidos/${id}/cancelar`, null, {
      params: { observacao },
    })
    return aplicarUrgenciaOperacional(data)
  },

  async listarPorUsuario(usuarioId: string) {
    const { data } = await http.get<PedidoResponse[]>('/v1/pedidos/por-usuario', {
      params: { usuarioId },
    })
    return aplicarUrgenciaOperacionalLista(data)
  },

  async criar(payload: PedidoRequest) {
    const { data } = await http.post<PedidoResponse>('/v1/pedidos', payload)
    return aplicarUrgenciaOperacional(data)
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
