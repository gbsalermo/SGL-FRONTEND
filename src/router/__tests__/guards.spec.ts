import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { SituacaoUsuario, UsuarioSessao } from '@/modules/auth/types/session'
import { entradaLoginTeste, guardaDeRota, router } from '@/router'
import { http } from '@/services/http'
import { useSessionStore } from '@/stores/session'
import { type PerfilDeTeste, usuarioDeTeste } from '@/test/sessaoDeTeste'

function entrarComo(perfil: PerfilDeTeste, situacao: SituacaoUsuario = 'ATIVO', extra: Partial<UsuarioSessao> = {}) {
  const usuario = usuarioDeTeste(perfil, { situacao, ...extra })
  useSessionStore().$patch({ token: 'jwt', usuario, expiraEm: Date.now() + 60_000 })
}

// Resolving never loads the lazy view components, so the guard is exercised without rendering.
function destino(path: string): string | true {
  const resultado = guardaDeRota(router.resolve(path))
  if (resultado === true) return true
  return typeof resultado === 'string' ? resultado : (resultado as { path: string }).path
}

describe('guardas de rota', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('pendente e redirecionado para /aguardando-aprovacao', () => {
    entrarComo('TECNICO', 'PENDENTE_VINCULACAO')

    expect(destino('/inicio')).toBe('/aguardando-aprovacao')
    expect(destino('/dashboard')).toBe('/aguardando-aprovacao')
    expect(destino('/login')).toBe('/aguardando-aprovacao')
    expect(destino('/aguardando-aprovacao')).toBe(true)
  })

  it('ativo nao acessa /aguardando-aprovacao', () => {
    entrarComo('TECNICO')
    expect(destino('/aguardando-aprovacao')).toBe('/inicio')

    entrarComo('GESTOR')
    expect(destino('/aguardando-aprovacao')).toBe('/dashboard')
  })

  it('sem sessao /aguardando-aprovacao leva ao login', () => {
    expect(destino('/aguardando-aprovacao')).toBe('/login')
  })

  it('administrador geral acessa rotas de gestao e de admin', () => {
    entrarComo('ADMINISTRADOR_GERAL')

    expect(destino('/dashboard')).toBe(true)
    expect(destino('/administracao/cadastros/vinculos')).toBe(true)
    expect(destino('/administracao/cadastros')).toBe(true)
    expect(destino('/login')).toBe('/dashboard')
  })

  it('gestor que tambem e responsavel entra na gestao', () => {
    entrarComo('GESTOR', 'ATIVO', {
      categoriaCargo: 'PESQUISADOR',
      responsavelPor: [{ id: 'lab-1', nome: 'Lab', ativo: true }],
    })

    expect(destino('/dashboard')).toBe(true)
    expect(destino('/login')).toBe('/dashboard')
  })

  it('gestor que tambem e administrador local acessa rotas de admin', () => {
    entrarComo('GESTOR', 'ATIVO', { papeis: ['GESTOR', 'ADMINISTRADOR_LOCAL'] })

    expect(destino('/administracao/cadastros')).toBe(true)
  })

  it('quem nao tem papel nao acessa cadastros', () => {
    entrarComo('PESQUISADOR')

    expect(destino('/administracao/cadastros')).toBe('/inicio')
  })

  it('gestor continua fora das rotas de solicitante nesta fase', () => {
    entrarComo('GESTOR')

    expect(destino('/inicio')).toBe('/dashboard')
  })

  it('gestor nao acessa rotas de admin', () => {
    entrarComo('GESTOR')

    expect(destino('/administracao/cadastros')).toBe('/dashboard')
  })

  it('ajuda is public for anonymous users', () => {
    expect(destino('/ajuda')).toBe(true)
    expect(destino('/ajuda/informar-um-residuo')).toBe(true)
  })

  it('pending user can open ajuda', () => {
    entrarComo('TECNICO', 'PENDENTE_VINCULACAO')

    expect(destino('/ajuda')).toBe(true)
    expect(destino('/ajuda/informar-um-residuo')).toBe(true)
    expect(destino('/inicio')).toBe('/aguardando-aprovacao')
  })

  it('logged-in user stays on ajuda', () => {
    entrarComo('GESTOR')
    expect(destino('/ajuda/analisar-pedido')).toBe(true)
  })

  it('unknown task goes back to ajuda', async () => {
    await router.push('/ajuda/nao-existe')
    expect(router.currentRoute.value.path).toBe('/ajuda')
  })

  it('faq route is valid', async () => {
    await router.push('/ajuda/perguntas-frequentes')
    expect(router.currentRoute.value.path).toBe('/ajuda/perguntas-frequentes')
  })

  describe('entradaLoginTeste', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('entradaLoginTeste_devLoginInativo_redirecionaLogin', async () => {
      vi.spyOn(http, 'get').mockResolvedValue({ data: { devLoginAtivo: false } })

      await expect(entradaLoginTeste()).resolves.toBe('/login')
      expect(http.get).toHaveBeenCalledWith('/v1/auth/config')
    })

    it('entradaLoginTeste_erro_redirecionaLogin', async () => {
      vi.spyOn(http, 'get').mockRejectedValue(new Error('offline'))

      await expect(entradaLoginTeste()).resolves.toBe('/login')
    })

    it('entradaLoginTeste_ativoComSessao_encerraSessao', async () => {
      vi.spyOn(http, 'get').mockResolvedValue({ data: { devLoginAtivo: true } })
      entrarComo('GESTOR')

      await expect(entradaLoginTeste()).resolves.toBe(true)
      expect(useSessionStore().autenticado).toBe(false)
    })

    it('entradaLoginTeste_ativoSemSessao_permite', async () => {
      vi.spyOn(http, 'get').mockResolvedValue({ data: { devLoginAtivo: true } })

      await expect(entradaLoginTeste()).resolves.toBe(true)
    })
  })
})
