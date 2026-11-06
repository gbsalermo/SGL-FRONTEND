import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import LaboratoriosProjetoSelect from '@/modules/projetos/components/LaboratoriosProjetoSelect.vue'

const opcoes = [
  { id: 'A', nome: 'Lab A', ativo: true },
  { id: 'B', nome: 'Lab B', ativo: true },
]

describe('LaboratoriosProjetoSelect', () => {
  it('lista ativos e vinculados inativos marcados', () => {
    const wrapper = mount(LaboratoriosProjetoSelect, {
      props: { modelValue: [], opcoes, vinculados: [{ id: 'X', nome: 'Lab X', ativo: false }] },
    })

    const texto = wrapper.text()
    expect(texto).toContain('Lab A')
    expect(texto).toContain('Lab B')
    expect(texto).toContain('Lab X (inativo)')
    expect(texto).not.toContain('Lab A (inativo)')
  })

  it('emite os ids selecionados', async () => {
    const wrapper = mount(LaboratoriosProjetoSelect, {
      props: { modelValue: [], opcoes, vinculados: [] },
    })
    const caixas = wrapper.findAll('input[type="checkbox"]')

    await caixas[0].setValue(true)
    await wrapper.setProps({ modelValue: ['A'] })
    await caixas[1].setValue(true)

    expect(wrapper.emitted('update:modelValue')).toEqual([[['A']], [['A', 'B']]])
  })

  it('mostra erro quando nenhum selecionado', () => {
    const wrapper = mount(LaboratoriosProjetoSelect, {
      props: { modelValue: [], opcoes, vinculados: [] },
    })

    expect(wrapper.text()).toContain('Selecione ao menos um laboratório.')
  })

  it('não mostra erro quando há seleção', () => {
    const wrapper = mount(LaboratoriosProjetoSelect, {
      props: { modelValue: ['A'], opcoes, vinculados: [] },
    })

    expect(wrapper.text()).not.toContain('Selecione ao menos um laboratório.')
  })
})
