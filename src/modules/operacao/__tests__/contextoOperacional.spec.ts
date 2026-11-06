import { describe, expect, it } from 'vitest'

import {
  prepararSelecaoContextoEstagiario,
  resolverContextoEstagiario,
  type ContextoParticipacaoOperacional,
} from '@/modules/operacao/types/contextoOperacional'

function contexto(sobrescrever: Partial<ContextoParticipacaoOperacional> = {}): ContextoParticipacaoOperacional {
  return {
    origem: 'PARTICIPACAO_ESTAGIO',
    participacaoId: 'part-1', vinculoEstagioId: 'v-1', usuarioId: 'u-1', usuarioNome: 'Estagiária',
    atividadeId: 'at-1', atividadeNome: 'Atividade', atividadeCodigoSeg: null,
    sciId: 'sci-1', sciNome: 'SCI', projetoId: 'proj-1', projetoNome: 'Projeto',
    laboratorios: [{ id: 'A', nome: 'Lab A', ativo: true }, { id: 'B', nome: 'Lab B', ativo: true }],
    unidadeId: 'unidade-1', dataInicioParticipacao: '2026-01-01', dataFimParticipacao: null,
    aberta: true, elegivel: true, motivoInelegibilidade: null,
    ...sobrescrever,
  }
}

describe('contextoOperacional', () => {
  it('aceita contexto com a lista de laboratórios do projeto', () => {
    const opcoes = prepararSelecaoContextoEstagiario([contexto()], 'unidade-1')

    expect(opcoes.situacao).toBe('PRE_SELECIONAVEL')
    expect(resolverContextoEstagiario(opcoes, 'part-1', 'unidade-1')?.laboratorios)
      .toEqual([{ id: 'A', nome: 'Lab A', ativo: true }, { id: 'B', nome: 'Lab B', ativo: true }])
  })

  it('descarta contexto cujo projeto não tem laboratório', () => {
    const opcoes = prepararSelecaoContextoEstagiario([contexto({ laboratorios: [] })], 'unidade-1')

    expect(opcoes.situacao).toBe('SEM_CONTEXTO_ELEGIVEL')
  })
})
