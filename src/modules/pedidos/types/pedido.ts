export type StatusPedido =
  | 'PENDENTE'
  | 'APROVADO'
  | 'REJEITADO'
  | 'ENTREGUE'
  | 'CANCELADO'

export type TipoEmbalagemPedido = 'UNITARIO' | 'KIT' | 'CAIXA' | 'GARRAFA' | 'GALAO'

export interface ItemPedidoResponse {
  id: string
  produtoId: string
  produtoNome: string
  produtoUnidadeArmazenamento: string
  produtoRisco: string | null
  produtoTipoRisco: string | null
  produtoDescricaoRisco: string | null
  produtoPerecivel: boolean
  produtoTipoPerecivel: string | null
  produtoCondicoesArmazenamento: string | null
  quantidadeSolicitada: number
  quantidadeAprovada: number | null
  tipoEmbalagemSolicitada: TipoEmbalagemPedido
  quantidadeEmbalagensSolicitada: number
  multiplicadorSolicitado: number
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
    tipoEmbalagemSolicitada: TipoEmbalagemPedido
    quantidadeEmbalagensSolicitada: number
    multiplicadorSolicitado: number
  }>
}

export interface AprovarPedidoRequest {
  observacao: string | null
  usuarioAprovadorId: string
  itens: Array<{
    itemId: string
    quantidadeAprovada: number
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

export interface LotePedidoResponse {
  id: string
  estoqueCentralId: string
  codigoInterno: string
  numeroLote: string
  tipoEmbalagem: TipoEmbalagemPedido
  apresentacao: string | null
  quantidadeApresentacoes: number | null
  conteudoPorApresentacao: number | null
  fracionavel: boolean | null
  quantidadeDisponivel: number
  dataValidade: string | null
  ativo: boolean
}

export interface MovimentacaoPedidoResponse {
  id: string
  produtoId: string
  produtoNome: string
  pedidoId: string | null
  pedidoSolicitanteNome: string | null
  loteId: string | null
  codigoInternoLote: string | null
  numeroLote: string | null
  tipoMovimentacao: string
  quantidadeMovimentada: number
  dataMovimentacao: string
  usuarioNome: string
}

export interface ApiErrorResponse {
  timestamp?: string
  status?: number
  error?: string
  message?: string
  path?: string
  fieldErrors?: Record<string, string> | null
}
