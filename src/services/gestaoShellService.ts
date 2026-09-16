import { http } from '@/services/http'
import type { LaboratorioCadastro, ProdutoCadastro, UsuarioPermissao } from '@/modules/admin/types/cadastros'
import type { PedidoResponse } from '@/modules/pedidos/types/pedido'
import type { RelatorioEstoqueLotesResponse } from '@/modules/relatorios/types/relatorio'

export interface BaseBuscaGestao {
  pedidos: PedidoResponse[]
  produtos: ProdutoCadastro[]
  laboratorios: LaboratorioCadastro[]
  usuarios: UsuarioPermissao[]
  falhas: string[]
}

export const gestaoShellService = {
  async listarPedidosPendentes() {
    const { data } = await http.get<PedidoResponse[]>('/v1/pedidos/por-status', {
      params: { status: 'PENDENTE' },
    })
    return data
  },

  async obterResumoEstoque(unidadeId?: string | null) {
    const { data } = await http.get<RelatorioEstoqueLotesResponse>('/v1/relatorios/estoque-lotes', {
      params: unidadeId ? { unidadeId } : {},
    })
    return data
  },

  async carregarBaseBusca(): Promise<BaseBuscaGestao> {
    const [pedidos, produtos, laboratorios, usuarios] = await Promise.allSettled([
      http.get<PedidoResponse[]>('/v1/pedidos'),
      http.get<ProdutoCadastro[]>('/v1/produtos'),
      http.get<LaboratorioCadastro[]>('/v1/laboratorios'),
      http.get<UsuarioPermissao[]>('/v1/usuarios'),
    ])

    const falhas: string[] = []

    if (pedidos.status === 'rejected') falhas.push('pedidos')
    if (produtos.status === 'rejected') falhas.push('produtos')
    if (laboratorios.status === 'rejected') falhas.push('laboratórios')
    if (usuarios.status === 'rejected') falhas.push('usuários')

    return {
      pedidos: pedidos.status === 'fulfilled' ? pedidos.value.data : [],
      produtos: produtos.status === 'fulfilled' ? produtos.value.data : [],
      laboratorios: laboratorios.status === 'fulfilled' ? laboratorios.value.data : [],
      usuarios: usuarios.status === 'fulfilled' ? usuarios.value.data : [],
      falhas,
    }
  },
}
