import { describe, expect, it } from 'vitest'

import {
  laboratorioDoProjetoValido, laboratorioInicial, laboratoriosAtivos, precisaEscolherLaboratorio,
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
