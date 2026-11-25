import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import BolsaPicker from '@/modules/estagiarios/components/BolsaPicker.vue'
import { http } from '@/services/http'
import { fakeAdapter } from '@/test/fakeAdapter'

const bolsa = {
  id: 'bolsa-1',
  unidadeId: 'unidade-1',
  nome: 'Bolsa FAPESB',
  ativo: true,
}

describe('BolsaPicker', () => {
  const originalAdapter = http.defaults.adapter
  let fake: ReturnType<typeof fakeAdapter>

  beforeEach(() => {
    fake = fakeAdapter((config) => {
      if (config.url === '/v1/bolsas/ativas') {
        return { status: 200, data: [bolsa] }
      }
      if (config.url === '/v1/bolsas' && config.method === 'post') {
        return { status: 201, data: { ...bolsa, id: 'bolsa-nova', nome: 'Bolsa PIBIC' } }
      }
      return { status: 200, data: [] }
    })
    http.defaults.adapter = fake.adapter
  })

  afterEach(() => { http.defaults.adapter = originalAdapter })

  it('lista bolsas cadastradas sem classificação base obrigatória', async () => {
    const wrapper = mount(BolsaPicker, { props: { modelValue: null } })
    await flushPromises()
    expect(wrapper.text()).toContain('Bolsa FAPESB')
    expect(wrapper.get('[data-test="selecionar-bolsa"]').exists()).toBe(true)
  })

  it('cadastra uma bolsa sem enviar qualquer valor do enum legado', async () => {
    const wrapper = mount(BolsaPicker, { props: { modelValue: null } })
    await flushPromises()
    await wrapper.get('button.bolsa-link').trigger('click')
    await wrapper.get('[data-test="nome-nova-bolsa"]').setValue('Bolsa PIBIC')
    await wrapper.get('[data-test="criar-bolsa"]').trigger('click')
    await flushPromises()

    const req = fake.requests.find((r) => r.url === '/v1/bolsas' && r.method === 'post')
    expect(req).toBeDefined()
    const payload = JSON.parse(String(req?.data ?? '{}'))
    expect(payload).toEqual({ nome: 'Bolsa PIBIC' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['bolsa-nova'])
  })

  it('permite permanecer sem bolsa selecionada antes de preencher o formulário', async () => {
    const wrapper = mount(BolsaPicker, { props: { modelValue: null } })
    await flushPromises()
    const select = wrapper.get('[data-test="selecionar-bolsa"]').element as HTMLSelectElement
    expect(select.value).toBe('')
  })
})
