import { describe, expect, it } from 'vitest'

import { destinoAposLogin } from '@/modules/auth/destinoAposLogin'
import { usuarioDeTeste } from '@/test/sessaoDeTeste'

describe('destinoAposLogin', () => {
  it('usuario pendente vai para aguardando aprovacao', () => {
    expect(destinoAposLogin(usuarioDeTeste('GESTOR', { situacao: 'PENDENTE_VINCULACAO' }))).toBe('/aguardando-aprovacao')
  })

  it('gestor vai para o dashboard', () => {
    expect(destinoAposLogin(usuarioDeTeste('GESTOR'))).toBe('/dashboard')
  })

  it('tecnico vai para o inicio', () => {
    expect(destinoAposLogin(usuarioDeTeste('TECNICO'))).toBe('/inicio')
  })

  it('pesquisador que e so responsavel de laboratorio vai para o inicio nesta fase', () => {
    expect(destinoAposLogin(usuarioDeTeste('PESQUISADOR', {
      responsavelPor: [{ id: 'lab-1', nome: 'Lab', ativo: true }],
    }))).toBe('/inicio')
  })
})
