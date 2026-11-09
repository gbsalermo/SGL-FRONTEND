import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import EstagiariosVinculoPendente from '@/modules/estagiarios/components/EstagiariosVinculoPendente.vue'
import type { EstagiarioSemVinculoResponse } from '@/modules/estagiarios/types/estagiario'

const pendentes: EstagiarioSemVinculoResponse[] = [
  { usuarioId: 'u-1', nome: 'Amanda Souza', laboratorios: [{ id: 'lab-1', nome: 'Laboratório de Solos', ativo: true }, { id: 'lab-2', nome: 'Laboratório de Águas', ativo: true }] },
  { usuarioId: 'u-2', nome: 'Bruno Lima', laboratorios: [] },
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
  })

  it('oferecePontoDeAjudaDoVinculoDeEstagio', () => {
    const wrapper = mount(EstagiariosVinculoPendente, { props: { pendentes } })

    expect(wrapper.find('a.help-link').attributes('href')).toBe('/ajuda/vinculo-de-estagio')
  })

  it('mostraOsLaboratoriosDaPessoa', () => {
    const wrapper = mount(EstagiariosVinculoPendente, { props: { pendentes: [pendentes[0]] } })

    expect(wrapper.text()).toContain('Laboratório de Solos, Laboratório de Águas')
  })

  it('mostraSemLaboratorios', () => {
    const wrapper = mount(EstagiariosVinculoPendente, {
      props: { pendentes: [pendentes[1]] },
    })

    expect(wrapper.text()).toContain('Sem laboratórios')
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
