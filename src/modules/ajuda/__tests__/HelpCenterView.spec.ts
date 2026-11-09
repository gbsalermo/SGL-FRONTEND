import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import { router } from '@/router'
import { FEATURED_TASK_IDS, findHelpTask } from '@/modules/ajuda/helpTasks'
import { renderHelpMarkdown } from '@/modules/ajuda/renderHelpMarkdown'
import HelpCenterView from '@/modules/ajuda/views/HelpCenterView.vue'

async function mountAt(path: string) {
  const pinia = createPinia()
  setActivePinia(pinia)
  await router.push(path)
  await router.isReady()
  const wrapper = mount(HelpCenterView, { global: { plugins: [pinia, router] } })
  await flushPromises()
  return wrapper
}

describe('HelpCenterView', () => {
  it('home shows the four featured tasks', async () => {
    const wrapper = await mountAt('/ajuda')
    const links = wrapper.findAll('[data-testid="featured-task"]')
    expect(links).toHaveLength(4)
    const titles = FEATURED_TASK_IDS.map((id) => findHelpTask(id)!.title)
    expect(links.map((link) => link.find('strong').text())).toEqual(expect.arrayContaining(titles))
  })

  it('task page shows title, video and steps', async () => {
    const wrapper = await mountAt('/ajuda/informar-um-residuo')
    expect(wrapper.find('h1').text()).toBe('Informar um resíduo')
    const video = wrapper.find('video')
    expect(video.attributes('src')).toBe('/ajuda/videos/08-informar-um-residuo.mp4')
    expect(video.attributes('poster')).toBe('/ajuda/posters/informar-um-residuo.jpg')
    expect(video.attributes('controls')).toBeDefined()
    expect(video.attributes('preload')).toBe('metadata')
    expect(wrapper.find('.help-text ol').exists()).toBe(true)
  })

  it('menu search filters tasks', async () => {
    const wrapper = await mountAt('/ajuda')
    const input = wrapper.find('input[type="search"]')
    await input.setValue('lote')
    const menu = wrapper.find('nav').text()
    expect(menu).toContain('Estoque e lotes')
    expect(menu).not.toContain('Informar um resíduo')
    await input.setValue('zzzxyz')
    expect(wrapper.find('nav').text()).toContain('Nenhuma tarefa encontrada.')
  })

  it('missing video shows a friendly message', async () => {
    const wrapper = await mountAt('/ajuda/informar-um-residuo')
    await wrapper.find('video').trigger('error')
    expect(wrapper.find('video').exists()).toBe(false)
    expect(wrapper.text()).toContain('Vídeo indisponível no momento.')
    expect(wrapper.find('.help-text ol').exists()).toBe(true)
  })

  it('faq page renders the questions', async () => {
    const wrapper = await mountAt('/ajuda/perguntas-frequentes')
    expect(wrapper.find('h1').text()).toBe('Perguntas frequentes')
  })

  it('mobile menu toggle', async () => {
    const wrapper = await mountAt('/ajuda')
    const button = wrapper.find('[data-testid="menu-toggle"]')
    expect(button.text()).toContain('Tarefas')
    expect(wrapper.find('.help-menu').classes()).not.toContain('help-menu--open')
    await button.trigger('click')
    expect(wrapper.find('.help-menu').classes()).toContain('help-menu--open')
    expect(button.attributes('aria-expanded')).toBe('true')
    await button.trigger('click')
    expect(wrapper.find('.help-menu').classes()).not.toContain('help-menu--open')
  })

  it('escape closes the mobile menu', async () => {
    const wrapper = await mountAt('/ajuda')
    await wrapper.find('[data-testid="menu-toggle"]').trigger('click')
    expect(wrapper.find('.help-menu').classes()).toContain('help-menu--open')
    await wrapper.find('.help-center').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.help-menu').classes()).not.toContain('help-menu--open')
  })

  it('menu has FAQ and PDF links', async () => {
    const wrapper = await mountAt('/ajuda')
    expect(wrapper.find('a[href="/ajuda/perguntas-frequentes"]').exists()).toBe(true)
    const pdf = wrapper.find('a[href="/ajuda/sgl-guia.pdf"]')
    expect(pdf.attributes('download')).toBeDefined()
  })
})

describe('renderHelpMarkdown', () => {
  it('markdown html is not rendered', () => {
    const html = renderHelpMarkdown('oi <script>alert(1)</script>')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
})
