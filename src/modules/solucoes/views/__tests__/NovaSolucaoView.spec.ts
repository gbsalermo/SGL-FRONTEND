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
  solicitar: vi.fn(),
  listarParticipacoesEstagiario: vi.fn(),
}))

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/modules/solucoes/services/solucaoService', () => ({
  solucaoService: {
    listarModelos: vi.fn().mockResolvedValue([
      { id: 'm-1', unidadeId: 'unidade-1', nome: 'Tampão', descricao: null, instrucoesPreparo: null, ativo: true,
        componentes: [{ id: 'c-1', produtoId: 'p-1', produtoNome: 'Etanol', quantidade: 1, unidadeMedida: 'ML' }] },
    ]),
    listarProjetosPorLaboratorio: vi.fn().mockResolvedValue([]),
    listarProdutos: vi.fn().mockResolvedValue([]),
    solicitar: mocks.solicitar,
  },
}))
vi.mock('@/modules/operacao/services/contextoOperacionalService', () => ({
  contextoOperacionalService: { listarParticipacoesEstagiario: mocks.listarParticipacoesEstagiario },
}))

import NovaSolucaoView from '@/modules/solucoes/views/NovaSolucaoView.vue'

async function montarComoEstagiario(laboratorios: LaboratorioResumo[], laboratoriosDaPessoa?: LaboratorioResumo[]) {
  entrarComoEstagiario(laboratoriosDaPessoa)
  mocks.listarParticipacoesEstagiario.mockResolvedValue([participacaoEstagio(laboratorios)])
  const wrapper = mount(NovaSolucaoView)
  await flushPromises()
  return wrapper
}

async function escolherModeloEEnviar(wrapper: Awaited<ReturnType<typeof montarComoEstagiario>>) {
  ;(wrapper.vm as unknown as { modeloId: string }).modeloId = 'm-1'
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('NovaSolucaoView — laboratório do projeto do estagiário', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    mocks.solicitar.mockReset().mockResolvedValue({})
  })

  it('estagiário com projeto de 2 laboratórios vê seletor e envia laboratorioId', async () => {
    const wrapper = await montarComoEstagiario(DOIS_LABORATORIOS)

    const seletor = wrapper.find('select#laboratorio-projeto')
    expect(seletor.exists()).toBe(true)

    await escolherModeloEEnviar(wrapper)
    expect(mocks.solicitar).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Selecione o laboratório do projeto')

    await seletor.setValue('B')
    expect(wrapper.find('.context-grid').text()).toContain('Lab B')
    await escolherModeloEEnviar(wrapper)
    expect(mocks.solicitar).toHaveBeenCalledWith(expect.objectContaining({ participacaoId: 'part-1', laboratorioId: 'B' }))
  })

  it('estagiário com projeto de 1 laboratório não vê seletor', async () => {
    const wrapper = await montarComoEstagiario(UM_LABORATORIO)

    expect(wrapper.find('select#laboratorio-projeto').exists()).toBe(false)
    await escolherModeloEEnviar(wrapper)
    expect(mocks.solicitar).toHaveBeenCalledWith(expect.objectContaining({ participacaoId: 'part-1', laboratorioId: 'A' }))
  })
  it('projeto com 1 laboratório ativo e 1 inativo: não oferece o inativo e pré-seleciona o ativo', async () => {
    const wrapper = await montarComoEstagiario(UM_ATIVO_UM_INATIVO)

    expect(wrapper.find('select#laboratorio-projeto').exists()).toBe(false)
    expect(wrapper.findAll('option').map(o => o.text())).not.toContain('Lab Inativo')
    await escolherModeloEEnviar(wrapper)
    expect(mocks.solicitar).toHaveBeenCalledWith(expect.objectContaining({ participacaoId: 'part-1', laboratorioId: 'A' }))
  })
  it('não oferece laboratório do projeto que está fora da lista do estagiário', async () => {
    const wrapper = await montarComoEstagiario(DOIS_LABORATORIOS, [{ id: 'B', nome: 'Lab B', ativo: true }])

    expect(wrapper.find('select#laboratorio-projeto').exists()).toBe(false)
    expect(wrapper.find('.context-grid').text()).toContain('Lab B')
    expect(wrapper.find('.context-grid').text()).not.toContain('Lab A')
    await escolherModeloEEnviar(wrapper)
    expect(mocks.solicitar).toHaveBeenCalledWith(expect.objectContaining({ participacaoId: 'part-1', laboratorioId: 'B' }))
  })

  it('sem laboratório do projeto na lista do estagiário: avisa e bloqueia o envio', async () => {
    const wrapper = await montarComoEstagiario(UM_LABORATORIO, [])

    expect(wrapper.text()).toContain('Nenhum laboratório deste projeto está entre os seus laboratórios. Peça à Gestão para incluí-lo.')
    expect(wrapper.find('form button[type="submit"]').attributes('disabled')).toBeDefined()
  })
})

describe('NovaSolucaoView - laboratórios do empregado', () => {
  const adapterOriginal = http.defaults.adapter
  beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()) })
  afterEach(() => { http.defaults.adapter = adapterOriginal })

  it('empregadoVeTodosOsLaboratoriosAtivosComOsDaListaPrimeiro', async () => {
    const usuario: UsuarioSessao = {
      id: 'u-2', nome: 'Técnico', email: 't@embrapa.br', perfil: 'TECNICO', situacao: 'ATIVO',
      unidadeId: 'unidade-1', unidadeNome: 'Mandioca', unidadeSigla: 'CNPMF', ativo: true,
      laboratorios: [{ id: 'B', nome: 'Lab B', ativo: true }],
    }
    useSessionStore().$patch({ token: 'jwt', usuario, expiraEm: Date.now() + 60_000 })
    const { adapter } = fakeAdapter((config) => {
      if (config.url === '/v1/auth/me') return { status: 200, data: usuario }
      if (config.url === '/v1/laboratorios') {
        return {
          status: 200,
          data: [...DOIS_LABORATORIOS, { id: 'Z', nome: 'Lab Z', ativo: true }, { id: 'I', nome: 'Lab Inativo', ativo: false }]
            .map(l => ({ ...l, unidadeId: 'unidade-1' })),
        }
      }
      return { status: 200, data: [] }
    })
    http.defaults.adapter = adapter

    const wrapper = mount(NovaSolucaoView)
    await flushPromises()

    const seletor = wrapper.find('select:not(#laboratorio-projeto)')
    expect(seletor.findAll('option').map(o => o.text())).toEqual(['Lab B', 'Lab A', 'Lab Z'])
  })
})
