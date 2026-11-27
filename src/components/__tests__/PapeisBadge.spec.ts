import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

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

  it('abreParaCimaEDentroDaTelaPertoDaBordaInferior', async () => {
    vi.stubGlobal('innerHeight', 800)
    vi.stubGlobal('innerWidth', 400)
    const wrapper = mount(PapeisBadge, { props: { usuario: TRES_ITENS }, attachTo: document.body })
    const rect = (r: Partial<DOMRect>) => ({ x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON: () => ({}), ...r }) as DOMRect
    wrapper.get('button').element.getBoundingClientRect = () => rect({ top: 760, bottom: 776, left: 350, right: 420 })
    const proto = HTMLElement.prototype.getBoundingClientRect
    HTMLElement.prototype.getBoundingClientRect = function () {
      return this.getAttribute('role') === 'tooltip' ? rect({ width: 200, height: 80 }) : proto.call(this)
    }
    try {
      await wrapper.trigger('mouseenter')
      await nextTick()
      const style = (wrapper.get('[role="tooltip"]').element as HTMLElement).style
      expect(style.top).toBe(`${760 - 80 - 6}px`)
      expect(style.left).toBe(`${400 - 200 - 8}px`)
    } finally {
      HTMLElement.prototype.getBoundingClientRect = proto
      vi.unstubAllGlobals()
      wrapper.unmount()
    }
  })
})
