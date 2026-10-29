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
  unidadeNome: string
  unidadeSigla: string
  laboratorioId: string
  laboratorioNome: string
  projetoId: string | null
  projetoNome: string | null
  projetoSemVinculoDireto?: boolean
  participacaoId?: string | null
  atividadeOrigemId?: string | null
  atividadeOrigemNome?: string | null
  sciOrigemId?: string | null
  sciOrigemNome?: string | null
  projetoOrigemNome?: string | null
  laboratorioOrigemNome?: string | null
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
  participacaoId?: string
  laboratorioId?: string
  projetoId?: string | null
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
  usuarioNome: string
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
    const axiosLike = erro as {
      response?: { data?: {
        message?: string
        fieldErrors?: Array<{ field: string; message: string }> | Record<string, string>
      } }
    }
    const api = axiosLike.response?.data
    const fields = api?.fieldErrors
    const detalhes = Array.isArray(fields)
      ? fields.map(item => item.message || item.field).filter(Boolean)
      : Object.values(fields || {}).filter(Boolean)
    // A API devolve uma mensagem generica para erro de validacao; priorizar
    // os detalhes de cada campo, sem ocultar a causa real da recusa.
    return detalhes.length > 0 ? detalhes.join('; ') :
      api?.message || 'Não foi possível concluir a operação.'
  }
  return erro instanceof Error ? erro.message : 'Não foi possível concluir a operação.'
}
export function exibirQuantidade(valor: number | null | undefined) {
  return Number(valor ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 6 })
}

