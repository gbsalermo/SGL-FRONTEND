import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import type { PerfilUsuario, SituacaoUsuario, UsuarioSessao } from '@/modules/auth/types/session'
import { guardaDeRota, router } from '@/router'
import { useSessionStore } from '@/stores/session'

function entrarComo(perfil: PerfilUsuario, situacao: SituacaoUsuario = 'ATIVO') {
  const usuario: UsuarioSessao = {
    id: 'u-1', nome: 'Fulano', email: 'f@embrapa.br', perfil, situacao,
    unidadeId: 'unidade-1', unidadeNome: 'Mandioca', unidadeSigla: 'CNPMF',
    laboratorios: [], ativo: true,
  }
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
})
