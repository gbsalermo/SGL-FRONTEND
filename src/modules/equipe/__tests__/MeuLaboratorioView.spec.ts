import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import MeuLaboratorioView from '@/modules/equipe/views/MeuLaboratorioView.vue'
import { http } from '@/services/http'
import { useSessionStore } from '@/stores/session'
import { fakeAdapter } from '@/test/fakeAdapter'
import { type PerfilDeTeste, usuarioDeTeste } from '@/test/sessaoDeTeste'

const stubs = { EquipeTabela: true, PendentesAprovacao: true, TrazerDaEmbrapa: true, AcessoTemporario: true }

describe('MeuLaboratorioView', () => {
  const adapterOriginal = http.defaults.adapter
  let fake: ReturnType<typeof fakeAdapter>

  beforeEach(() => {
    setActivePinia(createPinia())
    fake = fakeAdapter(() => ({ status: 200, data: [
      { id: 'lab-a', unidadeId: 'unidade-1', nome: 'Lab A', ativo: true },
      { id: 'lab-x', unidadeId: 'unidade-1', nome: 'Lab Inativo', ativo: false },
      { id: 'lab-b', unidadeId: 'unidade-1', nome: 'Lab B', ativo: true },
    ] }))
    http.defaults.adapter = fake.adapter
  })

  afterEach(() => {
    http.defaults.adapter = adapterOriginal
  })

  function entrar(perfil: PerfilDeTeste, responsavelPor: { id: string; nome: string; ativo: boolean }[] = []) {
    useSessionStore().$patch({ token: 't', expiraEm: Date.now() + 60_000, usuario: usuarioDeTeste(perfil, { responsavelPor }) })
  }

  it('responsavel escolhe entre os laboratorios de que e responsavel', async () => {
    entrar('PESQUISADOR', [{ id: 'lab-a', nome: 'Lab A', ativo: true }, { id: 'lab-b', nome: 'Lab B', ativo: true }])
    const wrapper = mount(MeuLaboratorioView, { global: { stubs } })
    await flushPromises()

    const opcoes = wrapper.findAll('[data-test="laboratorio"] option').map((o) => o.text())
    expect(opcoes).toEqual(['Lab A', 'Lab B'])
    expect(fake.requests).toHaveLength(0)
  })

  it('administrador escolhe entre os laboratorios ativos da unidade', async () => {
    entrar('ADMINISTRADOR')
    const wrapper = mount(MeuLaboratorioView, { global: { stubs } })
    await flushPromises()

    const opcoes = wrapper.findAll('[data-test="laboratorio"] option').map((o) => o.text())
    expect(opcoes).toEqual(['Lab A', 'Lab B'])
  })

  it('administrador sem laboratorio escolhido ve o titulo das equipes', async () => {
    fake = fakeAdapter(() => ({ status: 200, data: [] }))
    http.defaults.adapter = fake.adapter
    entrar('ADMINISTRADOR')
    const wrapper = mount(MeuLaboratorioView, { global: { stubs } })
    await flushPromises()

    expect(wrapper.get('h1').text()).toBe('Equipes dos laboratórios')
    expect(wrapper.text()).toContain('Nenhum laboratório ativo na Unidade.')
  })

  it('mostra as quatro abas', async () => {
    entrar('PESQUISADOR', [{ id: 'lab-a', nome: 'Lab A', ativo: true }])
    const wrapper = mount(MeuLaboratorioView, { global: { stubs } })
    await flushPromises()

    const abas = wrapper.findAll('[role="tab"]').map((t) => t.text())
    expect(abas).toEqual(['Equipe', 'Aguardando aprovação', 'Trazer da Embrapa', 'Acesso temporário'])
  })
})
