import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import EstagiariosVinculoPendente from '@/modules/estagiarios/components/EstagiariosVinculoPendente.vue'
import type { EstagiarioSemVinculoResponse } from '@/modules/estagiarios/types/estagiario'

const pendentes: EstagiarioSemVinculoResponse[] = [
  { usuarioId: 'u-1', nome: 'Amanda Souza', laboratorioId: 'lab-1', laboratorioNome: 'Laboratório de Solos' },
  { usuarioId: 'u-2', nome: 'Bruno Lima', laboratorioId: null, laboratorioNome: null },
]

function contar(texto: string, alvo: string) {
  return texto.split(alvo).length - 1
}

describe('EstagiariosVinculoPendente', () => {
  it('mostraSeloEBotaoPorPendente', () => {
    const wrapper = mount(EstagiariosVinculoPendente, { props: { pendentes } })

    expect(contar(wrapper.text(), 'Vínculo pendente')).toBe(2)
    expect(wrapper.findAll('button').filter((b) => b.text() === 'Criar vínculo')).toHaveLength(2)
    expect(wrapper.text()).toContain('Amanda Souza')
    expect(wrapper.text()).toContain('Laboratório de Solos')
  })

  it('mostraSemLaboratorioBase', () => {
    const wrapper = mount(EstagiariosVinculoPendente, {
      props: { pendentes: [pendentes[1]] },
    })

    expect(wrapper.text()).toContain('Sem laboratório-base')
  })

  it('emiteCriarVinculoComOPendente', async () => {
    const wrapper = mount(EstagiariosVinculoPendente, { props: { pendentes: [pendentes[0]] } })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('criar-vinculo')).toEqual([[pendentes[0]]])
  })

  it('naoRenderizaListaVazia', () => {
    const wrapper = mount(EstagiariosVinculoPendente, { props: { pendentes: [] } })

    expect(wrapper.text()).toBe('')
    expect(wrapper.findAll('button')).toHaveLength(0)
  })
})
