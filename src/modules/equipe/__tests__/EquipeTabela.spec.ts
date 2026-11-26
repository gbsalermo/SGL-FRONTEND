import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import EquipeTabela from '@/modules/equipe/components/EquipeTabela.vue'
import { http } from '@/services/http'
import { useSessionStore } from '@/stores/session'
import { fakeAdapter } from '@/test/fakeAdapter'
import { usuarioDeTeste } from '@/test/sessaoDeTeste'

const membros = [
  { usuarioId: 'resp', nome: 'Rita Responsável', email: 'r@x', papeis: [], categoriaCargo: 'PESQUISADOR', cargo: null,
    permanente: true, acessoTemporarioAte: null, responsavel: true },
  { usuarioId: 'u-2', nome: 'Tiago Técnico', email: 't@x', papeis: [], categoriaCargo: 'TECNICO', cargo: 'Técnico A',
    permanente: true, acessoTemporarioAte: null, responsavel: false },
  { usuarioId: 'u-3', nome: 'Vera Visitante', email: 'v@x', papeis: [], categoriaCargo: 'ANALISTA', cargo: null,
    permanente: false, acessoTemporarioAte: '2026-12-31', responsavel: false },
]
const usuariosDaUnidade = [
  { id: 'resp', nome: 'Rita Responsável', ativo: true, situacao: 'ATIVO' },
  { id: 'u-2', nome: 'Tiago Técnico', ativo: true, situacao: 'ATIVO' },
  { id: 'u-4', nome: 'Paulo Pesquisador', ativo: true, situacao: 'ATIVO' },
  { id: 'u-5', nome: 'Paula Pendente', ativo: true, situacao: 'PENDENTE_VINCULACAO' },
  { id: 'u-6', nome: 'Ivo Inativo', ativo: false, situacao: 'ATIVO' },
]

describe('EquipeTabela', () => {
  const adapterOriginal = http.defaults.adapter
  let fake: ReturnType<typeof fakeAdapter>

  beforeEach(() => {
    setActivePinia(createPinia())
    useSessionStore().$patch({ token: 't', usuario: usuarioDeTeste('PESQUISADOR', { id: 'resp' }), expiraEm: Date.now() + 60_000 })
    fake = fakeAdapter((config) => {
      if (config.method === 'get' && config.url === '/v1/laboratorios/lab-1/equipe') return { status: 200, data: membros }
      if (config.method === 'get' && config.url === '/v1/usuarios') return { status: 200, data: usuariosDaUnidade }
      return { status: 200, data: null }
    })
    http.defaults.adapter = fake.adapter
  })

  afterEach(() => {
    http.defaults.adapter = adapterOriginal
  })

  async function montar() {
    const wrapper = mount(EquipeTabela, { props: { laboratorioId: 'lab-1' } })
    await flushPromises()
    return wrapper
  }

  it('lista a equipe com o tipo de acesso', async () => {
    const wrapper = await montar()

    expect(wrapper.text()).toContain('Rita Responsável')
    expect(wrapper.text()).toContain('Responsável')
    expect(wrapper.text()).toContain('Permanente')
    expect(wrapper.text()).toContain('Temporário até 31/12/2026')
  })

  it('nao oferece retirar a si mesmo nem o responsavel', async () => {
    const wrapper = await montar()

    expect(wrapper.find('[data-test="retirar-resp"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="retirar-u-2"]').exists()).toBe(true)
  })

  it('retirar pede confirmacao na tela e depois chama a API', async () => {
    const wrapper = await montar()

    await wrapper.get('[data-test="retirar-u-2"]').trigger('click')
    expect(fake.requests.some((r) => r.method === 'delete')).toBe(false)
    expect(wrapper.text()).toContain('Retirar Tiago Técnico deste laboratório?')

    await wrapper.get('[data-test="confirmar-retirada"]').trigger('click')
    await flushPromises()

    expect(fake.requests.find((r) => r.method === 'delete')?.url).toBe('/v1/laboratorios/lab-1/equipe/u-2')
  })

  it('incluir oferece so usuarios ativos, aprovados e fora da equipe', async () => {
    const wrapper = await montar()

    await wrapper.get('[data-test="abrir-incluir"]').trigger('click')
    await flushPromises()
    const opcoes = wrapper.findAll('[data-test="opcao-incluir"]').map((o) => o.text())

    expect(opcoes).toEqual(['Paulo Pesquisador'])

    await wrapper.get('[data-test="opcao-incluir"]').trigger('click')
    await flushPromises()
    expect(fake.requests.find((r) => r.method === 'post')?.url).toBe('/v1/laboratorios/lab-1/equipe/u-4')
  })
})
