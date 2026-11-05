import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  DOIS_LABORATORIOS, UM_LABORATORIO, entrarComoEstagiario, participacaoEstagio,
} from '@/modules/operacao/__tests__/estagiarioFixtures'
import type { LaboratorioResumo } from '@/modules/projetos/types/projetos'

const mocks = vi.hoisted(() => ({
  criar: vi.fn(),
  listarParticipacoesEstagiario: vi.fn(),
}))

vi.mock('@/modules/residuos/services/residuoService', () => ({
  residuoService: {
    listarProjetosPorLaboratorio: vi.fn().mockResolvedValue([]),
    listarProdutosAtivos: vi.fn().mockResolvedValue([]),
    listarClassesAtivas: vi.fn().mockResolvedValue([{ id: 'cl-1', nome: 'Classe I' }]),
    listarModelosResiduoAtivos: vi.fn().mockResolvedValue([]),
    criar: mocks.criar,
  },
}))
vi.mock('@/modules/operacao/services/contextoOperacionalService', () => ({
  contextoOperacionalService: { listarParticipacoesEstagiario: mocks.listarParticipacoesEstagiario },
}))

import InformarResiduoView from '@/modules/residuos/views/solicitante/InformarResiduoView.vue'

async function montarComoEstagiario(laboratorios: LaboratorioResumo[]) {
  entrarComoEstagiario()
  mocks.listarParticipacoesEstagiario.mockResolvedValue([participacaoEstagio(laboratorios)])
  const wrapper = mount(InformarResiduoView)
  await flushPromises()
  return wrapper
}

// Fills the mandatory classification through the component state: those checkboxes are
// unrelated to the laboratory rule under test.
async function preencherEEnviar(wrapper: Awaited<ReturnType<typeof montarComoEstagiario>>) {
  Object.assign(wrapper.vm as object, {
    nivelRiscoInformado: 'NENHUM',
    classesInformadasIds: ['cl-1'],
    medidasSegurancaInformadas: ['LUVAS'],
  })
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('InformarResiduoView — laboratório do projeto do estagiário', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    window.scrollTo = vi.fn()
    mocks.criar.mockReset().mockResolvedValue({ id: 'r-1', codigoRastreio: 'RES-1', dataInformacao: '2026-11-05T10:00:00', componentes: [] })
  })

  it('estagiário com projeto de 2 laboratórios vê seletor e envia laboratorioId', async () => {
    const wrapper = await montarComoEstagiario(DOIS_LABORATORIOS)

    const seletor = wrapper.find('select#laboratorio-projeto')
    expect(seletor.exists()).toBe(true)

    await preencherEEnviar(wrapper)
    expect(mocks.criar).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Selecione o laboratório do projeto')

    await seletor.setValue('B')
    expect(wrapper.find('.context-grid').text()).toContain('Lab B')
    await preencherEEnviar(wrapper)
    expect(mocks.criar).toHaveBeenCalledWith(expect.objectContaining({ participacaoId: 'part-1', laboratorioId: 'B' }))
  })

  it('estagiário com projeto de 1 laboratório não vê seletor', async () => {
    const wrapper = await montarComoEstagiario(UM_LABORATORIO)

    expect(wrapper.find('select#laboratorio-projeto').exists()).toBe(false)
    await preencherEEnviar(wrapper)
    expect(mocks.criar).toHaveBeenCalledWith(expect.objectContaining({ participacaoId: 'part-1', laboratorioId: 'A' }))
  })
})
