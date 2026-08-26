export type StatusPedido =
  | 'PENDENTE'
  | 'APROVADO'
  | 'REJEITADO'
  | 'ENTREGUE'
  | 'CANCELADO'

export interface ItemPedidoResponse {
  id: string
  produtoId: string
  produtoNome: string
  produtoUnidadeArmazenamento: string
  quantidadeSolicitada: number
  quantidadeAprovada: number | null
}

export interface PedidoResponse {
  id: string
  usuarioId: string
  usuarioNome: string
  laboratorioId: string
  laboratorioNome: string
  projetoId: string | null
  projetoNome: string | null
  dataSolicitacao: string
  status: StatusPedido
  urgente: boolean
  motivoUrgencia: string | null
  observacao: string | null
  arquivoDocumento: string | null
  itens: ItemPedidoResponse[]
}

export interface PedidoRequest {
  usuarioId: string
  laboratorioId: string
  projetoId: string | null
  urgente: boolean
  motivoUrgencia: string | null
  observacao: string | null
  arquivoDocumento: string | null
  itens: Array<{
    produtoId: string
    quantidadeSolicitada: number
  }>
}

export interface ProjetoResponse {
  id: string
  laboratorioId: string
  laboratorioNome: string
  nome: string
  descricao: string | null
  dataInicio: string
  dataFim: string | null
  responsavel: string | null
  ativo: boolean
}

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

export interface ApiErrorResponse {
  timestamp?: string
  status?: number
  error?: string
  message?: string
  path?: string
  fieldErrors?: Record<string, string> | null
}
