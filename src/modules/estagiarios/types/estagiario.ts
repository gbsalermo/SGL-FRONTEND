import type { LaboratorioResumo } from '@/modules/projetos/types/projetos'
import type { CategoriaCargo } from '@/modules/auth/types/session'

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
  atividadeDataInicio: string | null
  atividadeDataFim: string | null
  sciId: string | null
  sciNome: string | null
  projetoId: string | null
  projetoNome: string | null
  projetoDataFim: string | null
  unidadeId: string | null
  /** Laboratórios do projeto da participação; um projeto pode estar em vários. */
  laboratorios: LaboratorioResumo[]
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
  dataFimPrevistaOriginal: string | null
  dataFimEfetiva: string | null
  tipoBolsa: TipoBolsaEstagiario | null
  bolsaId: string | null
  bolsaNome: string | null
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
  laboratorios: LaboratorioResumo[]
  dataInicioEstagio: string | null
  dataFimEstagio: string
  tipoBolsa: TipoBolsaEstagiario | null
  observacao: string | null
  ativo: boolean
  situacaoEstagio: SituacaoEstagio | null
  usuarioAtivo: boolean
  vinculos: VinculoEstagioResponse[]
}

export interface EstagiarioRequest {
  usuarioId: string
  laboratorioIds: string[]
  dataInicioEstagio: string
  dataFimEstagio: string
  tipoBolsa: TipoBolsaEstagiario | null
  bolsaId?: string | null
  observacao: string | null
  ativo: boolean | null
  orientadorId: string
  atividadeId: string
  formacao: FormacaoEstagiario
  formacaoOutro: string | null
  cursoId: string | null
  culturaIds: string[]
}

export interface EstagiarioSemVinculoResponse {
  usuarioId: string
  nome: string
  laboratorios: LaboratorioResumo[]
}

export interface OrientadorElegivelResponse {
  usuarioId: string
  nome: string
  categoriaCargo: CategoriaCargo | null
  cargo: string | null
}


export interface AtividadeDisponivelEstagioResponse {
  id: string
  sciId: string | null
  sciNome: string | null
  projetoId: string | null
  projetoNome: string | null
  codigoSeg: string
  nome: string
  responsavel: string
  dataInicio: string
  dataFim: string | null
  ativo: boolean
}

export interface VinculoEstagioAtividadeRequest {
  atividadeId: string
  dataInicioParticipacao: string
  observacao?: string | null
  culturaIds?: string[]
}


export interface BolsaResponse {
  id: string
  unidadeId: string
  nome: string
  ativo: boolean
}

export interface CriarBolsaRequest {
  nome: string
  ativo?: boolean
}

export interface CursoEstagioResponse {
  id: string
  unidadeId: string
  unidadeNome: string
  nome: string
  ativo: boolean
}

export interface UsuarioOpcaoEstagioResponse {
  id: string
  nome: string
  email: string
  categoriaCargo: CategoriaCargo | null
  unidadeId: string | null
  unidadeNome: string | null
  ativo: boolean
}

export interface AtualizarVinculoEstagioRequest {
  orientadorId: string
  dataInicio: string
  dataFimPrevista: string
  tipoBolsa: TipoBolsaEstagiario | null
  formacao: FormacaoEstagiario
  formacaoOutro?: string | null
  cursoId?: string | null
  observacao?: string | null
}

export interface NovaBolsaVinculoEstagioRequest {
  tipoBolsa: TipoBolsaEstagiario | null
  bolsaId?: string | null
  especificacaoBolsa?: string | null
  dataInicio: string
  dataFimPrevista: string
}

export interface ProrrogarBolsaVinculoEstagioRequest {
  novaDataFimPrevista: string
}


export type TipoObservacaoVinculoEstagio =
  | 'OPERACIONAL'
  | 'TREINAMENTO_SEGURANCA'

export type EventoObservacaoVinculoEstagio =
  | 'OBSERVACAO'
  | 'TREINAMENTO_CONCLUIDO'
  | 'TREINAMENTO_REVERTIDO'

export interface ObservacaoVinculoEstagioResponse {
  id: string
  tipo: TipoObservacaoVinculoEstagio
  evento: EventoObservacaoVinculoEstagio
  texto: string | null
  usuarioId: string
  usuarioNome: string
  dataHora: string
}

export interface ApiErrorResponse {
  message?: string
}
