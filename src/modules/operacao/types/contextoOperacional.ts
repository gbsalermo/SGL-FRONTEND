/**
 * Contrato de leitura da Etapa 7.5.2.
 * A origem PARTICIPACAO_ESTAGIO e a unica atualmente retornada pela API.
 * Outros perfis exigem contrato backend proprio na Etapa 8.
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

/**
 * Dados do contexto escolhido para apresentacao/confirmacao na UI.
 * A futura API de criacao de Pedido deve receber a participacaoId e
 * DERIVAR/VALIDAR o restante no servidor, nunca confiar nestes campos do navegador.
 */
export interface ContextoEstagioResolvido {
  participacaoId: string
  atividadeId: string
  sciId: string
  projetoId: string
  laboratorioId: string
  unidadeId: string
}

export type SituacaoSelecaoContexto =
  | 'SEM_CONTEXTO_ELEGIVEL'
  | 'PRE_SELECIONAVEL'
  | 'ESCOLHA_OBRIGATORIA'

export interface OpcoesSelecaoContexto {
  situacao: SituacaoSelecaoContexto
  contextosElegiveis: ContextoParticipacaoOperacional[]
  participacaoSugeridaId: string | null
}

/**
 * Prepara as opcoes exibiveis de um Estagiario.
 *
 * IMPORTANTE:
 * - "aberta" nao basta: a elegibilidade vem do backend.
 * - Sem contexto: nao retornar ao laboratorio legado do usuario.
 * - Uma opcao: permite pre-selecao; mais de uma: escolha explicita.
 * - Filtros aqui servem apenas a interface; o backend DEVE revalidar
 *   o contexto no momento da criacao do Pedido (Etapa 8).
 */
export function prepararSelecaoContextoEstagiario(
  contextos: readonly ContextoParticipacaoOperacional[],
  unidadeId: string,
): OpcoesSelecaoContexto {
  const ids = new Set<string>()
  const contextosElegiveis = contextos.filter((contexto) => {
    if (
      contexto.origem !== 'PARTICIPACAO_ESTAGIO'
      || !contexto.elegivel
      || !contexto.participacaoId
      || !contexto.atividadeId
      || !contexto.sciId
      || !contexto.projetoId
      || !contexto.laboratorioId
      || !unidadeId
      || contexto.unidadeId !== unidadeId
      || ids.has(contexto.participacaoId)
    ) return false
    ids.add(contexto.participacaoId)
    return true
  })

  if (contextosElegiveis.length === 0) {
    return { situacao: 'SEM_CONTEXTO_ELEGIVEL', contextosElegiveis, participacaoSugeridaId: null }
  }
  if (contextosElegiveis.length === 1) {
    return {
      situacao: 'PRE_SELECIONAVEL',
      contextosElegiveis,
      participacaoSugeridaId: contextosElegiveis[0]!.participacaoId,
    }
  }
  return { situacao: 'ESCOLHA_OBRIGATORIA', contextosElegiveis, participacaoSugeridaId: null }
}

/** Resolve apenas uma selecao explicitamente elegivel na Unidade corrente. */
export function resolverContextoEstagiario(
  opcoes: OpcoesSelecaoContexto,
  participacaoId: string,
  unidadeId: string,
): ContextoEstagioResolvido | null {
  if (!participacaoId || !unidadeId) return null
  const contexto = opcoes.contextosElegiveis.find((item) =>
    item.elegivel && item.participacaoId === participacaoId && item.unidadeId === unidadeId,
  )
  if (!contexto?.atividadeId || !contexto.sciId || !contexto.projetoId || !contexto.laboratorioId) {
    return null
  }

  return {
    participacaoId: contexto.participacaoId,
    atividadeId: contexto.atividadeId,
    sciId: contexto.sciId,
    projetoId: contexto.projetoId,
    laboratorioId: contexto.laboratorioId,
    unidadeId,
  }
}
