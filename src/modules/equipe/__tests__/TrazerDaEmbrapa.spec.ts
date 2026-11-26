import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import TrazerDaEmbrapa from '@/modules/equipe/components/TrazerDaEmbrapa.vue'
import { http } from '@/services/http'
import { fakeAdapter } from '@/test/fakeAdapter'

function pessoa(referencia: string, nome: string, categoriaSugerida: string) {
  return { referencia, tipo: 'COLABORADOR', nome, matricula: null, cargo: null, sublotacao: null, unidadeNome: null,
    email: null, jaCadastrado: false, situacao: null, categoriaSugerida }
}

describe('TrazerDaEmbrapa', () => {
  const adapterOriginal = http.defaults.adapter
  let fake: ReturnType<typeof fakeAdapter>

  beforeEach(() => {
    vi.useFakeTimers()
    fake = fakeAdapter((config) => {
      if (config.method === 'get') {
        const termo = (config.params as { termo: string }).termo
        if (termo === 'ana') return { status: 200, data: [pessoa('1', 'Ana Bolsista', 'ESTAGIARIO'), pessoa('2', 'Ana Estagiária', 'ESTAGIARIO')] }
        if (termo === 'jo') return { status: 200, data: [] }
        if (termo === 'joa') return { status: 200, data: [pessoa('3', 'Joana Colaboradora', 'TECNICO')] }
      }
      if (config.method === 'post') {
        const { itens } = JSON.parse(config.data as string) as { itens: Array<{ referencia: string }> }
        return { status: 200, data: itens.map((item, i) => ({
          referencia: item.referencia, nome: null, resultado: i === 1 ? 'JA_CADASTRADA' : 'CADASTRADA', mensagem: null,
        })) }
      }
      return { status: 200, data: [] }
    })
    http.defaults.adapter = fake.adapter
  })

  afterEach(() => {
    vi.useRealTimers()
    http.defaults.adapter = adapterOriginal
  })

  async function buscar(wrapper: ReturnType<typeof mount>, termo: string) {
    await wrapper.get('[data-test="busca"]').setValue(termo)
    await vi.advanceTimersByTimeAsync(350)
    await flushPromises()
  }

  it('so busca a partir de 3 letras', async () => {
    const wrapper = mount(TrazerDaEmbrapa, { props: { laboratorioId: 'lab-1' } })

    await buscar(wrapper, 'an')

    expect(fake.requests).toHaveLength(0)
  })

  it('a selecao se acumula entre buscas e cadastra todos de uma vez com a categoria escolhida', async () => {
    const wrapper = mount(TrazerDaEmbrapa, { props: { laboratorioId: 'lab-1' } })

    await buscar(wrapper, 'ana')
    await wrapper.get('[data-test="marcar-1"]').setValue(true)
    await wrapper.get('[data-test="marcar-2"]').setValue(true)
    await buscar(wrapper, 'joa')
    await wrapper.get('[data-test="marcar-3"]').setValue(true)

    expect(wrapper.get('[data-test="selecionados"]').text()).toContain('Selecionados (3)')
    await wrapper.get('[data-test="categoria-3"]').setValue('ANALISTA')
    await wrapper.get('[data-test="cadastrar"]').trigger('click')
    await flushPromises()

    const post = fake.requests.find((r) => r.method === 'post')
    expect(post?.url).toBe('/v1/laboratorios/lab-1/equipe/importar')
    expect(JSON.parse(post?.data as string).itens).toEqual([
      { tipo: 'COLABORADOR', referencia: '1', categoriaCargo: 'ESTAGIARIO' },
      { tipo: 'COLABORADOR', referencia: '2', categoriaCargo: 'ESTAGIARIO' },
      { tipo: 'COLABORADOR', referencia: '3', categoriaCargo: 'ANALISTA' },
    ])
    expect(wrapper.text()).toContain('Cadastrada')
    expect(wrapper.text()).toContain('Já estava no SGL')
    expect(wrapper.emitted('cadastradas')).toHaveLength(1)
  })

  it('remover da selecao tira a pessoa do lote', async () => {
    const wrapper = mount(TrazerDaEmbrapa, { props: { laboratorioId: 'lab-1' } })

    await buscar(wrapper, 'ana')
    await wrapper.get('[data-test="marcar-1"]').setValue(true)
    await wrapper.get('[data-test="remover-1"]').trigger('click')

    expect(wrapper.get('[data-test="selecionados"]').text()).toContain('Selecionados (0)')
    expect(wrapper.get('[data-test="cadastrar"]').attributes('disabled')).toBeDefined()
  })
})
