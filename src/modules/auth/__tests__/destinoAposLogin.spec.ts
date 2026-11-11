import { describe, expect, it } from 'vitest'

import { destinoAposLogin } from '@/modules/auth/destinoAposLogin'
import type { UsuarioSessao } from '@/modules/auth/types/session'

function usuarioCom(parcial: Partial<UsuarioSessao>): UsuarioSessao {
  return {
    id: 'u-1',
    nome: 'Fulano',
    email: 'fulano@embrapa.br',
    perfil: 'TECNICO',
    situacao: 'ATIVO',
    unidadeId: 'unidade-1',
    unidadeNome: 'Mandioca',
    unidadeSigla: 'CNPMF',
    laboratorios: [],
    ativo: true,
    ...parcial,
  }
}

describe('destinoAposLogin', () => {
  it('usuario pendente vai para aguardando aprovacao', () => {
    expect(destinoAposLogin(usuarioCom({ situacao: 'PENDENTE_VINCULACAO', perfil: 'GESTOR' }))).toBe('/aguardando-aprovacao')
  })

  it('gestor vai para o dashboard', () => {
    expect(destinoAposLogin(usuarioCom({ perfil: 'GESTOR' }))).toBe('/dashboard')
  })

  it('tecnico vai para o inicio', () => {
    expect(destinoAposLogin(usuarioCom({ perfil: 'TECNICO' }))).toBe('/inicio')
  })
})
