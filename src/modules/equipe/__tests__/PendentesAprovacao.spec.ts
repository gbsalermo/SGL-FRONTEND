import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import PendentesAprovacao from '@/modules/equipe/components/PendentesAprovacao.vue'
import { http } from '@/services/http'
import { fakeAdapter } from '@/test/fakeAdapter'

const pendentes = [
  { id: 'p-1', nome: 'Bia Bolsista', email: 'b@x', categoriaCargo: 'ESTAGIARIO', papeis: [], situacao: 'PENDENTE_VINCULACAO' },
  { id: 'p-2', nome: 'Caio Colaborador', email: null, categoriaCargo: 'TECNICO', papeis: [], situacao: 'PENDENTE_VINCULACAO' },
]

describe('PendentesAprovacao', () => {
  const adapterOriginal = http.defaults.adapter
  let fake: ReturnType<typeof fakeAdapter>
  let respostaAprovar: { status: number; data?: unknown }

  beforeEach(() => {
    respostaAprovar = { status: 200, data: { id: 'p-1' } }
    fake = fakeAdapter((config) => {
      if (config.method === 'get') return { status: 200, data: pendentes }
      return respostaAprovar
    })
    http.defaults.adapter = fake.adapter
  })

  afterEach(() => {
    http.defaults.adapter = adapterOriginal
  })

  async function montar() {
    const wrapper = mount(PendentesAprovacao, { props: { laboratorioId: 'lab-1' } })
    await flushPromises()
    return wrapper
  }

  it('lista todos os pendentes da unidade sem botao de recusar', async () => {
    const wrapper = await montar()

    expect(wrapper.text()).toContain('Bia Bolsista')
    expect(wrapper.text()).toContain('Caio Colaborador')
    expect(wrapper.text()).not.toContain('Recusar')
  })

  it('aprova com a categoria escolhida', async () => {
    const wrapper = await montar()

    await wrapper.get('[data-test="categoria-p-2"]').setValue('ANALISTA')
    await wrapper.get('[data-test="aprovar-p-2"]').trigger('click')
    await flushPromises()

    const post = fake.requests.find((r) => r.method === 'post')
    expect(post?.url).toBe('/v1/laboratorios/lab-1/equipe/pendentes/p-2/aprovar')
    expect(JSON.parse(post?.data as string)).toEqual({ categoriaCargo: 'ANALISTA' })
  })

  it('se outro responsavel aprovou antes, avisa e recarrega', async () => {
    respostaAprovar = { status: 409, data: { codigo: 'USUARIO_NAO_PENDENTE', message: 'x' } }
    const wrapper = await montar()

    await wrapper.get('[data-test="aprovar-p-1"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Esta pessoa já foi aprovada por outro responsável.')
    expect(fake.requests.filter((r) => r.method === 'get')).toHaveLength(2)
  })
})
