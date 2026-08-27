export interface EstoqueCentralResponse {
  id: string
  unidadeId: string
  unidadeNome: string
  unidadeSigla: string
  produtoId: string
  produtoNome: string
  produtoUnidadeArmazenamento: string
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
  numeroLote: string
  quantidadeInicial: number
  quantidadeDisponivel: number
  dataEntrada: string
  dataValidade: string | null
  ativo: boolean
}

export interface EntradaLoteRequest {
  numeroLote: string
  quantidade: number
  dataValidade: string | null
  origem: string
  observacao: string | null
}

export interface DescarteProdutoRequest {
  quantidade: number
  justificativa: string
}
