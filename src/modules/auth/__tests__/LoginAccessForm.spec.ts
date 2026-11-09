import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import LoginAccessForm from '@/modules/auth/components/LoginAccessForm.vue'

describe('LoginAccessForm', () => {
  it('links to the public help center', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/ajuda', component: { template: '<div />' } }],
    })
    const wrapper = mount(LoginAccessForm, { global: { plugins: [createPinia(), router] } })

    const link = wrapper.find('a.login-help')
    expect(link.text()).toBe('Precisa de ajuda? Veja os guias com vídeo')
    expect(link.attributes('href')).toBe('/ajuda')
  })
})
