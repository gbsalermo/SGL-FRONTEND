import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import AcessoTemporario from '@/modules/equipe/components/AcessoTemporario.vue'
import { http } from '@/services/http'
import { useSessionStore } from '@/stores/session'
import { fakeAdapter } from '@/test/fakeAdapter'
import { usuarioDeTeste } from '@/test/sessaoDeTeste'

const vinculoVigente = {
  id: 'v-1', usuarioId: 'u-2', laboratorioId: 'lab-1', laboratorioNome: 'Lab', projetoId: null, projetoNome: null,
  sciId: null, sciNome: null, atividadeId: null, atividadeNome: null,
  dataInicio: '2026-11-01', dataFim: '2099-12-31', encerrado: false, observacao: null,
}
const vinculoAgendado = { ...vinculoVigente, id: 'v-2', dataInicio: '2099-01-01', dataFim: '2099-02-01' }
const usuarios = [
  { id: 'u-2', nome: 'Tiago Técnico', ativo: true, situacao: 'ATIVO', categoriaCargo: 'TECNICO', papeis: [] },
  { id: 'u-3', nome: 'Edu Estagiário', ativo: true, situacao: 'ATIVO', categoriaCargo: 'ESTAGIARIO', papeis: [] },
  { id: 'eu', nome: 'Eu Mesmo', ativo: true, situacao: 'ATIVO', categoriaCargo: 'PESQUISADOR', papeis: [] },
]

describe('AcessoTemporario', () => {
  const adapterOriginal = http.defaults.adapter
  let fake: ReturnType<typeof fakeAdapter>

  beforeEach(() => {
    setActivePinia(createPinia())
    useSessionStore().$patch({ token: 't', usuario: usuarioDeTeste('PESQUISADOR', { id: 'eu' }), expiraEm: Date.now() + 60_000 })
    fake = fakeAdapter((config) => {
      if (config.method === 'get' && config.url === '/v1/laboratorios/lab-1/equipe/vinculos') return { status: 200, data: [vinculoVigente, vinculoAgendado] }
      if (config.method === 'get' && config.url === '/v1/usuarios') return { status: 200, data: usuarios }
      if (config.method === 'get' && config.url === '/v1/projetos') return { status: 200, data: [] }
      return { status: 200, data: vinculoVigente }
    })
    http.defaults.adapter = fake.adapter
  })

  afterEach(() => {
    http.defaults.adapter = adapterOriginal
  })

  async function montar() {
    const wrapper = mount(AcessoTemporario, { props: { laboratorioId: 'lab-1' } })
    await flushPromises()
    return wrapper
  }

  it('lista os acessos do laboratorio com o nome da pessoa', async () => {
    const wrapper = await montar()

    expect(wrapper.text()).toContain('Tiago Técnico')
    expect(wrapper.text()).toContain('31/12/2099')
  })

  it('nao oferece estagiarios nem a propria pessoa', async () => {
    const wrapper = await montar()

    const opcoes = wrapper.findAll('[data-test="pessoa"] option').map((o) => o.text())
    expect(opcoes).toContain('Tiago Técnico')
    expect(opcoes).not.toContain('Edu Estagiário')
    expect(opcoes).not.toContain('Eu Mesmo')
  })

  it('criar envia o laboratorio desta equipe', async () => {
    const wrapper = await montar()

    await wrapper.get('[data-test="pessoa"]').setValue('u-2')
    await wrapper.get('[data-test="data-inicio"]').setValue('2026-12-01')
    await wrapper.get('[data-test="data-fim"]').setValue('2026-12-31')
    await wrapper.get('[data-test="criar"]').trigger('click')
    await flushPromises()

    const post = fake.requests.find((r) => r.method === 'post')
    expect(post?.url).toBe('/v1/laboratorios/lab-1/equipe/vinculos')
    expect(JSON.parse(post?.data as string)).toMatchObject({
      usuarioId: 'u-2', laboratorioId: 'lab-1', dataInicio: '2026-12-01', dataFim: '2026-12-31',
    })
  })

  it('acesso com inicio futuro aparece como agendado e pode ser encerrado', async () => {
    const wrapper = await montar()

    expect(wrapper.text()).toContain('Agendado')
    expect(wrapper.find('[data-test="encerrar-v-2"]').exists()).toBe(true)
  })

  it('edita a data final e a observacao', async () => {
    const wrapper = await montar()

    await wrapper.get('[data-test="editar-v-1"]').trigger('click')
    await wrapper.get('[data-test="editar-data-fim"]').setValue('2100-01-31')
    await wrapper.get('[data-test="editar-observacao"]').setValue('prorrogado')
    await wrapper.get('[data-test="salvar-edicao"]').trigger('click')
    await flushPromises()

    const put = fake.requests.find((r) => r.method === 'put')
    expect(put?.url).toBe('/v1/laboratorios/lab-1/equipe/vinculos/v-1')
    expect(JSON.parse(put?.data as string)).toEqual({ dataFim: '2100-01-31', observacao: 'prorrogado' })
  })

  it('encerrar pede confirmacao na tela', async () => {
    const wrapper = await montar()

    await wrapper.get('[data-test="encerrar-v-1"]').trigger('click')
    expect(fake.requests.some((r) => r.method === 'put')).toBe(false)
    await wrapper.get('[data-test="confirmar-encerramento"]').trigger('click')
    await flushPromises()

    expect(fake.requests.find((r) => r.method === 'put')?.url).toBe('/v1/laboratorios/lab-1/equipe/vinculos/v-1/encerrar')
  })
})
