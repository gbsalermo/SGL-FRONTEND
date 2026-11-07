import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ listarPedidos: vi.fn() }))

vi.mock('vue-router', () => ({ useRoute: () => ({ query: {} }), useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }))
vi.mock('@/modules/solucoes/services/solucaoService', () => ({
  solucaoService: {
    listarPedidos: mocks.listarPedidos,
    listarMovimentacoes: vi.fn().mockResolvedValue([]),
  },
}))

import SolucoesGestaoView from '@/modules/solucoes/views/SolucoesGestaoView.vue'

const AVISO = 'Solicitante não está vinculado a este laboratório. Verifique antes de aprovar.'

async function abrirDetalhe(laboratorioForaDoSolicitante: boolean) {
  mocks.listarPedidos.mockResolvedValue([{
    id: 'sol-1', usuarioNome: 'Técnico', laboratorioNome: 'Lab B', nomeSolucao: 'Tampão', status: 'PENDENTE',
    dataSolicitacao: '2026-11-06T10:00:00', itens: [], laboratorioForaDoSolicitante,
  }])
  const wrapper = mount(SolucoesGestaoView)
  await flushPromises()
  ;(wrapper.vm as unknown as { expandidoId: string }).expandidoId = 'sol-1'
  await flushPromises()
  return wrapper
}

describe('SolucoesGestaoView - laboratório fora do solicitante', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('mostraAvisoQuandoForaDoSolicitante', async () => {
    const wrapper = await abrirDetalhe(true)

    expect(wrapper.find('[data-test="aviso-laboratorio-fora"]').text()).toBe(AVISO)
  })

  it('naoMostraAvisoQuandoOLaboratorioEhDoSolicitante', async () => {
    const wrapper = await abrirDetalhe(false)

    expect(wrapper.find('[data-test="aviso-laboratorio-fora"]').exists()).toBe(false)
  })
})
