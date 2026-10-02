export type TipoBolsaEstagiario =
  | 'BOLSA_CNPQ'
  | 'BOLSA_CAPES'
  | 'BOLSA_INSTITUCIONAL'
  | 'VOLUNTARIO'
  | 'CONTRATUAL'

export type SituacaoEstagio =
  | 'EM_ANDAMENTO'
  | 'PRORROGADO'
  | 'FINALIZADO'

export type FormacaoEstagiario =
  | 'ENSINO_MEDIO'
  | 'GRADUACAO'
  | 'MESTRADO'
  | 'DOUTORADO'
  | 'POS_DOUTORADO'
  | 'APOIO_ADMINISTRATIVO'
  | 'APOIO_TECNICO'
  | 'OUTRO'

export interface CulturaEstagioResponse {
  id: string
  unidadeId: string | null
  unidadeNome: string | null
  nome: string
  ativo: boolean
}

export interface VinculoEstagioAtividadeResponse {
  id: string
  vinculoEstagioId: string
  atividadeId: string | null
  atividadeNome: string | null
  atividadeCodigoSeg: string | null
  sciId: string | null
  sciNome: string | null
  projetoId: string | null
  projetoNome: string | null
  laboratorioId: string | null
  laboratorioNome: string | null
  dataInicioParticipacao: string
  dataFimParticipacao: string | null
  observacao: string | null
  ativa: boolean
  culturas: CulturaEstagioResponse[]
}

export interface VinculoEstagioResponse {
  id: string
  orientadorId: string | null
  orientadorNome: string | null
  dataInicio: string
  dataFimPrevista: string | null
  dataFimEfetiva: string | null
  tipoBolsa: TipoBolsaEstagiario
  situacao: SituacaoEstagio
  participacoesAtividade: VinculoEstagioAtividadeResponse[]
  formacao: FormacaoEstagiario | null
  formacaoOutro: string | null
  cursoId: string | null
  cursoNome: string | null
  treinamentoSegurancaConcluido: boolean
  observacao: string | null
  referenciaInstitucional: string | null
}

export interface EstagiarioResponse {
  id: string
  usuarioId: string
  usuarioNome: string
  unidadeId: string | null
  unidadeNome: string | null

  /**
   * Campos legados de compatibilidade. Não representam o contexto operacional
   * definitivo do Estagiário no 6.5.
   */
  laboratorioId: string | null
  laboratorioNome: string | null
  dataInicioEstagio: string | null
  dataFimEstagio: string | null
  tipoBolsa: TipoBolsaEstagiario | null
  observacao: string | null
  ativo: boolean
  situacaoEstagio: SituacaoEstagio | null
  usuarioAtivo: boolean
  vinculos: VinculoEstagioResponse[]
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
