import { describe, expect, it } from 'vitest'

import { FAQ_TEXT, helpText } from '../helpTexts'

// Fase 2: each laboratory's responsável organizes the team; central import is for administrators.
describe('ajuda da equipe do laboratorio', () => {
  it('importar da Embrapa explica Meu laboratorio e o cadastro em lote', () => {
    const texto = helpText('importar-pessoa-da-embrapa') ?? ''
    expect(texto).toContain('Meu laboratório')
    expect(texto).toContain('Trazer da Embrapa')
    expect(texto).toContain('Selecionados')
    expect(texto).toContain('Administrador Local')
  })

  it('primeiro acesso manda avisar o responsavel do laboratorio', () => {
    expect(FAQ_TEXT).toContain('Avise o responsável do seu laboratório')
    expect(FAQ_TEXT).not.toContain('Avise a Gestão do laboratório')
  })
})
