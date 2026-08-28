export interface RelatorioEstagiarioItem {
  id: string
  nome: string
  email: string
  laboratorioId: string | null
  laboratorioNome: string | null
  unidadeNome: string | null
  dataInicioEstagio: string
  dataFimEstagio: string | null
  tipoBolsa: string
  ativo: boolean
  observacao: string | null
}

export interface RelatorioEstagiariosResponse {
  geradoEm: string
  total: number
  ativos: number
  inativos: number
  itens: RelatorioEstagiarioItem[]
}

export interface RelatorioEstagiariosFiltros {
  ativo?: boolean
  laboratorioId?: string
  dataInicio?: string
  dataFim?: string
}

export type TipoMovimentacaoRelatorio =
  | 'ENTRADA'
  | 'SAIDA'
  | 'AJUSTE'
  | 'DEVOLUCAO'
  | 'DESCARTE_VENCIMENTO'

export type OrigemMovimentacaoRelatorio =
  | 'PEDIDO'
  | 'COMPRA'
  | 'AJUSTE'
  | 'DEVOLUCAO'
  | 'INVENTARIO'
  | 'DESCARTE'

export interface RelatorioMovimentacaoItem {
  id: string
  produtoId: string
  produtoNome: string
  laboratorioId: string | null
  laboratorioNome: string | null
  usuarioId: string
  usuarioNome: string
  estoqueCentralId: string
  pedidoId: string | null
  pedidoSolicitanteNome: string | null
  loteId: string | null
  codigoInternoLote: string | null
  numeroLote: string | null
  tipoMovimentacao: TipoMovimentacaoRelatorio
  origem: OrigemMovimentacaoRelatorio
  quantidadeMovimentada: number
  quantidadeAnterior: number
  quantidadeAtual: number
  dataMovimentacao: string
  observacao: string | null
}

export interface RelatorioMovimentacoesResponse {
  geradoEm: string
  totalMovimentacoes: number
  quantidadeEntradas: number
  quantidadeSaidas: number
  quantidadeAjustes: number
  quantidadeDevolucoes: number
  quantidadeDescartes: number
  itens: RelatorioMovimentacaoItem[]
}

export interface RelatorioMovimentacoesFiltros {
  tipo?: TipoMovimentacaoRelatorio
  origem?: OrigemMovimentacaoRelatorio
  produtoId?: string
  laboratorioId?: string
  usuarioId?: string
  loteId?: string
  dataInicio?: string
  dataFim?: string
}
