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

  async function abrir(pessoa: object = usuario) {
    const wrapper = mount(VinculosUsuariosCadastro, {
      props: { usuarios: [pessoa as never], laboratorios: [lab('l-1', 'Lab Um'), lab('l-2', 'Lab Dois')], projetos: [] },
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

  it('salvaListaDeEstagiario', async () => {
    const estagiario = { ...usuario, id: 'e-1', nome: 'ESTAGIARIO', perfil: 'ESTAGIARIO' }
    const wrapper = await abrir(estagiario)
    const caixas = wrapper.findAll('[data-test="lista-laboratorios"] input[type="checkbox"]')
    await caixas[0].setValue(true)

    await wrapper.get('[data-test="salvar-laboratorios"]').trigger('click')
    await flushPromises()

    const puts = fake.requests.filter((r) => r.method === 'put')
    expect(puts).toHaveLength(1)
    expect(puts[0].url).toBe('/v1/vinculos-operacionais/usuarios/e-1/laboratorios')
    expect(JSON.parse(puts[0].data)).toEqual({ laboratorioIds: ['l-1', 'l-2'] })
  })

  it('estagiarioNaoRecebeVinculoAdicional', async () => {
    const wrapper = await abrir({ ...usuario, id: 'e-1', perfil: 'ESTAGIARIO' })

    expect(wrapper.find('[data-test="novo-vinculo"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Estagiários usam vínculos de estágio e participações existentes.')
  })

  describe('edicaoDeVinculo', () => {
    const vinculo = (extra: object) => ({
      id: 'v-1', usuarioId: 'p-1', laboratorioId: 'l-2', laboratorioNome: 'Lab Dois', projetoId: null, projetoNome: null,
      sciId: null, sciNome: null, atividadeId: null, atividadeNome: null,
      dataInicio: '2020-01-01', dataFim: '2099-01-01', encerrado: false, observacao: null, ...extra,
    })
    async function abrirEdicao(extra: object) {
      fake = fakeAdapter((config) => {
        if (config.method === 'put') return { status: 200, data: vinculo({}) }
        if (config.url?.includes('/vinculos-operacionais') && config.method === 'get'
          && !config.url.includes('resumo')) return { status: 200, data: [vinculo(extra)] }
        return { status: 200, data: [] }
      })
      http.defaults.adapter = fake.adapter
      const wrapper = await abrir()
      const editar = wrapper.findAll('button').find((b) => b.text() === 'Editar vínculo')!
      await editar.trigger('click')
      return wrapper
    }
    const salvar = (w: Awaited<ReturnType<typeof abrir>>) =>
      w.findAll('button').find((b) => b.text() === 'Salvar alterações')!

    it('vinculoDeLaboratorioExigeDataFimNaEdicao', async () => {
      const wrapper = await abrirEdicao({})
      const campo = wrapper.get('[data-test="edicao-data-fim"]')
      await campo.setValue('')

      expect(salvar(wrapper).attributes('disabled')).toBeDefined()
      expect(wrapper.text()).toContain('Use a lista de laboratórios da pessoa para acesso sem prazo')

      await campo.setValue('2099-02-02')
      expect(salvar(wrapper).attributes('disabled')).toBeUndefined()
    })

    it('vinculoDeProjetoPermiteDataFimVazia', async () => {
      const wrapper = await abrirEdicao({ projetoId: 'pr-1', projetoNome: 'Projeto' })
      await wrapper.get('[data-test="edicao-data-fim"]').setValue('')

      expect(salvar(wrapper).attributes('disabled')).toBeUndefined()
    })
  })
})
