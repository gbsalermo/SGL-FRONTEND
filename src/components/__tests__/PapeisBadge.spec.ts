import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import PapeisBadge from '@/components/PapeisBadge.vue'

const TRES_ITENS = {
  papeis: ['ADMINISTRADOR_LOCAL', 'GESTOR'] as const,
  responsavelPor: [{ id: 'lab-a', nome: 'Lab A' }],
}

describe('PapeisBadge', () => {
  it('mostraPrimeiroEContador', () => {
    const wrapper = mount(PapeisBadge, { props: { usuario: TRES_ITENS } })
    expect(wrapper.text()).toContain('Administrador local')
    expect(wrapper.text()).toContain('+2')
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
  })

  it('abreBalaoNoMouseENoFoco', async () => {
    const wrapper = mount(PapeisBadge, { props: { usuario: TRES_ITENS } })
    await wrapper.trigger('mouseenter')
    const itens = wrapper.findAll('[role="tooltip"] li').map((item) => item.text())
    expect(itens).toEqual(['Administrador local', 'Gestor', 'Responsável por Lab A'])
    await wrapper.trigger('mouseleave')
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)

    await wrapper.find('button').trigger('focusin')
    const tooltip = wrapper.find('[role="tooltip"]')
    expect(tooltip.exists()).toBe(true)
    expect(wrapper.find('button').attributes('aria-describedby')).toBe(tooltip.attributes('id'))
  })

  it('fechaComEsc', async () => {
    const wrapper = mount(PapeisBadge, { props: { usuario: TRES_ITENS } })
    await wrapper.find('button').trigger('focusin')
    await wrapper.find('button').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
  })

  it('umUnicoItemSemContadorNemBalao', async () => {
    const wrapper = mount(PapeisBadge, { props: { usuario: { papeis: ['GESTOR'] } } })
    expect(wrapper.text()).toBe('Gestor')
    expect(wrapper.find('button').exists()).toBe(false)
    await wrapper.trigger('mouseenter')
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
  })

  it('semNadaMostraTraco', async () => {
    const wrapper = mount(PapeisBadge, { props: { usuario: {} } })
    expect(wrapper.text()).toBe('—')
    await wrapper.trigger('mouseenter')
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
  })
})
