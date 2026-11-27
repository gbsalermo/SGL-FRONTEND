import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AtualizadoEm from '@/components/AtualizadoEm.vue'

describe('AtualizadoEm', () => {
  it('mostraHorario', () => {
    const wrapper = mount(AtualizadoEm, { props: { at: new Date(2026, 10, 27, 9, 5), busy: false } })
    expect(wrapper.text()).toContain('Atualizado às 09:05')
  })

  it('semHorarioMostraSoIcone', () => {
    const wrapper = mount(AtualizadoEm, { props: { at: null, busy: false } })
    expect(wrapper.text()).not.toContain('Atualizado às')
    expect(wrapper.find('button[aria-label="Atualizar agora"]').exists()).toBe(true)
  })

  it('emiteRefreshAoClicar', async () => {
    const wrapper = mount(AtualizadoEm, { props: { at: null, busy: false } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('refresh')).toHaveLength(1)
  })

  it('desabilitaEnquantoOcupado', () => {
    const wrapper = mount(AtualizadoEm, { props: { at: new Date(), busy: true } })
    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.classes()).toContain('atualizado-em__button--spinning')
  })
})
