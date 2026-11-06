import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import CriarVinculoEstagioDialog from '@/modules/estagiarios/components/CriarVinculoEstagioDialog.vue'
import type { EstagiarioSemVinculoResponse } from '@/modules/estagiarios/types/estagiario'
import { http } from '@/services/http'
import { useSessionStore } from '@/stores/session'
import { fakeAdapter } from '@/test/fakeAdapter'

const pendente: EstagiarioSemVinculoResponse = {
  usuarioId: 'u-9',
  nome: 'MARIA DA SILVA',
  laboratorios: [{ id: 'lab-1', nome: 'Laboratório 1', ativo: true }],
}

const orientadores = [
  { usuarioId: 'o-1', nome: 'LEANDRO DE SOUZA ROCHA', perfil: 'ADMINISTRADOR', cargo: 'ANALISTA A' },
]
const atividades = [{ id: 'a-1', codigoSeg: '01.20', nome: 'Atividade Um' }]
const laboratorios = [
  { id: 'lab-1', unidadeId: 'unidade-1', nome: 'Laboratório 1', ativo: true },
  { id: 'lab-2', unidadeId: 'unidade-1', nome: 'Laboratório 2', ativo: true },
]

describe('CriarVinculoEstagioDialog', () => {
  const adapterOriginal = http.defaults.adapter
  let fake: ReturnType<typeof fakeAdapter>
  let respostaPost: () => { status: number; data?: unknown }

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    useSessionStore().$patch({
      token: 'jwt',
      expiraEm: Date.now() + 60_000,
      usuario: { id: 'g-1', perfil: 'GESTOR', unidadeId: 'unidade-1' } as never,
    })
    respostaPost = () => ({ status: 201, data: { id: 'e-1', usuarioId: 'u-9' } })
    fake = fakeAdapter((config) => {
      const url = config.url ?? ''
      if (config.method === 'post') return respostaPost()
      if (url === '/v1/estagiarios/orientadores-elegiveis') return { status: 200, data: orientadores }
      if (url === '/v1/atividades/ativos') return { status: 200, data: atividades }
      if (url === '/v1/laboratorios') return { status: 200, data: laboratorios }
      return { status: 200, data: [] }
    })
    http.defaults.adapter = fake.adapter
  })
  afterEach(() => { http.defaults.adapter = adapterOriginal })

  async function montar(dados: EstagiarioSemVinculoResponse = pendente) {
    const wrapper = mount(CriarVinculoEstagioDialog, { props: { pendente: dados, aberto: true } })
    await flushPromises()
    return wrapper
  }

  async function preencher(wrapper: Awaited<ReturnType<typeof montar>>, fim = '2027-02-01') {
    await wrapper.get('[data-test="orientador"]').setValue('o-1')
    await wrapper.get('[data-test="data-inicio"]').setValue('2026-11-01')
    await wrapper.get('[data-test="data-fim"]').setValue(fim)
    await wrapper.get('[data-test="tipo-bolsa"]').setValue('VOLUNTARIO')
    await wrapper.get('[data-test="formacao"]').setValue('GRADUACAO')
    await wrapper.get('[data-test="atividade"]').setValue('a-1')
  }

  const salvar = (wrapper: Awaited<ReturnType<typeof montar>>) => wrapper.get('[data-test="salvar"]')
  const posts = () => fake.requests.filter((r) => r.method === 'post')

  it('carregaOrientadoresElegiveis', async () => {
    const wrapper = await montar()

    expect(wrapper.text()).toContain('LEANDRO DE SOUZA ROCHA')
  })

  it('enviaPayloadEsperado', async () => {
    const wrapper = await montar()
    await preencher(wrapper)

    await salvar(wrapper).trigger('click')
    await flushPromises()

    expect(posts()).toHaveLength(1)
    expect(posts()[0].url).toBe('/v1/estagiarios')
    expect(JSON.parse(posts()[0].data)).toEqual({
      usuarioId: 'u-9',
      laboratorioId: 'lab-1',
      orientadorId: 'o-1',
      dataInicioEstagio: '2026-11-01',
      dataFimEstagio: '2027-02-01',
      tipoBolsa: 'VOLUNTARIO',
      formacao: 'GRADUACAO',
      formacaoOutro: null,
      atividadeId: 'a-1',
      cursoId: null,
      culturaIds: [],
      observacao: null,
      ativo: true,
    })
    expect(wrapper.emitted('criado')).toHaveLength(1)
  })

  it('mostraErroDaApiSemFechar', async () => {
    const mensagem = 'O orientador LEANDRO DE SOUZA ROCHA está inativo na base corporativa.'
    respostaPost = () => ({ status: 400, data: { message: mensagem } })
    const wrapper = await montar()
    await preencher(wrapper)

    await salvar(wrapper).trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain(mensagem)
    expect(wrapper.emitted('fechar')).toBeUndefined()
    expect(wrapper.emitted('criado')).toBeUndefined()
  })

  it('desabilitaSalvarDuranteEnvio', async () => {
    respostaPost = () => ({ status: 201, data: {} })
    // Hold the POST open so the in-flight state can be observed.
    let liberar: () => void = () => {}
    const original = http.defaults.adapter as (c: never) => Promise<unknown>
    http.defaults.adapter = (config) => (config.method === 'post'
      ? new Promise((resolve) => { liberar = () => resolve(original(config as never)) })
      : original(config as never)) as never
    const wrapper = await montar()
    await preencher(wrapper)

    await salvar(wrapper).trigger('click')
    await salvar(wrapper).trigger('click')

    expect(salvar(wrapper).attributes('disabled')).toBeDefined()
    liberar()
    await flushPromises()
    expect(posts()).toHaveLength(1)
  })

  it('exigeLaboratorioQuandoNaoHaBase', async () => {
    const wrapper = await montar({ ...pendente, laboratorios: [] })
    await preencher(wrapper)

    expect(salvar(wrapper).attributes('disabled')).toBeDefined()

    await wrapper.get('[data-test="laboratorio"]').setValue('lab-2')

    expect(salvar(wrapper).attributes('disabled')).toBeUndefined()
  })

  it('limpaLaboratorioForaDaLista', async () => {
    const wrapper = await montar({ ...pendente, laboratorios: [{ id: 'lab-inativo', nome: 'Lab inativo', ativo: false }] })
    await preencher(wrapper)

    expect(salvar(wrapper).attributes('disabled')).toBeDefined()

    await wrapper.get('[data-test="laboratorio"]').setValue('lab-2')

    expect(salvar(wrapper).attributes('disabled')).toBeUndefined()
  })

  it('ignoraFecharDuranteEnvio', async () => {
    let liberar: () => void = () => {}
    const original = http.defaults.adapter as (c: never) => Promise<unknown>
    http.defaults.adapter = (config) => (config.method === 'post'
      ? new Promise((resolve) => { liberar = () => resolve(original(config as never)) })
      : original(config as never)) as never
    const wrapper = await montar()
    await preencher(wrapper)
    await salvar(wrapper).trigger('click')

    await wrapper.get('.vinculo-backdrop').trigger('click')
    await wrapper.get('[aria-label="Fechar"]').trigger('click')
    await wrapper.get('[data-test="cancelar"]').trigger('click')

    expect(wrapper.emitted('fechar')).toBeUndefined()
    expect(wrapper.get('[data-test="cancelar"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[aria-label="Fechar"]').attributes('disabled')).toBeDefined()
    liberar()
    await flushPromises()
    expect(wrapper.emitted('criado')).toHaveLength(1)
  })

  it('fimAntesDoInicioDesabilita', async () => {
    const wrapper = await montar()
    await preencher(wrapper, '2026-10-01')

    expect(salvar(wrapper).attributes('disabled')).toBeDefined()
  })

  it('formacaoOutroExigeDescricao', async () => {
    const wrapper = await montar()
    await preencher(wrapper)
    await wrapper.get('[data-test="formacao"]').setValue('OUTRO')

    expect(salvar(wrapper).attributes('disabled')).toBeDefined()

    await wrapper.get('[data-test="formacao-outro"]').setValue('Técnico em agropecuária')

    expect(salvar(wrapper).attributes('disabled')).toBeUndefined()
  })
})
