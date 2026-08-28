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

export interface RelatorioResumoProdutoRanking {
  produtoId: string
  produtoNome: string
  quantidade: number
  movimentacoes: number
}

export interface RelatorioResumoLoteRanking {
  loteId: string
  codigoInterno: string | null
  numeroLote: string | null
  produtoId: string | null
  produtoNome: string | null
  quantidadeMovimentada: number
  movimentacoes: number
  quantidadeEntradas: number
  quantidadeSaidas: number
  saldoAtual: number
  dataValidade: string | null
}

export interface RelatorioResumoOperacionalResponse {
  geradoEm: string
  totalMovimentacoes: number
  quantidadeEntradas: number
  quantidadeSaidas: number
  quantidadeDescartes: number
  produtosMovimentados: number
  lotesMovimentados: number
  principaisEntradas: RelatorioResumoProdutoRanking[]
  principaisSaidas: RelatorioResumoProdutoRanking[]
  lotesMaisMovimentados: RelatorioResumoLoteRanking[]
}

export interface RelatorioResumoOperacionalFiltros {
  produtoId?: string
  dataInicio?: string
  dataFim?: string
  limite?: number
}

export type NivelRiscoRelatorio = 'NENHUM' | 'BAIXO' | 'MEDIO' | 'ALTO'

export type OrgaoFiscalizadorRelatorio =
  | 'POLICIA_FEDERAL'
  | 'VIGILANCIA_SANITARIA'
  | 'ANVISA'
  | 'EXERCITO'
  | 'OUTRO'

export interface RelatorioProdutoItem {
  id: string
  nome: string
  descricao: string | null
  codigoReferencia: string | null
  unidadeMedida: string
  localizacaoFisica: string | null
  risco: NivelRiscoRelatorio
  tipoRisco: string | null
  descricaoRisco: string | null
  perecivel: boolean
  tipoPerecivel: string | null
  condicoesArmazenamento: string | null
  unidadeArmazenamento: string | null
  fiscalizado: boolean
  orgaosFiscalizadores: OrgaoFiscalizadorRelatorio[]
  observacaoFiscalizacao: string | null
  ativo: boolean
}

export interface RelatorioProdutosResponse {
  geradoEm: string
  total: number
  ativos: number
  inativos: number
  fiscalizados: number
  pereciveis: number
  comRisco: number
  itens: RelatorioProdutoItem[]
}

export interface RelatorioProdutosFiltros {
  ativo?: boolean
  fiscalizado?: boolean
  perecivel?: boolean
  risco?: NivelRiscoRelatorio
  orgaoFiscalizador?: OrgaoFiscalizadorRelatorio
}

export type SituacaoLoteRelatorio =
  | 'VALIDO'
  | 'PROXIMO_VENCIMENTO'
  | 'VENCIDO'
  | 'SEM_VALIDADE'
  | 'ESGOTADO'
  | 'INATIVO'

export interface RelatorioEstoqueItem {
  estoqueId: string
  unidadeId: string
  unidadeNome: string
  unidadeSigla: string | null
  produtoId: string
  produtoNome: string
  codigoReferencia: string | null
  unidadeMedida: string
  quantidadeAtual: number
  quantidadeMinima: number
  abaixoMinimo: boolean
  ativo: boolean
  totalLotes: number
  lotesAtivos: number
  lotesVencidos: number
  lotesProximosVencimento: number
}

export interface RelatorioLoteItem {
  loteId: string
  estoqueId: string
  unidadeId: string
  unidadeNome: string
  produtoId: string
  produtoNome: string
  codigoInterno: string
  numeroLote: string | null
  quantidadeInicial: number
  quantidadeDisponivel: number
  dataEntrada: string
  dataValidade: string | null
  ativo: boolean
  situacao: SituacaoLoteRelatorio
}

export interface RelatorioEstoqueLotesResponse {
  geradoEm: string
  totalEstoques: number
  estoquesAtivos: number
  estoquesAbaixoMinimo: number
  quantidadeTotalEstoque: number
  totalLotes: number
  lotesAtivos: number
  lotesVencidos: number
  lotesProximosVencimento: number
  lotesEsgotados: number
  estoques: RelatorioEstoqueItem[]
  lotes: RelatorioLoteItem[]
}

export interface RelatorioEstoqueLotesFiltros {
  unidadeId?: string
  produtoId?: string
  ativoEstoque?: boolean
  abaixoMinimo?: boolean
  ativoLote?: boolean
  validade?: SituacaoLoteRelatorio
  diasVencimento?: number
}

export interface RelatorioFiscalizacaoProduto {
  produtoId: string
  produtoNome: string
  codigoReferencia: string | null
  orgaosFiscalizadores: OrgaoFiscalizadorRelatorio[]
  observacaoFiscalizacao: string | null
  saldoAtual: number
  lotesAtivos: number
  lotesVencidos: number
  lotesProximosVencimento: number
  proximoVencimento: string | null
  quantidadeEntradas: number
  quantidadeSaidas: number
}

export interface RelatorioFiscalizacaoMovimentacao {
  movimentacaoId: string
  dataMovimentacao: string
  produtoId: string
  produtoNome: string
  tipoMovimentacao: TipoMovimentacaoRelatorio
  quantidadeMovimentada: number
  loteId: string | null
  codigoInternoLote: string | null
  numeroLote: string | null
  dataValidadeLote: string | null
  laboratorioId: string | null
  laboratorioNome: string | null
  projetoId: string | null
  projetoNome: string | null
  solicitanteId: string | null
  solicitanteNome: string | null
  pedidoId: string | null
  responsavelId: string
  responsavelNome: string
  saldoAposMovimentacao: number
}

export interface RelatorioFiscalizacaoResponse {
  geradoEm: string
  totalProdutosFiscalizados: number
  saldoAtualTotal: number
  lotesAtivos: number
  lotesVencidos: number
  lotesProximosVencimento: number
  quantidadeEntradas: number
  quantidadeSaidas: number
  produtos: RelatorioFiscalizacaoProduto[]
  movimentacoes: RelatorioFiscalizacaoMovimentacao[]
}

export interface RelatorioFiscalizacaoFiltros {
  produtoId?: string
  orgaoFiscalizador?: OrgaoFiscalizadorRelatorio
  unidadeId?: string
  dataInicio?: string
  dataFim?: string
  diasVencimento?: number
}
