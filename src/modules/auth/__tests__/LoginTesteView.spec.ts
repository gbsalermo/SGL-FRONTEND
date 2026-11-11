import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import { buscarUsuariosDeTeste, carregarResumoDeTeste } from '@/modules/auth/services/devLoginService'
import type { ResumoDeTeste, UsuarioDeTeste } from '@/modules/auth/types/devLogin'
import type { LoginResponse, SituacaoUsuario, PerfilUsuario } from '@/modules/auth/types/session'
import LoginTesteView from '@/modules/auth/views/LoginTesteView.vue'
import { http } from '@/services/http'

// The service is the HTTP boundary of this view; the session store keeps its real implementation.
vi.mock('@/modules/auth/services/devLoginService', () => ({
  buscarUsuariosDeTeste: vi.fn(),
  carregarResumoDeTeste: vi.fn(),
}))

const buscarMock = vi.mocked(buscarUsuariosDeTeste)
const resumoMock = vi.mocked(carregarResumoDeTeste)

function resumo(gestores = 6): ResumoDeTeste {
  return {
    contagemPorPerfil: {
      ADMINISTRADOR_GERAL: 2, ADMINISTRADOR: 4, GESTOR: gestores, TECNICO: 12,
      ANALISTA: 8, PESQUISADOR: 11, ESTAGIARIO: 5,
    },
    unidades: [
      { id: 'unidade-1', sigla: 'CNPMA', nome: 'Meio Ambiente' },
      { id: 'unidade-2', sigla: 'CNPMF', nome: 'Mandioca e Fruticultura' },
    ],
  }
}

function usuarioDeTeste(id: string, nome: string, perfil: PerfilUsuario = 'GESTOR'): UsuarioDeTeste {
  return { id, nome, login: `login.${id}`, perfil, unidadeId: 'unidade-1', unidadeSigla: 'CNPMA', laboratorios: [] }
}

function respostaDeLogin(perfil: PerfilUsuario, situacao: SituacaoUsuario): LoginResponse {
  return {
    token: 'jwt',
    expiraEm: new Date(Date.now() + 60_000).toISOString(),
    usuario: {
      id: 'u-1', nome: 'Ana Moreira', email: 'ana@sgl.local', perfil, situacao,
      unidadeId: 'unidade-1', unidadeNome: 'Meio Ambiente', unidadeSigla: 'CNPMA',
      laboratorios: [], ativo: true,
    },
  }
}

async function montar() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const vazio = { template: '<div />' }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login/teste', component: LoginTesteView },
      { path: '/login', component: vazio },
      { path: '/dashboard', component: vazio },
      { path: '/inicio', component: vazio },
      { path: '/aguardando-aprovacao', component: vazio },
    ],
  })
  await router.push('/login/teste')
  const wrapper = mount(LoginTesteView, { global: { plugins: [pinia, router] } })
  await flushPromises()
  return { wrapper, router }
}

describe('LoginTesteView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    buscarMock.mockReset()
    resumoMock.mockReset()
    resumoMock.mockResolvedValue(resumo())
    buscarMock.mockResolvedValue([usuarioDeTeste('1', 'Ana Moreira'), usuarioDeTeste('2', 'Carlos Lima')])
  })

  it('carregaResumoEListaAoMontar', async () => {
    const { wrapper } = await montar()

    expect(resumoMock).toHaveBeenCalled()
    expect(buscarMock).toHaveBeenCalled()
    expect(wrapper.findAll('[data-test="entrar"]')).toHaveLength(2)
    expect(wrapper.find('[data-test="perfil-GESTOR"]').text()).toContain('6')
    expect(wrapper.find('[data-test="perfil-TODOS"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Todos · Todas as unidades · 2 usuários')
  })

  it('clicarPerfil_buscaComFiltro', async () => {
    const { wrapper } = await montar()

    await wrapper.find('[data-test="perfil-GESTOR"]').trigger('click')
    await flushPromises()

    expect(buscarMock).toHaveBeenLastCalledWith(expect.objectContaining({ perfil: 'GESTOR' }))
    expect(wrapper.text()).toContain('Gestor · Todas as unidades · 2 usuários')
  })

  it('trocarUnidade_recarregaResumo', async () => {
    const { wrapper } = await montar()
    resumoMock.mockResolvedValue(resumo(1))

    await wrapper.find('[data-test="unidade"]').setValue('unidade-1')
    await flushPromises()

    expect(resumoMock).toHaveBeenLastCalledWith('unidade-1')
    expect(buscarMock).toHaveBeenLastCalledWith(expect.objectContaining({ unidadeId: 'unidade-1' }))
    expect(wrapper.find('[data-test="perfil-GESTOR"]').text()).toContain('1')
    expect(wrapper.text()).toContain('Todos · CNPMA · 2 usuários')
  })

  it('buscaComDebounce', async () => {
    vi.useFakeTimers()
    try {
      const { wrapper } = await montar()
      buscarMock.mockClear()

      await wrapper.find('[data-test="busca"]').setValue('ana')
      vi.advanceTimersByTime(299)
      expect(buscarMock).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      expect(buscarMock).toHaveBeenCalledWith(expect.objectContaining({ busca: 'ana' }))
    } finally {
      vi.useRealTimers()
    }
  })

  it('listaVazia_mostraVazio', async () => {
    buscarMock.mockResolvedValue([])
    const { wrapper } = await montar()

    expect(wrapper.find('[data-test="vazio"]').text()).toContain('Nenhum usuário encontrado')
  })

  it('erroAoBuscar_mostraErroETentaDeNovo', async () => {
    buscarMock.mockRejectedValueOnce(new Error('falhou'))
    const { wrapper } = await montar()

    const erro = wrapper.find('[data-test="erro"]')
    expect(erro.exists()).toBe(true)

    await erro.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-test="erro"]').exists()).toBe(false)
    expect(wrapper.findAll('[data-test="entrar"]')).toHaveLength(2)
  })

  it('entrar_usuarioPendente_vaiParaAguardando', async () => {
    vi.spyOn(http, 'post').mockResolvedValue({ data: respostaDeLogin('TECNICO', 'PENDENTE_VINCULACAO') })
    const { wrapper, router } = await montar()

    await wrapper.find('[data-test="entrar"]').trigger('click')
    await flushPromises()

    expect(http.post).toHaveBeenCalledWith('/v1/auth/dev/entrar', { login: 'login.1' })
    expect(router.currentRoute.value.path).toBe('/aguardando-aprovacao')
  })

  it('entrar_gestor_vaiParaDashboard', async () => {
    vi.spyOn(http, 'post').mockResolvedValue({ data: respostaDeLogin('GESTOR', 'ATIVO') })
    const { wrapper, router } = await montar()

    await wrapper.find('[data-test="entrar"]').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('entrar_erro_mostraMensagem', async () => {
    vi.spyOn(http, 'post').mockRejectedValue(new Error('Login de teste indisponível'))
    const { wrapper, router } = await montar()

    await wrapper.find('[data-test="entrar"]').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/login/teste')
    expect(wrapper.text()).toContain('Login de teste indisponível')
  })
})
