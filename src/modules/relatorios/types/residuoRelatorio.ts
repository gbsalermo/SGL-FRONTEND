import type {
  NivelRiscoResiduo,
  ResiduoResponse,
  StatusResiduo,
} from '@/modules/residuos/types/residuo'

export interface RelatorioResiduosResponse {
  geradoEm: string
  total: number
  informados: number
  emAnalise: number
  liberados: number
  armazenados: number
  despachados: number
  altoRisco: number
  itens: ResiduoResponse[]
}

export interface RelatorioResiduosFiltros {
  status?: StatusResiduo
  laboratorioId?: string
  nivelRisco?: NivelRiscoResiduo
  dataInicio?: string
  dataFim?: string
}
