import { ref } from 'vue'

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
import type {
  RelatorioResiduosFiltros,
  RelatorioResiduosResponse,
} from '@/modules/relatorios/types/residuoRelatorio'
import type {
  RelatorioPessoasLaboratorioFiltros,
  RelatorioPessoasLaboratorioResponse,
} from '@/modules/relatorios/types/pessoasLaboratorioRelatorio'

export type FormatoExportacaoRelatorio = 'PDF' | 'XLSX'
export type TipoRelatorioExportavel =
  | 'estagiarios'
  | 'produtos'
  | 'movimentacoes'
  | 'resumo-operacional'
  | 'estoque-lotes'
  | 'residuos'
  | 'fiscalizacao'
  | 'pessoas-laboratorio'

export interface UltimaConsultaRelatorio {
  tipo: TipoRelatorioExportavel
  filtros: object
}

export const ultimaConsultaRelatorio = ref<UltimaConsultaRelatorio | null>(null)

function registrarConsulta(tipo: TipoRelatorioExportavel, filtros: object) {
  ultimaConsultaRelatorio.value = { tipo, filtros: { ...filtros } }
}

function extrairNomeArquivo(contentDisposition: string | undefined, formato: FormatoExportacaoRelatorio) {
  if (contentDisposition) {
    const utf8 = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
    if (utf8?.[1]) return decodeURIComponent(utf8[1])

    const simples = contentDisposition.match(/filename="?([^";]+)"?/i)
    if (simples?.[1]) return simples[1]
  }
  return `relatorio-sgl.${formato === 'PDF' ? 'pdf' : 'xlsx'}`
}

export const relatorioService = {
  async listarEstagiarios(filtros: RelatorioEstagiariosFiltros = {}) {
    const { data } = await http.get<RelatorioEstagiariosResponse>('/v1/relatorios/estagiarios', { params: filtros })
    registrarConsulta('estagiarios', filtros)
    return data
  },

  async listarMovimentacoes(filtros: RelatorioMovimentacoesFiltros = {}) {
    const { data } = await http.get<RelatorioMovimentacoesResponse>('/v1/relatorios/movimentacoes', { params: filtros })
    registrarConsulta('movimentacoes', filtros)
    return data
  },

  async obterResumoOperacional(filtros: RelatorioResumoOperacionalFiltros = {}) {
    const { data } = await http.get<RelatorioResumoOperacionalResponse>('/v1/relatorios/resumo-operacional', { params: filtros })
    registrarConsulta('resumo-operacional', filtros)
    return data
  },

  async listarProdutos(filtros: RelatorioProdutosFiltros = {}) {
    const { data } = await http.get<RelatorioProdutosResponse>('/v1/relatorios/produtos', { params: filtros })
    registrarConsulta('produtos', filtros)
    return data
  },

  async listarEstoqueLotes(filtros: RelatorioEstoqueLotesFiltros = {}) {
    const { data } = await http.get<RelatorioEstoqueLotesResponse>('/v1/relatorios/estoque-lotes', { params: filtros })
    registrarConsulta('estoque-lotes', filtros)
    return data
  },

  async listarResiduos(filtros: RelatorioResiduosFiltros = {}) {
    const { data } = await http.get<RelatorioResiduosResponse>('/v1/relatorios/residuos', { params: filtros })
    registrarConsulta('residuos', filtros)
    return data
  },

  async listarFiscalizacao(filtros: RelatorioFiscalizacaoFiltros = {}) {
    const { data } = await http.get<RelatorioFiscalizacaoResponse>('/v1/relatorios/fiscalizacao', { params: filtros })
    registrarConsulta('fiscalizacao', filtros)
    return data
  },

  async listarPessoasLaboratorio(filtros: RelatorioPessoasLaboratorioFiltros) {
    const { data } = await http.get<RelatorioPessoasLaboratorioResponse>('/v1/relatorios/pessoas-laboratorio', {
      params: filtros,
    })
    registrarConsulta('pessoas-laboratorio', filtros)
    return data
  },

  async exportar(
    tipo: TipoRelatorioExportavel,
    formato: FormatoExportacaoRelatorio,
    filtros: object = {},
  ) {
    const response = await http.get<Blob>(`/v1/relatorios/${tipo}/exportar`, {
      params: { ...filtros, formato },
      responseType: 'blob',
    })

    return {
      blob: response.data,
      nomeArquivo: extrairNomeArquivo(response.headers['content-disposition'], formato),
    }
  },
}
