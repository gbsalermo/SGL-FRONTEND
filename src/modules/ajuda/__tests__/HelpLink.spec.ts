import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import HelpLink from '../components/HelpLink.vue'

describe('HelpLink', () => {
  it('opens the task in a new tab', () => {
    const link = mount(HelpLink, { props: { taskId: 'estoque-e-lotes' } }).get('a')
    expect(link.attributes('href')).toBe('/ajuda/estoque-e-lotes')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toContain('noopener')
    expect(link.attributes('title')).toBe('Ajuda desta tela')
    expect(link.text()).toContain('Ajuda')
  })

  it('points to the help home without a task', () => {
    const link = mount(HelpLink, { props: { taskId: null } }).get('a')
    expect(link.attributes('href')).toBe('/ajuda')
  })
})
