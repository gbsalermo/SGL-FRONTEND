import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ listarTodos: vi.fn() }))

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}))
vi.mock('@/modules/residuos/services/residuoService', () => ({
  residuoService: {
    listarTodos: mocks.listarTodos,
    listarClassesAtivas: vi.fn().mockResolvedValue([]),
    listarLocaisArmazenamentoAtivos: vi.fn().mockResolvedValue([]),
    buscarHistorico: vi.fn().mockResolvedValue([]),
  },
}))

import ResiduosGestaoCompletoView from '@/modules/residuos/views/gestao/ResiduosGestaoCompletoView.vue'

const AVISO = 'Solicitante não está vinculado a este laboratório. Verifique antes de receber.'

async function selecionarResiduo(laboratorioForaDoSolicitante: boolean, recebimento: boolean) {
  const residuo = {
    id: 'r-1', codigoRastreio: 'RES-1', status: 'INFORMADO', descricao: 'Solvente', laboratorioNome: 'Lab B',
    usuarioGeradorNome: 'Técnico', recipiente: 'Frasco', componentes: [], laboratorioForaDoSolicitante,
    dataInformacao: '2026-11-06T10:00:00', quantidade: 1, unidadeMedida: 'L', estadoFisico: 'LIQUIDO', processoOrigem: 'Extração',
    nivelRiscoInformado: 'BAIXO', nivelRiscoConfirmado: null, riscosInformados: [], riscosConfirmados: [],
    classesInformadas: [], classesConfirmadas: [], medidasSegurancaInformadas: [], medidasSegurancaConfirmadas: [],
    tratamentoRealizado: false,
  }
  mocks.listarTodos.mockResolvedValue([residuo])
  const wrapper = mount(ResiduosGestaoCompletoView)
  await flushPromises()
  Object.assign(wrapper.vm as object, { selecionado: residuo, recebimentoAberto: recebimento })
  await flushPromises()
  return wrapper
}

describe('ResiduosGestaoCompletoView - laboratório fora do solicitante', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('mostraAvisoNosDetalhesQuandoForaDoSolicitante', async () => {
    const wrapper = await selecionarResiduo(true, false)

    expect(wrapper.find('[data-test="aviso-laboratorio-fora"]').text()).toBe(AVISO)
  })

  it('mostraAvisoNoRecebimentoQuandoForaDoSolicitante', async () => {
    const wrapper = await selecionarResiduo(true, true)

    expect(wrapper.find('[role="dialog"] [data-test="aviso-laboratorio-fora"]').text()).toBe(AVISO)
  })

  it('naoMostraAvisoQuandoOLaboratorioEhDoSolicitante', async () => {
    const wrapper = await selecionarResiduo(false, false)

    expect(wrapper.find('[data-test="aviso-laboratorio-fora"]').exists()).toBe(false)
  })
})
