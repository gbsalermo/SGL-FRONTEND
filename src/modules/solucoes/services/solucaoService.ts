import { http } from '@/services/http'
import type {
  ModeloSolucao, ModeloSolucaoInput, PedidoSolucao, SolucaoInput,
  UnidadeProduto, MovimentacaoSolucao, ProjetoSolucao,
} from '../types/solucao'

interface ProdutoApi { id: string; nome: string; unidadeMedida: UnidadeProduto['unidadeMedida']; ativo: boolean }
interface EstoqueApi { produtoId: string; quantidadeAtual: number; ativo: boolean }
export const solucaoService = {
  async listarModelos(apenasAtivos = false) {
    const { data } = await http.get<ModeloSolucao[]>(apenasAtivos ? '/v1/modelos-solucao/ativos' : '/v1/modelos-solucao')
    return data
  },
  async cadastrarModelo(payload: ModeloSolucaoInput) {
    const { data } = await http.post<ModeloSolucao>('/v1/modelos-solucao', payload)
    return data
  },
  async atualizarModelo(id: string, payload: ModeloSolucaoInput) {
    const { data } = await http.put<ModeloSolucao>(`/v1/modelos-solucao/${id}`, payload)
    return data
  },
  async inativarModelo(id: string) { await http.delete(`/v1/modelos-solucao/${id}`) },
  async promoverPedido(id: string, nome: string, descricao?: string, instrucoesPreparo?: string) {
    const { data } = await http.post<ModeloSolucao>(`/v1/modelos-solucao/promover-pedido/${id}`, {
      nome, descricao: descricao || null, instrucoesPreparo: instrucoesPreparo || null,
    })
    return data
  },
  async listarPedidos() {
    const { data } = await http.get<PedidoSolucao[]>('/v1/solucoes/pedidos')
    return data
  },
  async listarMinhas(usuarioId: string) {
    const { data } = await http.get<PedidoSolucao[]>('/v1/pedidos/por-usuario', { params: { usuarioId } })
    return data.filter(p => p.tipo === 'SOLUCAO')
  },
  async solicitar(payload: SolucaoInput) {
    // O catalogo usa 'quantidade/unidadeMedida'; o Pedido de Solucao recebe
    // 'quantidadeSolicitada/unidadeMedidaSolicitada'. Nao misturar DTOs.
    const itens = payload.itens.map((item) => ({
      produtoId: item.produtoId,
      quantidadeSolicitada: item.quantidade,
      unidadeMedidaSolicitada: item.unidadeMedida,
    }))
    const { data } = await http.post<PedidoSolucao>('/v1/solucoes/pedidos', {
      ...payload,
      itens,
    })
    return data
  },
  async aprovar(id: string, usuarioAprovadorId: string, itens: PedidoSolucao['itens'], observacao: string) {
    const { data } = await http.put<PedidoSolucao>(`/v1/solucoes/pedidos/${id}/aprovar`, {
      usuarioAprovadorId,
      observacao: observacao || null,
      itens: itens.map(item => ({ itemId: item.id, quantidadeAprovada: item.quantidadeSolicitada })),
    })
    return data
  },
  async rejeitar(id: string, observacao: string) {
    const { data } = await http.put<PedidoSolucao>(`/v1/solucoes/pedidos/${id}/rejeitar`, null, { params: { observacao } })
    return data
  },
  async entregar(id: string) {
    const { data } = await http.put<PedidoSolucao>(`/v1/solucoes/pedidos/${id}/entregar`)
    return data
  },
  async cancelar(id: string, preparada: boolean | null, justificativa: string) {
    const { data } = await http.put<PedidoSolucao>(`/v1/solucoes/pedidos/${id}/cancelar`, { preparada, justificativa })
    return data
  },
  async listarMovimentacoes(id: string) {
    const { data } = await http.get<MovimentacaoSolucao[]>('/v1/movimentacoes/pedido', { params: { pedidoId: id } })
    return data
  },
  async listarProdutos(unidadeId: string): Promise<UnidadeProduto[]> {
    const [catalogo, estoque] = await Promise.all([
      http.get<ProdutoApi[]>('/v1/produtos'),
      http.get<EstoqueApi[]>('/v1/estoque-central/por-unidade', { params: { unidadeId } }),
    ])
    const saldos = new Map(estoque.data.filter(x => x.ativo).map(x => [x.produtoId, x.quantidadeAtual]))
    return catalogo.data
      .filter(p => p.ativo && saldos.has(p.id))
      .map(p => ({
        id: p.id, nome: p.nome, unidadeMedida: p.unidadeMedida,
        quantidadeAtual: saldos.get(p.id) ?? 0, ativo: p.ativo,
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  },
  async listarProjetosPorLaboratorio(laboratorioId: string) {
    const { data } = await http.get<ProjetoSolucao[]>('/v1/projetos/por-laboratorio', { params: { laboratorioId } })
    return data.filter(p => p.ativo)
  },
}

