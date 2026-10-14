export type StatusProjeto =
  | 'ATIVO'
  | 'ENCERRADO_COM_AVALIACAO_PENDENTE'
  | 'CONCLUIDO'

export type SituacaoExecucaoProjeto =
  | 'NAO_INFORMADO'
  | 'EM_ANDAMENTO_NO_PRAZO'
  | 'EM_ANDAMENTO_ATRASADO'
  | 'EXECUCAO_CANCELADA'

export interface ProjetoOperacional {
  id: string
  laboratorioId: string
  laboratorioNome: string
  nome: string
  descricao: string | null
  dataInicio: string | null
  dataFim: string | null
  responsavel: string | null
  codigoSeg: string | null
  status: StatusProjeto
  situacaoExecucao: SituacaoExecucaoProjeto
  possuiRecursoExterno: boolean
  empresaRecursoExterno: string | null
  ativo: boolean
}

/**
 * Consulta de participacoes do Estagiario, derivada do backend na Etapa 7.5.
 * "aberta" representa ausencia de encerramento; "elegivel" e uma regra
 * adicional de contexto para novas solicitacoes (Etapa 8).
 */
export interface ContextoParticipacaoOperacional {
  origem: 'PARTICIPACAO_ESTAGIO'
  participacaoId: string
  vinculoEstagioId: string | null
  usuarioId: string | null
  usuarioNome: string | null
  atividadeId: string | null
  atividadeNome: string | null
  atividadeCodigoSeg: string | null
  sciId: string | null
  sciNome: string | null
  projetoId: string | null
  projetoNome: string | null
  laboratorioId: string | null
  laboratorioNome: string | null
  unidadeId: string | null
  dataInicioParticipacao: string | null
  dataFimParticipacao: string | null
  aberta: boolean
  elegivel: boolean
  motivoInelegibilidade: string | null
}

export interface ProjetoRequest {
  laboratorioId: string
  nome: string
  descricao: string | null
  dataInicio: string | null
  dataFim: string | null
  responsavel: string | null
  codigoSeg: string | null
  status: StatusProjeto
  situacaoExecucao: SituacaoExecucaoProjeto
  possuiRecursoExterno: boolean
  empresaRecursoExterno: string | null
  ativo: boolean
}

export interface SciOperacional {
  id: string
  projetoId: string
  projetoNome: string
  projetoCodigoSeg: string | null
  codigoSeg: string
  nome: string
  responsavel: string | null
  dataInicio: string
  dataFim: string | null
  status: StatusProjeto
  situacaoExecucao: SituacaoExecucaoProjeto
  ativo: boolean
}

export interface AtividadeOperacional {
  id: string
  sciId: string
  sciNome: string
  sciCodigoSeg: string
  projetoId: string
  projetoNome: string
  projetoCodigoSeg: string | null
  codigoSeg: string
  nome: string
  responsavel: string | null
  dataInicio: string
  dataFim: string | null
  status: StatusProjeto
  situacaoExecucao: SituacaoExecucaoProjeto
  ativo: boolean
}


export interface SciRequest {
  projetoId: string
  codigoSeg: string
  nome: string
  responsavel: string | null
  dataInicio: string
  dataFim: string | null
  status: StatusProjeto
  situacaoExecucao: SituacaoExecucaoProjeto
  ativo: boolean
}

export interface AtividadeRequest {
  sciId: string
  codigoSeg: string
  nome: string
  responsavel: string | null
  dataInicio: string
  dataFim: string | null
  status: StatusProjeto
  situacaoExecucao: SituacaoExecucaoProjeto
  ativo: boolean
}


export interface ProrrogacaoRequest {
  usuarioId: string
  novaDataFim: string
  justificativa: string
}

export interface CorrecaoCodigoSegRequest {
  usuarioId: string
  novoCodigoSeg: string
  justificativa: string
}

export interface HistoricoProrrogacao {
  id: string
  usuarioId: string
  usuarioNome: string
  dataFimAnterior: string
  dataFimNova: string
  justificativa: string
  dataHora: string
}

export type TipoAlvoCodigoSeg = 'PROJETO' | 'SCI' | 'ATIVIDADE'

export interface HistoricoCorrecaoCodigoSeg {
  id: string
  tipoAlvo: TipoAlvoCodigoSeg
  alvoId: string
  usuarioId: string
  usuarioNome: string
  codigoAnterior: string
  codigoNovo: string
  justificativa: string
  dataHora: string
}
