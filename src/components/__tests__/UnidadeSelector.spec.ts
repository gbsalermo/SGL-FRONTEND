import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import UnidadeSelector from '@/components/UnidadeSelector.vue'
import type { PerfilUsuario, UsuarioSessao } from '@/modules/auth/types/session'
import { http } from '@/services/http'
import { useSessionStore } from '@/stores/session'
import { fakeAdapter } from '@/test/fakeAdapter'

const unidades = [
  { id: 'unidade-1', sigla: 'CNPMF', nome: 'Mandioca e Fruticultura' },
  { id: 'unidade-2', sigla: 'CNPAT', nome: 'Agroindústria Tropical' },
]

function entrarComo(perfil: PerfilUsuario) {
  const usuario: UsuarioSessao = {
    id: 'u-1', nome: 'Fulano', email: 'f@embrapa.br', perfil, situacao: 'ATIVO',
    unidadeId: 'unidade-1', unidadeNome: 'Mandioca e Fruticultura', unidadeSigla: 'CNPMF',
    laboratorios: [], ativo: true,
  }
  const session = useSessionStore()
  session.$patch({ token: 'jwt', usuario, expiraEm: Date.now() + 60_000 })
  return session
}

describe('UnidadeSelector', () => {
  const adapterOriginal = http.defaults.adapter
  let fake: ReturnType<typeof fakeAdapter>

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    fake = fakeAdapter(() => ({ status: 200, data: unidades }))
    http.defaults.adapter = fake.adapter
  })
  afterEach(() => { http.defaults.adapter = adapterOriginal })

  it('nao renderiza para gestor', async () => {
    entrarComo('GESTOR')

    const wrapper = mount(UnidadeSelector)
    await flushPromises()

    expect(wrapper.find('select').exists()).toBe(false)
    expect(fake.requests).toHaveLength(0)
  })

  it('lista unidades com rotulo sigla — nome', async () => {
    entrarComo('ADMINISTRADOR_GERAL')

    const wrapper = mount(UnidadeSelector)
    await flushPromises()

    expect(fake.requests[0].url).toBe('/v1/unidades')
    const rotulos = wrapper.findAll('option').map((o) => o.text())
    expect(rotulos).toContain('CNPAT — Agroindústria Tropical')
  })

  it('trocar unidade chama selecionarUnidade com o id', async () => {
    const session = entrarComo('ADMINISTRADOR_GERAL')
    const selecionar = vi.spyOn(session, 'selecionarUnidade')
    const recarregar = vi.fn()

    const wrapper = mount(UnidadeSelector, { props: { recarregar } })
    await flushPromises()
    await wrapper.find('select').setValue('unidade-2')

    expect(selecionar).toHaveBeenCalledWith('unidade-2', 'CNPAT')
    expect(recarregar).toHaveBeenCalledOnce()
  })

  it('voltar para a propria unidade limpa a selecao', async () => {
    const session = entrarComo('ADMINISTRADOR_GERAL')
    session.selecionarUnidade('unidade-2', 'CNPAT')
    const recarregar = vi.fn()

    const wrapper = mount(UnidadeSelector, { props: { recarregar } })
    await flushPromises()
    await wrapper.find('select').setValue('unidade-1')

    expect(session.unidadeOperacaoId).toBeNull()
  })
})
