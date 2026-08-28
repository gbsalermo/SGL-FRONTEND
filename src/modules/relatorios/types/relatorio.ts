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
