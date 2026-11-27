import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

const RESIDUO = {
  id: 'r-1', codigoRastreio: 'RES-1', status: 'INFORMADO', descricao: 'Solvente', laboratorioNome: 'Lab B',
  usuarioGeradorNome: 'Técnico', recipiente: 'Frasco', componentes: [], laboratorioForaDoSolicitante: false,
  dataInformacao: '2026-11-06T10:00:00', quantidade: 1, unidadeMedida: 'L', estadoFisico: 'LIQUIDO', processoOrigem: 'Extração',
  nivelRiscoInformado: 'BAIXO', nivelRiscoConfirmado: null, riscosInformados: [], riscosConfirmados: [],
  classesInformadas: [], classesConfirmadas: [], medidasSegurancaInformadas: [], medidasSegurancaConfirmadas: [],
  tratamentoRealizado: false,
}

describe('ResiduosGestaoCompletoView - atualização automática', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    setActivePinia(createPinia())
    mocks.listarTodos.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('recarregaSozinhaSemEsconderALista', async () => {
    mocks.listarTodos.mockResolvedValueOnce([RESIDUO])
    const wrapper = mount(ResiduosGestaoCompletoView)
    await flushPromises()

    let resolve!: (value: unknown) => void
    mocks.listarTodos.mockReturnValueOnce(new Promise((r) => { resolve = r }))
    await vi.advanceTimersByTimeAsync(300_000)

    expect(mocks.listarTodos).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).not.toContain('Carregando resíduos...')
    expect(wrapper.text()).not.toContain('Atualizar dados')
    expect(wrapper.text()).toContain('RES-1')
    resolve([RESIDUO])
    await flushPromises()
  })
})
