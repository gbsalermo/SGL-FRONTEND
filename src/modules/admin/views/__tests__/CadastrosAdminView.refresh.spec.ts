import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ listarLaboratorios: vi.fn() }))

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  RouterLink: { template: '<a><slot /></a>' },
}))
vi.mock('@/modules/admin/services/cadastrosAdminService', () => ({
  cadastrosAdminService: {
    listarUnidades: vi.fn().mockResolvedValue([]),
    listarLaboratorios: mocks.listarLaboratorios,
    listarProjetos: vi.fn().mockResolvedValue([]),
    listarProdutos: vi.fn().mockResolvedValue([]),
    listarClassesResiduo: vi.fn().mockResolvedValue([]),
    listarLocaisArmazenamentoResiduo: vi.fn().mockResolvedValue([]),
    listarUsuarios: vi.fn().mockResolvedValue([]),
  },
}))

import CadastrosAdminView from '@/modules/admin/views/CadastrosAdminView.vue'

describe('CadastrosAdminView - atualização automática', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    setActivePinia(createPinia())
    mocks.listarLaboratorios.mockReset()
    mocks.listarLaboratorios.mockResolvedValue([])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('recarregaSozinhaMantendoBuscaEAba', async () => {
    const wrapper = mount(CadastrosAdminView, { global: { stubs: { RouterLink: true, HelpLink: true } } })
    await flushPromises()
    const vm = wrapper.vm as unknown as { aba: string; busca: string }
    vm.aba = 'projetos'
    vm.busca = 'solvente'
    await flushPromises()

    await vi.advanceTimersByTimeAsync(300_000)
    await flushPromises()

    expect(mocks.listarLaboratorios).toHaveBeenCalledTimes(2)
    expect(vm.aba).toBe('projetos')
    expect(vm.busca).toBe('solvente')
    expect(wrapper.text()).not.toContain('Atualizar dados')
  })
})
