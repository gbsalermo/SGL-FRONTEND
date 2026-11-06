import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import ImportarPessoaDrawer from '@/modules/admin/components/ImportarPessoaDrawer.vue'
import { useSessionStore } from '@/stores/session'

const laboratorios = [
  { id: 'l-1', unidadeId: 'u-1', nome: 'Lab Um', descricao: null, responsavelId: null, responsavelNome: null, ativo: true },
  { id: 'l-2', unidadeId: 'u-1', nome: 'Lab Dois', descricao: null, responsavelId: null, responsavelNome: null, ativo: true },
  { id: 'l-3', unidadeId: 'u-1', nome: 'Lab Inativo', descricao: null, responsavelId: null, responsavelNome: null, ativo: false },
]

describe('ImportarPessoaDrawer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useSessionStore().$patch({ usuario: { id: 'a-1', perfil: 'ADMINISTRADOR_GERAL' } as never })
  })

  function montar() {
    return mount(ImportarPessoaDrawer, {
      props: { modo: 'importar', nome: 'MARIA', dados: [], perfilSugerido: null, laboratorios, salvando: false, erro: '' },
    })
  }
  const confirmar = (wrapper: ReturnType<typeof montar>) => wrapper.get('[data-test="confirmar"]')

  it('importaComDoisLaboratorios', async () => {
    const wrapper = montar()
    await wrapper.get('[data-test="perfil"]').setValue('TECNICO')
    const caixas = wrapper.findAll('input[type="checkbox"]')
    expect(caixas).toHaveLength(2) // inactive labs are not offered
    await caixas[0].setValue(true)
    await caixas[1].setValue(true)

    await confirmar(wrapper).trigger('click')

    expect(wrapper.emitted('confirmar')).toEqual([[{ perfil: 'TECNICO', laboratorioIds: ['l-2', 'l-1'] }]])
    expect(wrapper.text()).toContain('Laboratórios')
    expect(wrapper.text()).not.toContain('base')
  })

  it('perfilDeGestaoPodeConfirmarSemLaboratorio', async () => {
    const wrapper = montar()
    await wrapper.get('[data-test="perfil"]').setValue('GESTOR')

    expect(confirmar(wrapper).attributes('disabled')).toBeUndefined()
    await confirmar(wrapper).trigger('click')

    expect(wrapper.emitted('confirmar')).toEqual([[{ perfil: 'GESTOR', laboratorioIds: [] }]])
  })

  it('perfilOperacionalExigeAoMenosUm', async () => {
    const wrapper = montar()
    await wrapper.get('[data-test="perfil"]').setValue('ESTAGIARIO')

    expect(confirmar(wrapper).attributes('disabled')).toBeDefined()

    await wrapper.findAll('input[type="checkbox"]')[0].setValue(true)

    expect(confirmar(wrapper).attributes('disabled')).toBeUndefined()
  })
})
