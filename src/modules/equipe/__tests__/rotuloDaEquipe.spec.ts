import { describe, expect, it } from 'vitest'

import { rotuloDaEquipe } from '@/modules/equipe/rotuloDaEquipe'
import { usuarioDeTeste } from '@/test/sessaoDeTeste'

describe('rotuloDaEquipe', () => {
  it('administrador gere todos os laboratorios da Unidade', () => {
    expect(rotuloDaEquipe(usuarioDeTeste('ADMINISTRADOR'))).toBe('Equipes dos laboratórios')
  })

  it('administrador que tambem e responsavel continua vendo todos', () => {
    const usuario = usuarioDeTeste('ADMINISTRADOR', { responsavelPor: [{ id: 'lab-a', nome: 'Lab A', ativo: true }] })
    expect(rotuloDaEquipe(usuario)).toBe('Equipes dos laboratórios')
  })

  it('responsavel ve o proprio laboratorio', () => {
    const usuario = usuarioDeTeste('PESQUISADOR', { responsavelPor: [{ id: 'lab-a', nome: 'Lab A', ativo: true }] })
    expect(rotuloDaEquipe(usuario)).toBe('Meu laboratório')
  })
})
