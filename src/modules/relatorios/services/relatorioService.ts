import { http } from '@/services/http'
import type {
  RelatorioEstagiariosFiltros,
  RelatorioEstagiariosResponse,
  RelatorioEstoqueLotesFiltros,
  RelatorioEstoqueLotesResponse,
  RelatorioFiscalizacaoFiltros,
  RelatorioFiscalizacaoResponse,
  RelatorioMovimentacoesFiltros,
  RelatorioMovimentacoesResponse,
  RelatorioProdutosFiltros,
  RelatorioProdutosResponse,
  RelatorioResumoOperacionalFiltros,
  RelatorioResumoOperacionalResponse,
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

  async obterResumoOperacional(filtros: RelatorioResumoOperacionalFiltros = {}) {
    const { data } = await http.get<RelatorioResumoOperacionalResponse>('/v1/relatorios/resumo-operacional', {
      params: filtros,
    })
    return data
  },

  async listarProdutos(filtros: RelatorioProdutosFiltros = {}) {
    const { data } = await http.get<RelatorioProdutosResponse>('/v1/relatorios/produtos', {
      params: filtros,
    })
    return data
  },

  async listarEstoqueLotes(filtros: RelatorioEstoqueLotesFiltros = {}) {
    const { data } = await http.get<RelatorioEstoqueLotesResponse>('/v1/relatorios/estoque-lotes', {
      params: filtros,
    })
    return data
  },

  async listarFiscalizacao(filtros: RelatorioFiscalizacaoFiltros = {}) {
    const { data } = await http.get<RelatorioFiscalizacaoResponse>('/v1/relatorios/fiscalizacao', {
      params: filtros,
    })
    return data
  },
}
