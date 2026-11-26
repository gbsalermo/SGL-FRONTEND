import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { UsuarioSessao } from '@/modules/auth/types/session'
import { fakeAdapter } from '@/test/fakeAdapter'
import { acessoDe } from '@/test/sessaoDeTeste'

const usuario: UsuarioSessao = {
  id: 'u-1',
  nome: 'Fulano',
  email: 'fulano@embrapa.br',
  ...acessoDe('GESTOR'),
  cargo: null,
  responsavelPor: [],
  situacao: 'ATIVO',
  unidadeId: 'unidade-1',
  unidadeNome: 'Mandioca',
  unidadeSigla: 'CNPMF',
  laboratorios: [],
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

  // A session saved before roles existed has `perfil` and no `papeis`: reading it would quietly drop a
  // Gestor or administrator into the requester area until the token expired, so it is discarded.
  it('sessao salva no formato antigo, sem papeis, e descartada', async () => {
    localStorage.setItem('sgl.session', JSON.stringify({
      token: 'jwt-antigo',
      expiraEm: Date.now() + 60_000,
      usuario: { id: 'u-1', nome: 'Fulano', perfil: 'GESTOR', situacao: 'ATIVO', unidadeId: 'unidade-1' },
    }))

    const { session } = await carregar()

    expect(session.autenticado).toBe(false)
    expect(localStorage.getItem('sgl.session')).toBeNull()
  })

  it('remove a chave antiga sgl.dev-session', async () => {
    localStorage.setItem('sgl.dev-session', JSON.stringify({ usuario, expiraEm: Date.now() + 60_000 }))

    const { session } = await carregar()

    expect(localStorage.getItem('sgl.dev-session')).toBeNull()
    expect(session.autenticado).toBe(false)
  })

  it('unidadeEmOperacaoId usa a escolha do administrador geral e, sem ela, a do usuario', async () => {
    const { session } = await carregar()
    session.usuario = { ...usuario, ...acessoDe('ADMINISTRADOR_GERAL') }
    expect(session.unidadeEmOperacaoId).toBe('unidade-1')

    session.selecionarUnidade('unidade-2', 'CNPTIA')
    expect(session.unidadeEmOperacaoId).toBe('unidade-2')

    // Para os demais perfis, uma escolha antiga guardada na sessao nao vale.
    session.usuario = usuario
    expect(session.unidadeEmOperacaoId).toBe('unidade-1')
  })

  it('getters pendente e administradorGeral seguem o usuario', async () => {
    const { session } = await carregar()
    session.$patch({ token: 't', expiraEm: Date.now() + 60_000, usuario: { ...usuario, situacao: 'PENDENTE_VINCULACAO' } })
    expect(session.pendente).toBe(true)
    expect(session.administradorGeral).toBe(false)

    session.$patch({ usuario: { ...usuario, ...acessoDe('ADMINISTRADOR_GERAL') } })
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

  describe('sessao de teste', () => {
    function respostaDeLogin() {
      const expiraEm = new Date(Date.now() + 60_000).toISOString()
      return { data: { token: 'jwt-teste', expiraEm, usuario } }
    }

    it('entrarComoTeste_marcaSessaoDeTesteEPersiste', async () => {
      const { http, session } = await carregar()
      const post = vi.spyOn(http, 'post').mockResolvedValue(respostaDeLogin())

      await session.entrarComoTeste(' teste.gestor.1 ')

      expect(post).toHaveBeenCalledWith('/v1/auth/dev/entrar', { login: 'teste.gestor.1' })
      expect(session.sessaoDeTeste).toBe(true)
      expect(JSON.parse(localStorage.getItem('sgl.session') ?? '{}').sessaoDeTeste).toBe(true)
    })

    it('entrarReal_aposSessaoDeTeste_limpaMarca', async () => {
      const { http, session } = await carregar()
      vi.spyOn(http, 'post').mockResolvedValue(respostaDeLogin())

      await session.entrarComoTeste('teste.gestor.1')
      await session.entrar('m344136', 'senha')

      expect(session.sessaoDeTeste).toBe(false)
      expect(JSON.parse(localStorage.getItem('sgl.session') ?? '{}').sessaoDeTeste).toBe(false)
    })

    it('sair_limpaSessaoDeTeste', async () => {
      const { http, session } = await carregar()
      vi.spyOn(http, 'post').mockResolvedValue(respostaDeLogin())

      await session.entrarComoTeste('teste.gestor.1')
      session.sair()

      expect(session.sessaoDeTeste).toBe(false)
    })

    it('sessaoAntigaSemCampo_carregaComoFalse', async () => {
      localStorage.setItem('sgl.session', JSON.stringify({ token: 'jwt-1', usuario, expiraEm: Date.now() + 60_000 }))

      const { session } = await carregar()

      expect(session.autenticado).toBe(true)
      expect(session.sessaoDeTeste).toBe(false)
    })
  })
})
