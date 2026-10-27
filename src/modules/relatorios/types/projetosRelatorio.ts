export interface RelatorioProjetosFiltros {
  laboratorioId?: string
  status?: string
  situacaoExecucao?: string
  ativo?: boolean
  recursoExterno?: boolean
  dataInicio?: string
  dataFim?: string
}

export interface RelatorioProjetoItem {
  id: string
  codigoSeg: string | null
  nome: string
  laboratorioId: string
  laboratorioNome: string
  responsavel: string | null
  dataInicio: string | null
  dataFim: string | null
  status: string
  situacaoExecucao: string
  ativo: boolean
  possuiRecursoExterno: boolean
  empresaRecursoExterno: string | null
  totalScis: number
  totalAtividades: number
  totalParticipacoes: number
  totalEstagiarios: number
}

export interface RelatorioProjetosResponse {
  geradoEm: string
  totalProjetos: number
  totalScis: number
  totalAtividades: number
  totalParticipacoes: number
  totalEstagiariosDistintos: number
  projetos: RelatorioProjetoItem[]
}
