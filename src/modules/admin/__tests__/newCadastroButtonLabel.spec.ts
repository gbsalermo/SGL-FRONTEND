import { describe, expect, it } from 'vitest'

import { newCadastroButtonLabel } from '@/modules/admin/newCadastroButtonLabel'

describe('newCadastroButtonLabel', () => {
  it('agrees in gender with each cadastro', () => {
    expect(newCadastroButtonLabel('laboratorios')).toBe('+ Novo laboratório')
    expect(newCadastroButtonLabel('projetos')).toBe('+ Novo projeto')
    expect(newCadastroButtonLabel('produtos')).toBe('+ Novo produto')
    expect(newCadastroButtonLabel('classes-residuo')).toBe('+ Nova classe')
    expect(newCadastroButtonLabel('locais-armazenamento')).toBe('+ Novo local')
  })

  it('falls back to a generic label for tabs without a create button', () => {
    expect(newCadastroButtonLabel('permissoes')).toBe('+ Novo cadastro')
  })
})
