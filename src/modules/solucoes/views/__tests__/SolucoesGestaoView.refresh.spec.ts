import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ listarPedidos: vi.fn() }))

vi.mock('vue-router', () => ({ useRoute: () => ({ query: {} }), useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }))
vi.mock('@/modules/solucoes/services/solucaoService', () => ({
  solucaoService: {
    listarPedidos: mocks.listarPedidos,
    listarMovimentacoes: vi.fn().mockResolvedValue([]),
  },
}))

import SolucoesGestaoView from '@/modules/solucoes/views/SolucoesGestaoView.vue'

const PEDIDO = {
  id: 'sol-1', usuarioNome: 'Técnico', laboratorioNome: 'Lab B', nomeSolucao: 'Tampão', status: 'PENDENTE',
  dataSolicitacao: '2026-11-06T10:00:00', itens: [], laboratorioForaDoSolicitante: false,
}

describe('SolucoesGestaoView - atualização automática', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    setActivePinia(createPinia())
    mocks.listarPedidos.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('recarregaSozinhaSemEsconderALista', async () => {
    mocks.listarPedidos.mockResolvedValueOnce([PEDIDO])
    const wrapper = mount(SolucoesGestaoView)
    await flushPromises()

    let resolve!: (value: unknown) => void
    mocks.listarPedidos.mockReturnValueOnce(new Promise((r) => { resolve = r }))
    await vi.advanceTimersByTimeAsync(300_000)

    expect(mocks.listarPedidos).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).not.toContain('Carregando solicitações...')
    expect(wrapper.text()).toContain('Tampão')
    resolve([PEDIDO])
    await flushPromises()
  })

  it('naoTemMaisBotaoAtualizarDados', async () => {
    mocks.listarPedidos.mockResolvedValue([PEDIDO])
    const wrapper = mount(SolucoesGestaoView)
    await flushPromises()

    expect(wrapper.text()).not.toContain('Atualizar dados')
    expect(wrapper.find('button[aria-label="Atualizar agora"]').exists()).toBe(true)
  })

  it('recargaComFalhaMantemDados', async () => {
    mocks.listarPedidos.mockResolvedValueOnce([PEDIDO]).mockRejectedValueOnce(new Error('offline'))
    const wrapper = mount(SolucoesGestaoView)
    await flushPromises()

    await vi.advanceTimersByTimeAsync(300_000)
    await flushPromises()

    expect(wrapper.text()).toContain('Tampão')
    expect(wrapper.find('.state-box--error, [role="alert"]').exists()).toBe(false)
  })
})
