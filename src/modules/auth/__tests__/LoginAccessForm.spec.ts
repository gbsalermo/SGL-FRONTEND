import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import LoginAccessForm from '@/modules/auth/components/LoginAccessForm.vue'
import { http } from '@/services/http'

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

  describe('link to the test-user page', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    async function montarCom(devLoginAtivo: boolean) {
      vi.spyOn(http, 'get').mockResolvedValue({ data: { devLoginAtivo } })
      const router = createRouter({
        history: createMemoryHistory(),
        routes: [
          { path: '/ajuda', component: { template: '<div />' } },
          { path: '/login/teste', component: { template: '<div />' } },
        ],
      })
      const wrapper = mount(LoginAccessForm, { global: { plugins: [createPinia(), router] } })
      await flushPromises()
      return wrapper
    }

    it('shows the link when the dev login is active', async () => {
      const link = (await montarCom(true)).find('a.login-dev')

      expect(link.text()).toBe('Entrar como usuário de teste')
      expect(link.attributes('href')).toBe('/login/teste')
    })

    it('hides the link when the dev login is inactive', async () => {
      expect((await montarCom(false)).find('a.login-dev').exists()).toBe(false)
    })
  })
})
