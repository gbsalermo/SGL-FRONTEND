import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import CriarVinculoEstagioDialog from '@/modules/estagiarios/components/CriarVinculoEstagioDialog.vue'
import EstagiariosGestaoView from '@/modules/estagiarios/views/EstagiariosGestaoView.vue'
import { http } from '@/services/http'
import { useSessionStore } from '@/stores/session'
import { fakeAdapter } from '@/test/fakeAdapter'

const pendente = {
  usuarioId: 'u-9',
  nome: 'MARIA DA SILVA',
  laboratorioId: 'lab-1',
  laboratorioNome: 'Laboratório 1',
}

describe('EstagiariosGestaoView - vínculo pendente', () => {
  const adapterOriginal = http.defaults.adapter
  let fake: ReturnType<typeof fakeAdapter>
  let semVinculo: unknown[]

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    useSessionStore().$patch({
      token: 'jwt',
      expiraEm: Date.now() + 60_000,
      usuario: { id: 'g-1', perfil: 'GESTOR', unidadeId: 'unidade-1' } as never,
    })
    semVinculo = [pendente]
    fake = fakeAdapter((config) => {
      if (config.url === '/v1/estagiarios/sem-vinculo') return { status: 200, data: semVinculo }
      return { status: 200, data: [] }
    })
    http.defaults.adapter = fake.adapter
  })
  afterEach(() => { http.defaults.adapter = adapterOriginal })

  const chamadas = (url: string) => fake.requests.filter((r) => r.url === url).length

  it('shows pending interns even when the main list is empty', async () => {
    const wrapper = mount(EstagiariosGestaoView)
    await flushPromises()

    expect(wrapper.text()).toContain('MARIA DA SILVA')
    expect(wrapper.text()).toContain('Vínculo pendente')
  })

  it('reloads both lists after the bond is created', async () => {
    const wrapper = mount(EstagiariosGestaoView)
    await flushPromises()
    await wrapper.get('button.detail-action').trigger('click')
    await flushPromises()
    const dialog = wrapper.getComponent(CriarVinculoEstagioDialog)
    expect(dialog.props('aberto')).toBe(true)

    semVinculo = []
    dialog.vm.$emit('criado', { id: 'e-1', usuarioId: 'u-9' })
    await flushPromises()

    expect(chamadas('/v1/estagiarios/sem-vinculo')).toBe(2)
    expect(chamadas('/v1/estagiarios')).toBe(2)
    expect(wrapper.text()).not.toContain('Vínculo pendente')
    expect(wrapper.findComponent(CriarVinculoEstagioDialog).exists()).toBe(false)
  })
})
