import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { UsuarioSessao } from '@/modules/auth/types/session'
import { fakeAdapter } from '@/test/fakeAdapter'

const usuario: UsuarioSessao = {
  id: 'u-1',
  nome: 'Fulano',
  email: 'fulano@embrapa.br',
  perfil: 'GESTOR',
  situacao: 'ATIVO',
  unidadeId: 'unidade-1',
  unidadeNome: 'Mandioca',
  unidadeSigla: 'CNPMF',
  laboratorioId: null,
  laboratorioNome: null,
  ativo: true,
}

// The store reads localStorage when its module loads, so each test imports a fresh copy.
async function carregar() {
  vi.resetModules()
  const { http } = await import('@/services/http')
  const { useSessionStore } = await import('@/stores/session')
  setActivePinia(createPinia())
  return { http, session: useSessionStore() }
}

describe('session store', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('entrar guarda token e usuario em sgl.session', async () => {
    const { http, session } = await carregar()
    const expiraEm = new Date(Date.now() + 60_000).toISOString()
    const fake = fakeAdapter(() => ({ status: 200, data: { token: 'jwt-1', expiraEm, usuario } }))
    http.defaults.adapter = fake.adapter

    await session.entrar(' m344136 ', 'senha')

    expect(fake.requests[0].url).toBe('/v1/auth/login')
    expect(JSON.parse(fake.requests[0].data)).toEqual({ login: 'm344136', senha: 'senha' })
    expect(session.autenticado).toBe(true)
    const salvo = JSON.parse(localStorage.getItem('sgl.session') ?? '{}')
    expect(salvo.token).toBe('jwt-1')
    expect(salvo.usuario.id).toBe('u-1')
    expect(salvo.expiraEm).toBe(Date.parse(expiraEm))
  })

  it('sessao expirada nao e restaurada', async () => {
    localStorage.setItem('sgl.session', JSON.stringify({ token: 'jwt-velho', usuario, expiraEm: Date.now() - 1 }))

    const { session } = await carregar()

    expect(session.autenticado).toBe(false)
    expect(localStorage.getItem('sgl.session')).toBeNull()
  })

  it('sessao valida e restaurada com a unidade selecionada', async () => {
    localStorage.setItem('sgl.session', JSON.stringify({
      token: 'jwt-1', usuario, expiraEm: Date.now() + 60_000, unidadeOperacaoId: 'unidade-2',
    }))

    const { session } = await carregar()

    expect(session.autenticado).toBe(true)
    expect(session.unidadeOperacaoId).toBe('unidade-2')
  })

  it('remove a chave antiga sgl.dev-session', async () => {
    localStorage.setItem('sgl.dev-session', JSON.stringify({ usuario, expiraEm: Date.now() + 60_000 }))

    const { session } = await carregar()

    expect(localStorage.getItem('sgl.dev-session')).toBeNull()
    expect(session.autenticado).toBe(false)
  })

  it('getters pendente e administradorGeral seguem o usuario', async () => {
    const { session } = await carregar()
    session.$patch({ token: 't', expiraEm: Date.now() + 60_000, usuario: { ...usuario, situacao: 'PENDENTE_VINCULACAO' } })
    expect(session.pendente).toBe(true)
    expect(session.administradorGeral).toBe(false)

    session.$patch({ usuario: { ...usuario, perfil: 'ADMINISTRADOR_GERAL' } })
    expect(session.pendente).toBe(false)
    expect(session.administradorGeral).toBe(true)
  })

  it('atualizarUsuario consulta /v1/auth/me', async () => {
    const { http, session } = await carregar()
    session.$patch({ token: 't', expiraEm: Date.now() + 60_000, usuario: { ...usuario, situacao: 'PENDENTE_VINCULACAO' } })
    const fake = fakeAdapter(() => ({ status: 200, data: usuario }))
    http.defaults.adapter = fake.adapter

    await session.atualizarUsuario()

    expect(fake.requests[0].url).toBe('/v1/auth/me')
    expect(session.pendente).toBe(false)
  })

  it('sair limpa estado e armazenamento', async () => {
    const { session } = await carregar()
    session.$patch({ token: 't', expiraEm: Date.now() + 60_000, usuario })
    localStorage.setItem('sgl.session', '{}')

    session.sair()

    expect(session.autenticado).toBe(false)
    expect(localStorage.getItem('sgl.session')).toBeNull()
  })
})
