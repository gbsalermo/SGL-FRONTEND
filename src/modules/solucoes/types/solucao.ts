export type UnidadeSolucao = 'ML' | 'L' | 'MG' | 'G' | 'KG' | 'METRO' | 'UNIDADE' | 'REACAO'
export type StatusSolucao = 'PENDENTE' | 'EM_PREPARACAO' | 'ENTREGUE' | 'REJEITADO' | 'CANCELADO'
export type UnidadeProduto = { id: string; nome: string; unidadeMedida: UnidadeSolucao; quantidadeAtual: number; ativo: boolean }
export interface ComponenteSolucao {
  id: string
  produtoId: string
  produtoNome: string
  quantidade: number
  unidadeMedida: UnidadeSolucao
  quantidadeCanonica: number
  unidadeCanonica: UnidadeSolucao
  ordem: number
}
export interface ModeloSolucao {
  id: string
  unidadeId: string
  nome: string
  descricao: string | null
  instrucoesPreparo: string | null
  ativo: boolean
  componentes: ComponenteSolucao[]
}
export interface ComponenteModeloInput { produtoId: string; quantidade: number; unidadeMedida: UnidadeSolucao }
export interface ModeloSolucaoInput {
  unidadeId: string
  nome: string
  descricao: string | null
  instrucoesPreparo: string | null
  ativo: boolean
  componentes: ComponenteModeloInput[]
}
export interface ItemSolucao {
  id: string
  produtoId: string
  produtoNome: string
  quantidadeSolicitada: number
  quantidadeAprovada: number | null
  unidadeMedidaSolicitada: UnidadeSolucao | null
  quantidadeNaUnidadeSolicitada: number | null
}
export interface PedidoSolucao {
  id: string
  tipo: 'SOLUCAO'
  nomeSolucao: string
  instrucoesPreparoSolucao?: string | null
  modeloSolucaoId: string | null
  usuarioId: string
  usuarioNome: string
  unidadeId: string
  laboratorioId: string
  laboratorioNome: string
  projetoId: string | null
  projetoNome: string | null
  dataSolicitacao: string
  dataEntrega: string | null
  status: StatusSolucao
  observacao: string | null
  urgente: boolean
  solucaoPreparadaNoCancelamento: boolean | null
  estoqueRevertidoNoCancelamento: boolean | null
  itens: ItemSolucao[]
}
export interface SolucaoInput {
  tipo: 'SOLUCAO'
  usuarioId: string
  laboratorioId: string
  projetoId: string
  nomeSolucao?: string
  modeloSolucaoId?: string
  urgente: boolean
  observacao: string | null
  motivoUrgencia: null
  arquivoDocumento: null
  itens: ComponenteModeloInput[]
}
export interface MovimentacaoSolucao {
  id: string
  pedidoId: string | null
  produtoId: string
  produtoNome: string
  numeroLote: string | null
  codigoInternoLote: string | null
  quantidadeMovimentada: number
  tipoMovimentacao: string
  dataMovimentacao: string
}
export interface ProjetoSolucao { id: string; nome: string; laboratorioId: string; ativo: boolean }
export const UNIDADES_SOLUCAO: UnidadeSolucao[] = ['ML','L','MG','G','KG','METRO','UNIDADE','REACAO']
export const statusSolucaoLabel: Record<StatusSolucao, string> = {
  PENDENTE: 'Pendente', EM_PREPARACAO: 'Em preparação', ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado', REJEITADO: 'Rejeitado',
}
export function unidadesCompativeis(base?: string): UnidadeSolucao[] {
  if (!base) return []
  if (base === 'ML' || base === 'L') return ['ML','L']
  if (base === 'MG' || base === 'G' || base === 'KG') return ['MG','G','KG']
  return UNIDADES_SOLUCAO.filter(unidade => unidade === base)
}
export function erroSolucao(erro: unknown): string {
  if (typeof erro === 'object' && erro !== null && 'response' in erro) {
    const axiosLike = erro as { response?: { data?: { message?: string; fieldErrors?: Record<string, string> } } }
    const api = axiosLike.response?.data
    return api?.message || Object.values(api?.fieldErrors || {}).join('; ') || 'Não foi possível concluir a operação.'
  }
  return erro instanceof Error ? erro.message : 'Não foi possível concluir a operação.'
}
export function exibirQuantidade(valor: number | null | undefined) {
  return Number(valor ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 6 })
}

