import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ listarLaboratorios: vi.fn(), listarTodosComSolucoes: vi.fn() }))

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }), useRoute: () => ({ query: {} }) }))
vi.mock('@/modules/pedidos/services/pedidoService', () => ({
  pedidoService: { listarTodosComSolucoes: mocks.listarTodosComSolucoes },
}))
vi.mock('@/modules/estoque/services/estoqueService', () => ({
  estoqueService: {
    listarPorUnidade: vi.fn().mockResolvedValue([]),
    listarEstoqueBaixo: vi.fn().mockResolvedValue([]),
    listarLotesPorEstoque: vi.fn().mockResolvedValue([]),
  },
}))
vi.mock('@/modules/residuos/services/residuoService', () => ({
  residuoService: { listarTodos: vi.fn().mockResolvedValue([]), buscarHistoricoDaUnidade: vi.fn().mockResolvedValue([]) },
}))
vi.mock('@/modules/movimentacoes/services/movimentacaoService', () => ({
  movimentacaoService: { listarTodos: vi.fn().mockResolvedValue([]) },
}))
vi.mock('@/modules/admin/services/cadastrosAdminService', () => ({
  cadastrosAdminService: { listarLaboratorios: mocks.listarLaboratorios, listarUsuarios: vi.fn().mockResolvedValue([]) },
}))

import DashboardGestaoView from '@/modules/dashboard/views/gestao/DashboardGestaoView.vue'

const LAB = { id: 'lab-1', nome: 'Lab A', ativo: true }

describe('DashboardGestaoView - atualização automática', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    setActivePinia(createPinia())
    mocks.listarTodosComSolucoes.mockReset().mockResolvedValue([])
    mocks.listarLaboratorios.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('recargaComFalhaParcialMantemDadosAnterioresESemCarregando', async () => {
    mocks.listarLaboratorios.mockResolvedValueOnce([LAB]).mockRejectedValueOnce(new Error('offline'))
    const wrapper = mount(DashboardGestaoView)
    await flushPromises()
    const vm = wrapper.vm as unknown as { laboratorios: unknown[]; carregando: boolean; erro: string }
    const erroInicial = vm.erro

    await vi.advanceTimersByTimeAsync(300_000)
    await flushPromises()

    expect(mocks.listarTodosComSolucoes).toHaveBeenCalledTimes(2)
    expect(vm.laboratorios).toEqual([LAB])
    expect(vm.carregando).toBe(false)
    expect(vm.erro).toBe(erroInicial)
    expect(wrapper.text()).not.toContain('Atualizar dados')
  })
})
