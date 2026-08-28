export interface EstoqueCentralResponse {
  id: string
  unidadeId: string
  unidadeNome: string
  unidadeSigla: string
  produtoId: string
  produtoNome: string
  produtoCodigoReferencia: string | null
  produtoLocalizacaoFisica: string | null
  produtoUnidadeArmazenamento: string
  produtoUnidadeMedida: string
  quantidadeAtual: number
  quantidadeMinima: number
  ativo: boolean
}

export interface LoteResponse {
  id: string
  estoqueCentralId: string
  produtoId: string
  produtoNome: string
  unidadeId: string
  unidadeNome: string
  codigoInterno: string
  numeroLote: string
  apresentacao: string | null
  quantidadeApresentacoes: number | null
  conteudoPorApresentacao: number | null
  fracionavel: boolean | null
  observacao: string | null
  unidadeBase: string
  quantidadeInicial: number
  quantidadeDisponivel: number
  dataEntrada: string
  dataValidade: string | null
  ativo: boolean
}

export interface EntradaLoteRequest {
  numeroLote: string
  apresentacao: string | null
  quantidade: number
  conteudoPorApresentacao: number
  fracionavel: boolean
  dataValidade: string | null
  origem: string
  observacao: string | null
}

export interface AtualizarLoteRequest {
  numeroLote: string
  apresentacao: string | null
  fracionavel: boolean
  observacao: string | null
  dataValidade: string | null
  ativo: boolean
}

export interface DescarteProdutoRequest {
  quantidade: number
  justificativa: string
}
