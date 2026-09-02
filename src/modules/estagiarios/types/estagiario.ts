export type TipoBolsaEstagiario =
  | 'BOLSA_CNPQ'
  | 'BOLSA_CAPES'
  | 'BOLSA_INSTITUCIONAL'
  | 'VOLUNTARIO'
  | 'CONTRATUAL'

export interface EstagiarioResponse {
  id: string
  usuarioId: string
  usuarioNome: string
  laboratorioId: string | null
  laboratorioNome: string | null
  dataInicioEstagio: string
  dataFimEstagio: string | null
  tipoBolsa: TipoBolsaEstagiario
  observacao: string | null
  ativo: boolean
}

export interface EstagiarioRequest {
  usuarioId: string
  laboratorioId: string
  dataInicioEstagio: string
  dataFimEstagio: string | null
  tipoBolsa: TipoBolsaEstagiario
  observacao: string | null
  ativo: boolean | null
}

export interface ApiErrorResponse {
  message?: string
}
