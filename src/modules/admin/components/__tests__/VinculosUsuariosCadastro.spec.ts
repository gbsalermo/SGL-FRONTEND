import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import VinculosUsuariosCadastro from '@/modules/admin/components/VinculosUsuariosCadastro.vue'
import { http } from '@/services/http'
import { fakeAdapter } from '@/test/fakeAdapter'

const lab = (id: string, nome: string) => ({ id, unidadeId: 'u-1', nome, descricao: null, responsavelId: null, responsavelNome: null, ativo: true })
const usuario = {
  id: 'p-1', nome: 'JOANA', email: 'joana@x', perfil: 'TECNICO', ativo: true, unidadeId: 'u-1',
  unidadeNome: 'Unidade', situacao: 'ATIVO', laboratorios: [{ id: 'l-1', nome: 'Lab Um', ativo: true }],
}

describe('VinculosUsuariosCadastro', () => {
  const adapterOriginal = http.defaults.adapter
  let fake: ReturnType<typeof fakeAdapter>

  beforeEach(() => {
    setActivePinia(createPinia())
    fake = fakeAdapter((config) => {
      if (config.method === 'put') return { status: 204 }
      return { status: 200, data: [] }
    })
    http.defaults.adapter = fake.adapter
  })
  afterEach(() => { http.defaults.adapter = adapterOriginal })

  async function abrir() {
    const wrapper = mount(VinculosUsuariosCadastro, {
      props: { usuarios: [usuario as never], laboratorios: [lab('l-1', 'Lab Um'), lab('l-2', 'Lab Dois')], projetos: [] },
      global: { stubs: { 'router-link': true } },
    })
    await flushPromises()
    await wrapper.get('button.people-outline').trigger('click')
    await flushPromises()
    return wrapper
  }

  it('salvaListaDeLaboratorios', async () => {
    const wrapper = await abrir()
    const caixas = wrapper.findAll('[data-test="lista-laboratorios"] input[type="checkbox"]')
    await caixas[0].setValue(true) // Lab Dois (alphabetical) joins Lab Um

    await wrapper.get('[data-test="salvar-laboratorios"]').trigger('click')
    await flushPromises()

    const puts = fake.requests.filter((r) => r.method === 'put')
    expect(puts).toHaveLength(1)
    expect(puts[0].url).toBe('/v1/vinculos-operacionais/usuarios/p-1/laboratorios')
    expect(JSON.parse(puts[0].data)).toEqual({ laboratorioIds: ['l-1', 'l-2'] })
    expect(wrapper.text()).not.toContain('base')
  })

  it('vinculoAdicionalSemPrazoNemRestricaoNaoPodeSalvar', async () => {
    const wrapper = await abrir()
    await wrapper.get('[data-test="novo-vinculo"]').trigger('click')
    await wrapper.get('[data-test="vinculo-laboratorio"]').setValue('l-2')
    const confirmar = wrapper.get('[data-test="confirmar-vinculo"]')

    expect(confirmar.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Use a lista de laboratórios da pessoa para acesso sem prazo')

    await wrapper.get('[data-test="vinculo-data-fim"]').setValue('2027-01-31')

    expect(confirmar.attributes('disabled')).toBeUndefined()
  })
})
