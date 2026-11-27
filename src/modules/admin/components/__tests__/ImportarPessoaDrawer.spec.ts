import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import ImportarPessoaDrawer from '@/modules/admin/components/ImportarPessoaDrawer.vue'
import type { CategoriaCargo } from '@/modules/auth/types/session'
import LaboratoriosSelect from '@/modules/operacao/components/LaboratoriosSelect.vue'
import { useSessionStore } from '@/stores/session'
import { type PerfilDeTeste, usuarioDeTeste } from '@/test/sessaoDeTeste'

const laboratorios = [
  { id: 'l-1', unidadeId: 'u-1', nome: 'Lab Um', descricao: null, responsavelId: null, responsavelNome: null, ativo: true },
  { id: 'l-2', unidadeId: 'u-1', nome: 'Lab Dois', descricao: null, responsavelId: null, responsavelNome: null, ativo: true },
  { id: 'l-3', unidadeId: 'u-1', nome: 'Lab Inativo', descricao: null, responsavelId: null, responsavelNome: null, ativo: false },
]

describe('ImportarPessoaDrawer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    entrarComo('ADMINISTRADOR_GERAL')
  })

  function entrarComo(perfil: PerfilDeTeste) {
    useSessionStore().$patch({ usuario: usuarioDeTeste(perfil) })
  }

  function montar(categoriaSugerida: CategoriaCargo | null = null) {
    return mount(ImportarPessoaDrawer, {
      props: { modo: 'importar', nome: 'MARIA', dados: [], categoriaSugerida, laboratorios, salvando: false, erro: '' },
    })
  }
  const confirmar = (wrapper: ReturnType<typeof montar>) => wrapper.get('[data-test="confirmar"]')
  const caixasDeLaboratorio = (wrapper: ReturnType<typeof montar>) =>
    wrapper.getComponent(LaboratoriosSelect).findAll('input[type="checkbox"]')

  it('importaComDoisLaboratoriosSemPapel', async () => {
    const wrapper = montar()
    await wrapper.get('[data-test="categoria"]').setValue('TECNICO')
    const caixas = caixasDeLaboratorio(wrapper)
    expect(caixas).toHaveLength(2) // inactive labs are not offered
    await caixas[0].setValue(true)
    await caixas[1].setValue(true)

    await confirmar(wrapper).trigger('click')

    expect(wrapper.emitted('confirmar')).toEqual([[{ papeis: [], categoriaCargo: 'TECNICO', laboratorioIds: ['l-2', 'l-1'] }]])
    expect(wrapper.text()).toContain('Laboratórios')
  })

  it('categoriaSugeridaJaVemSelecionada', () => {
    const wrapper = montar('PESQUISADOR')
    expect((wrapper.get('[data-test="categoria"]').element as HTMLSelectElement).value).toBe('PESQUISADOR')
  })

  it('papelDeGestaoPodeConfirmarSemLaboratorio', async () => {
    const wrapper = montar('PESQUISADOR')
    await wrapper.get('[data-test="papel-GESTOR"]').setValue(true)

    expect(confirmar(wrapper).attributes('disabled')).toBeUndefined()
    await confirmar(wrapper).trigger('click')

    expect(wrapper.emitted('confirmar')).toEqual([[{ papeis: ['GESTOR'], categoriaCargo: 'PESQUISADOR', laboratorioIds: [] }]])
  })

  it('semPapelExigeAoMenosUmLaboratorio', async () => {
    const wrapper = montar('ESTAGIARIO')

    expect(confirmar(wrapper).attributes('disabled')).toBeDefined()

    await caixasDeLaboratorio(wrapper)[0].setValue(true)

    expect(confirmar(wrapper).attributes('disabled')).toBeUndefined()
  })

  it('gestorNaoVeCaixasDePapel', () => {
    entrarComo('GESTOR')
    const wrapper = montar('TECNICO')

    expect(wrapper.find('[data-test^="papel-"]').exists()).toBe(false)
  })

  it('administradorLocalOfereceAdministradorLocalEGestor', () => {
    entrarComo('ADMINISTRADOR')
    const wrapper = montar('TECNICO')

    expect(wrapper.find('[data-test="papel-ADMINISTRADOR_LOCAL"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="papel-GESTOR"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="papel-ADMINISTRADOR_GERAL"]').exists()).toBe(false)
  })
})
