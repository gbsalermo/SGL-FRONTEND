import { describe, expect, it } from 'vitest'

import {
  laboratorioDoProjetoValido, laboratorioInicial, precisaEscolherLaboratorio,
} from '@/modules/operacao/laboratorioDoProjeto'

const A = { id: 'A', nome: 'Lab A' }
const B = { id: 'B', nome: 'Lab B' }

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

describe('laboratorioDoProjetoValido', () => {
  it('mantém a escolha que pertence ao projeto e descarta a que não pertence', () => {
    expect(laboratorioDoProjetoValido([A, B], 'B')).toBe('B')
    expect(laboratorioDoProjetoValido([A], 'B')).toBe('')
  })
})
