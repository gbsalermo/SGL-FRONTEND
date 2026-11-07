import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SeletorParticipacaoOperacional from '@/modules/operacao/components/SeletorParticipacaoOperacional.vue'
import { participacaoEstagio, UM_ATIVO_UM_INATIVO } from '@/modules/operacao/__tests__/estagiarioFixtures'

describe('SeletorParticipacaoOperacional', () => {
  it('mostra o laboratório inativo do projeto marcado como inativo', () => {
    const contexto = participacaoEstagio(UM_ATIVO_UM_INATIVO)
    const wrapper = mount(SeletorParticipacaoOperacional, {
      props: {
        opcoes: { contextosElegiveis: [contexto] } as never,
        modelValue: contexto.participacaoId,
        carregando: false,
      },
    })

    expect(wrapper.text()).toContain('Lab A, Lab Inativo (inativo)')
  })
})
