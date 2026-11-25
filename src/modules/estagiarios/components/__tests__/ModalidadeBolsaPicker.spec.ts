import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import ModalidadeBolsaPicker from '@/modules/estagiarios/components/ModalidadeBolsaPicker.vue'
import { http } from '@/services/http'
import { fakeAdapter } from '@/test/fakeAdapter'

const modalidade = {
  id: 'modalidade-1',
  unidadeId: 'unidade-1',
  nome: 'Bolsa FAPESB',
  tipoBase: 'BOLSA_INSTITUCIONAL',
  ativo: true,
}

describe('ModalidadeBolsaPicker', () => {
  const adapterOriginal = http.defaults.adapter
  let fake: ReturnType<typeof fakeAdapter>

  beforeEach(() => {
    fake = fakeAdapter((config) => {
      if (config.url === '/v1/modalidades-bolsa/ativas') {
        return { status: 200, data: [modalidade] }
      }
      if (config.url === '/v1/modalidades-bolsa' && config.method === 'post') {
        return {
          status: 201,
          data: { ...modalidade, id: 'modalidade-nova', nome: 'Bolsa PIBIC' },
        }
      }
      return { status: 200, data: [] }
    })
    http.defaults.adapter = fake.adapter
  })

  afterEach(() => { http.defaults.adapter = adapterOriginal })

  it('reutiliza somente modalidades compatíveis com o tipo base', async () => {
    const wrapper = mount(ModalidadeBolsaPicker, {
      props: { tipoBase: 'BOLSA_INSTITUCIONAL', modelValue: null },
    })
    await flushPromises()
    expect(wrapper.text()).toContain('Bolsa FAPESB')

    await wrapper.setProps({ tipoBase: 'BOLSA_CAPES' })
    expect(wrapper.text()).not.toContain('Bolsa FAPESB')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
  })

  it('cadastra nova modalidade na Unidade e a seleciona', async () => {
    const wrapper = mount(ModalidadeBolsaPicker, {
      props: { tipoBase: 'BOLSA_INSTITUCIONAL', modelValue: null },
    })
    await flushPromises()

    await wrapper.get('button.modalidade-link').trigger('click')
    await wrapper.get('[data-test="nome-nova-modalidade"]').setValue('Bolsa PIBIC')
    await wrapper.get('[data-test="criar-modalidade"]').trigger('click')
    await flushPromises()

    expect(fake.requests.some((r) => r.url === '/v1/modalidades-bolsa' && r.method === 'post')).toBe(true)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['modalidade-nova'])
    expect(wrapper.text()).toContain('Modalidade cadastrada na Unidade')
  })

  it('permite manter o fluxo legado sem modalidade customizada', async () => {
    const wrapper = mount(ModalidadeBolsaPicker, {
      props: { tipoBase: 'VOLUNTARIO', modelValue: null },
    })
    await flushPromises()
    expect(wrapper.get('[data-test="selecionar-modalidade"]').element).toBeTruthy()
    expect(wrapper.get('[data-test="selecionar-modalidade"]').element.value).toBe('')
  })
})
