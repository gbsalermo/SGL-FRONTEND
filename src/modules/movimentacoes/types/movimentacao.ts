export type TipoMovimentacao = 'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'DEVOLUCAO' | 'DESCARTE_VENCIMENTO'

export type OrigemMovimentacao = 'PEDIDO' | 'COMPRA' | 'AJUSTE' | 'DEVOLUCAO' | 'INVENTARIO' | 'DESCARTE'

export interface MovimentacaoEstoqueResponse {
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
  tipoMovimentacao: TipoMovimentacao
  origem: OrigemMovimentacao
  quantidadeMovimentada: number
  quantidadeAnterior: number
  quantidadeAtual: number
  dataMovimentacao: string
  observacao: string | null
}
