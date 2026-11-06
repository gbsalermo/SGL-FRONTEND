import { describe, expect, it } from 'vitest'

import { atuaNoLaboratorio, nomesDosLaboratoriosDaPessoa } from '@/modules/operacao/laboratoriosDaPessoa'
import type { LaboratorioResumo } from '@/modules/projetos/types/projetos'

const solos: LaboratorioResumo = { id: 'A', nome: 'Solos', ativo: true }
const aguas: LaboratorioResumo = { id: 'B', nome: 'Águas', ativo: true }
const antigo: LaboratorioResumo = { id: 'C', nome: 'Antigo', ativo: false }

describe('atuaNoLaboratorio', () => {
  it('reconhece um laboratório da lista', () => {
    expect(atuaNoLaboratorio([solos, aguas], 'B')).toBe(true)
  })

  it('recusa um laboratório fora da lista', () => {
    expect(atuaNoLaboratorio([solos], 'B')).toBe(false)
  })
})

describe('nomesDosLaboratoriosDaPessoa', () => {
  it('une os nomes por vírgula e marca o inativo', () => {
    expect(nomesDosLaboratoriosDaPessoa([solos, antigo])).toBe('Solos, Antigo (inativo)')
  })

  it('aceita outro separador (relatório de estagiários usa "; ")', () => {
    expect(nomesDosLaboratoriosDaPessoa([solos, antigo], '; ')).toBe('Solos; Antigo (inativo)')
  })

  it('devolve vazio para lista vazia', () => {
    expect(nomesDosLaboratoriosDaPessoa([])).toBe('')
  })
})
