import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'

import AguardandoAprovacaoView from '@/modules/auth/views/AguardandoAprovacaoView.vue'

vi.mock('vue-router', () => ({ useRouter: () => ({ replace: vi.fn() }) }))

describe('AguardandoAprovacaoView', () => {
  it('orienta a avisar o responsavel do laboratorio', () => {
    setActivePinia(createPinia())
    const wrapper = mount(AguardandoAprovacaoView, { global: { stubs: { LoginBrandPanel: true } } })

    expect(wrapper.text()).toContain('Avise o responsável do seu laboratório: ele aprova o seu acesso no SGL.')
  })
})
