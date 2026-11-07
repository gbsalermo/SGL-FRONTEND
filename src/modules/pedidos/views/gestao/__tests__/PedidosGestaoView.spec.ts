import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ listarTodosComSolucoes: vi.fn() }))

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}))
vi.mock('@/modules/pedidos/services/pedidoService', () => ({
  pedidoService: {
    listarTodosComSolucoes: mocks.listarTodosComSolucoes,
    listarMovimentacoesPorPedido: vi.fn().mockResolvedValue([]),
  },
}))

import PedidosGestaoView from '@/modules/pedidos/views/gestao/PedidosGestaoView.vue'

const AVISO = 'Solicitante não está vinculado a este laboratório. Verifique antes de aprovar.'

function pedido(extra: Record<string, unknown>) {
  return {
    id: 'ped-1', usuarioId: 'u-1', usuarioNome: 'Técnico', laboratorioId: 'L', laboratorioNome: 'Lab B',
    projetoId: null, projetoNome: null, dataSolicitacao: '2026-11-06T10:00:00', status: 'PENDENTE',
    tipo: 'PRODUTOS', itens: [], laboratorioForaDoSolicitante: false, ...extra,
  }
}

async function abrirDetalhe(extra: Record<string, unknown>) {
  mocks.listarTodosComSolucoes.mockResolvedValue([pedido(extra)])
  const wrapper = mount(PedidosGestaoView)
  await flushPromises()
  await wrapper.find('.detail-button').trigger('click')
  await flushPromises()
  return wrapper
}

describe('PedidosGestaoView - laboratório fora do solicitante', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('mostraAvisoQuandoForaDoSolicitante', async () => {
    const wrapper = await abrirDetalhe({ laboratorioForaDoSolicitante: true })

    expect(wrapper.find('[data-test="aviso-laboratorio-fora"]').text()).toBe(AVISO)
  })

  it('mostraAvisoTambemNoPedidoDeSolucao', async () => {
    const wrapper = await abrirDetalhe({ laboratorioForaDoSolicitante: true, tipo: 'SOLUCAO' })

    expect(wrapper.find('[data-test="aviso-laboratorio-fora"]').text()).toBe(AVISO)
  })

  it('naoMostraAvisoQuandoOLaboratorioEhDoSolicitante', async () => {
    const wrapper = await abrirDetalhe({ laboratorioForaDoSolicitante: false })

    expect(wrapper.find('[data-test="aviso-laboratorio-fora"]').exists()).toBe(false)
  })
})
