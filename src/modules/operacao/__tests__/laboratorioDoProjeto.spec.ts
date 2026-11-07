import { describe, expect, it } from 'vitest'

import {
  laboratorioDoProjetoValido, laboratorioInicial, laboratoriosAtivos, laboratoriosOferecidosAoEstagiario,
  nomesDosLaboratorios, precisaEscolherLaboratorio,
} from '@/modules/operacao/laboratorioDoProjeto'

const A = { id: 'A', nome: 'Lab A', ativo: true }
const B = { id: 'B', nome: 'Lab B', ativo: true }

describe('laboratorioDoProjeto', () => {
  it('um laboratório: pré-seleciona e não pede escolha', () => {
    expect(laboratorioInicial([A])).toBe('A')
    expect(precisaEscolherLaboratorio([A])).toBe(false)
  })

  it('vários: não pré-seleciona e pede escolha', () => {
    expect(laboratorioInicial([A, B])).toBe('')
    expect(precisaEscolherLaboratorio([A, B])).toBe(true)
  })

  it('sem laboratórios: nada a pré-selecionar nem escolher', () => {
    expect(laboratorioInicial([])).toBe('')
    expect(precisaEscolherLaboratorio([])).toBe(false)
  })
})

describe('laboratoriosAtivos', () => {
  const INATIVO = { id: 'C', nome: 'Lab C', ativo: false }

  it('descarta laboratórios inativos', () => {
    expect(laboratoriosAtivos([A, INATIVO])).toEqual([A])
  })

  it('1 ativo + 1 inativo: o ativo é pré-selecionado e não pede escolha', () => {
    const ativos = laboratoriosAtivos([INATIVO, A])
    expect(laboratorioInicial(ativos)).toBe('A')
    expect(precisaEscolherLaboratorio(ativos)).toBe(false)
  })
})

describe('laboratorioDoProjetoValido', () => {
  it('mantém a escolha que pertence ao projeto e descarta a que não pertence', () => {
    expect(laboratorioDoProjetoValido([A, B], 'B')).toBe('B')
    expect(laboratorioDoProjetoValido([A], 'B')).toBe('')
  })
})

describe('nomesDosLaboratorios', () => {
  it('marca os inativos para o usuário não achar que ainda atendem o projeto', () => {
    expect(nomesDosLaboratorios([
      { id: 'A', nome: 'Lab A', ativo: true },
      { id: 'C', nome: 'Lab C', ativo: false },
    ])).toBe('Lab A, Lab C (inativo)')
  })

  it('sem laboratórios devolve texto vazio', () => {
    expect(nomesDosLaboratorios([])).toBe('')
  })
})

describe('laboratoriosOferecidosAoEstagiario', () => {
  const INATIVO = { id: 'C', nome: 'Lab C', ativo: false }

  it('oferece só laboratórios ativos do projeto que estão na lista da pessoa', () => {
    expect(laboratoriosOferecidosAoEstagiario([A, B, INATIVO], [B, INATIVO])).toEqual([B])
  })

  it('devolve vazio quando nenhum laboratório do projeto está na lista', () => {
    expect(laboratoriosOferecidosAoEstagiario([A, B], [])).toEqual([])
  })
})
