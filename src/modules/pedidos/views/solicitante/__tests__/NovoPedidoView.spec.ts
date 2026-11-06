import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  DOIS_LABORATORIOS, UM_ATIVO_UM_INATIVO, UM_LABORATORIO, entrarComoEstagiario, participacaoEstagio,
} from '@/modules/operacao/__tests__/estagiarioFixtures'
import type { LaboratorioResumo } from '@/modules/projetos/types/projetos'
import type { UsuarioSessao } from '@/modules/auth/types/session'
import { http } from '@/services/http'
import { useSessionStore } from '@/stores/session'
import { fakeAdapter } from '@/test/fakeAdapter'

const mocks = vi.hoisted(() => ({
  criar: vi.fn(),
  listarParticipacoesEstagiario: vi.fn(),
}))

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/modules/pedidos/services/pedidoService', () => ({
  pedidoService: {
    listarProjetosPorLaboratorio: vi.fn().mockResolvedValue([]),
    listarEstoquePorUnidade: vi.fn().mockResolvedValue([
      { id: 'e-1', produtoId: 'p-1', produtoNome: 'Etanol', produtoUnidadeMedida: 'ML', quantidadeAtual: 500, ativo: true },
    ]),
    listarLotesPorEstoque: vi.fn().mockResolvedValue([]),
    criar: mocks.criar,
  },
}))
vi.mock('@/modules/operacao/services/contextoOperacionalService', () => ({
  contextoOperacionalService: { listarParticipacoesEstagiario: mocks.listarParticipacoesEstagiario },
}))

import NovoPedidoView from '@/modules/pedidos/views/solicitante/NovoPedidoView.vue'

async function montarComoEstagiario(laboratorios: LaboratorioResumo[]) {
  entrarComoEstagiario()
  mocks.listarParticipacoesEstagiario.mockResolvedValue([participacaoEstagio(laboratorios)])
  const wrapper = mount(NovoPedidoView)
  await flushPromises()
  return wrapper
}

// Fills the single item through the component state: the item widgets depend on stock lots
// that are irrelevant to the laboratory rule under test.
async function preencherItemEEnviar(wrapper: Awaited<ReturnType<typeof montarComoEstagiario>>) {
  const vm = wrapper.vm as unknown as { itens: Array<Record<string, unknown>> }
  Object.assign(vm.itens[0]!, { produtoId: 'p-1', modo: 'FISICA', unidadeFisica: 'ML', quantidadeFisica: 1 })
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('NovoPedidoView — laboratório do projeto do estagiário', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    mocks.criar.mockReset().mockResolvedValue({})
  })

  it('estagiário com projeto de 2 laboratórios vê seletor e envia laboratorioId', async () => {
    const wrapper = await montarComoEstagiario(DOIS_LABORATORIOS)

    const seletor = wrapper.find('select#laboratorio-projeto')
    expect(seletor.exists()).toBe(true)
    expect(seletor.findAll('option').map(o => o.text())).toEqual(['Selecione o laboratório', 'Lab A', 'Lab B'])

    await preencherItemEEnviar(wrapper)
    expect(mocks.criar).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Selecione o laboratório do projeto')

    await seletor.setValue('B')
    expect(wrapper.find('.context-grid').text()).toContain('Lab B')
    await preencherItemEEnviar(wrapper)
    expect(mocks.criar).toHaveBeenCalledWith(expect.objectContaining({ participacaoId: 'part-1', laboratorioId: 'B' }))
  })

  it('estagiário com projeto de 1 laboratório não vê seletor', async () => {
    const wrapper = await montarComoEstagiario(UM_LABORATORIO)

    expect(wrapper.find('select#laboratorio-projeto').exists()).toBe(false)
    expect(wrapper.find('.context-grid').text()).toContain('Lab A')
    await preencherItemEEnviar(wrapper)
    expect(mocks.criar).toHaveBeenCalledWith(expect.objectContaining({ participacaoId: 'part-1', laboratorioId: 'A' }))
  })
  it('projeto com 1 laboratório ativo e 1 inativo: não oferece o inativo e pré-seleciona o ativo', async () => {
    const wrapper = await montarComoEstagiario(UM_ATIVO_UM_INATIVO)

    expect(wrapper.find('select#laboratorio-projeto').exists()).toBe(false)
    expect(wrapper.findAll('option').map(o => o.text())).not.toContain('Lab Inativo')
    await preencherItemEEnviar(wrapper)
    expect(mocks.criar).toHaveBeenCalledWith(expect.objectContaining({ participacaoId: 'part-1', laboratorioId: 'A' }))
  })
})

describe('NovoPedidoView - laboratórios da pessoa', () => {
  const adapterOriginal = http.defaults.adapter

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    mocks.criar.mockReset().mockResolvedValue({})
  })
  afterEach(() => { http.defaults.adapter = adapterOriginal })

  it('pessoaComDoisLaboratoriosPodeEscolherQualquerUm', async () => {
    const usuario: UsuarioSessao = {
      id: 'u-2', nome: 'Pesquisadora', email: 'p@embrapa.br', perfil: 'PESQUISADOR', situacao: 'ATIVO',
      unidadeId: 'unidade-1', unidadeNome: 'Mandioca', unidadeSigla: 'CNPMF', ativo: true,
      laboratorios: DOIS_LABORATORIOS,
    }
    useSessionStore().$patch({ token: 'jwt', usuario, expiraEm: Date.now() + 60_000 })
    const { adapter } = fakeAdapter((config) => {
      if (config.url === '/v1/auth/me') return { status: 200, data: usuario }
      if (config.url === '/v1/laboratorios') {
        return { status: 200, data: [...DOIS_LABORATORIOS, { id: 'Z', nome: 'Lab Z', ativo: true }].map(l => ({ ...l, unidadeId: 'unidade-1' })) }
      }
      return { status: 200, data: [] }
    })
    http.defaults.adapter = adapter

    const wrapper = mount(NovoPedidoView)
    await flushPromises()

    const opcoes = wrapper.find('select:not(#laboratorio-projeto)').findAll('option').map(o => o.text())
    expect(opcoes).toHaveLength(2)
    expect(opcoes[0]).toContain('Lab A')
    expect(opcoes[1]).toContain('Lab B')
    expect(opcoes.join(' ')).not.toContain('Lab Z')
    expect(opcoes.join(' ')).not.toContain('base')
  })
})
