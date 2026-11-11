import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import SessaoTesteBanner from '@/components/SessaoTesteBanner.vue'
import type { PerfilUsuario, SituacaoUsuario, UsuarioSessao } from '@/modules/auth/types/session'
import { router as appRouter } from '@/router'
import { http } from '@/services/http'
import { useSessionStore } from '@/stores/session'
import { fakeAdapter } from '@/test/fakeAdapter'

function entrar(opcoes: {
  sessaoDeTeste: boolean
  unidadeSigla?: string | null
  perfil?: PerfilUsuario
  situacao?: SituacaoUsuario
}) {
  const usuario: UsuarioSessao = {
    id: 'u-1', nome: 'Carlos Eduardo Lima', email: 'c@sgl.local',
    perfil: opcoes.perfil ?? 'GESTOR', situacao: opcoes.situacao ?? 'ATIVO',
    unidadeId: 'unidade-1', unidadeNome: 'Mandioca e Fruticultura',
    unidadeSigla: opcoes.unidadeSigla === undefined ? 'CNPMF' : opcoes.unidadeSigla,
    laboratorios: [], ativo: true,
  } as UsuarioSessao
  const session = useSessionStore()
  session.$patch({ token: 'jwt', usuario, expiraEm: Date.now() + 60_000, sessaoDeTeste: opcoes.sessaoDeTeste })
  return session
}

function montar(router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<div />' } }] })) {
  return mount(SessaoTesteBanner, { global: { plugins: [router] } })
}

describe('SessaoTesteBanner', () => {
  const adapterOriginal = http.defaults.adapter

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })
  afterEach(() => { http.defaults.adapter = adapterOriginal })

  it('ocultoEmSessaoReal', () => {
    entrar({ sessaoDeTeste: false })
    expect(montar().find('[data-test="faixa-teste"]').exists()).toBe(false)
  })

  it('mostraNomePerfilEUnidade', () => {
    entrar({ sessaoDeTeste: true })
    const texto = montar().text()
    expect(texto).toContain('Carlos')
    expect(texto).toContain('Gestor')
    expect(texto).toContain('CNPMF')
  })

  it('semUnidade_omiteSigla', () => {
    entrar({ sessaoDeTeste: true, unidadeSigla: null })
    const texto = montar().text()
    expect(texto).toContain('Gestor')
    expect(texto).not.toContain('null')
    expect(texto).not.toMatch(/Gestor\s*·/)
  })

  it('trocar_encerraSessaoENavega', async () => {
    const session = entrar({ sessaoDeTeste: true })
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<div />' } }] })
    const push = vi.spyOn(router, 'push')
    const wrapper = montar(router)
    await wrapper.find('[data-test="trocar"]').trigger('click')
    expect(session.autenticado).toBe(false)
    expect(push).toHaveBeenCalledWith('/login/teste')
  })

  it('trocar_comUsuarioPendente_chegaEmLoginTeste', async () => {
    http.defaults.adapter = fakeAdapter(() => ({ status: 200, data: { devLoginAtivo: true } })).adapter
    // The global guard sends a pending user to /aguardando-aprovacao, so the session must end first.
    entrar({ sessaoDeTeste: true, perfil: 'TECNICO', situacao: 'PENDENTE_VINCULACAO' })
    await appRouter.push('/aguardando-aprovacao')
    const wrapper = montar(appRouter)
    await wrapper.find('[data-test="trocar"]').trigger('click')
    // The lazy LoginTesteView import can take longer than one microtask flush.
    await vi.waitFor(() => expect(appRouter.currentRoute.value.path).toBe('/login/teste'))
  })
})
