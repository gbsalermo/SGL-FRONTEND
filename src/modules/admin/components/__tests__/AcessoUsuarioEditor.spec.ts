import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import AcessoUsuarioEditor from '@/modules/admin/components/AcessoUsuarioEditor.vue'
import { cadastrosAdminService } from '@/modules/admin/services/cadastrosAdminService'
import type { UsuarioPermissao } from '@/modules/admin/types/cadastros'
import { useSessionStore } from '@/stores/session'
import { type PerfilDeTeste, usuarioDeTeste } from '@/test/sessaoDeTeste'

function alvo(extra: Partial<UsuarioPermissao> = {}): UsuarioPermissao {
  return {
    id: 'u-9', nome: 'Beltrano', email: 'b@embrapa.br', papeis: [], categoriaCargo: 'PESQUISADOR', cargo: 'PESQUISADOR A',
    unidadeId: 'unidade-1', unidadeNome: 'Mandioca', unidadeSigla: 'CNPMF', laboratorios: [], ativo: true, situacao: 'ATIVO',
    ...extra,
  }
}

describe('AcessoUsuarioEditor', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function entrarComo(perfil: PerfilDeTeste) {
    useSessionStore().$patch({ usuario: usuarioDeTeste(perfil, { id: 'eu' }) })
  }

  it('administrador local ve administrador local e gestor, mas nao administrador geral', () => {
    entrarComo('ADMINISTRADOR')
    const wrapper = mount(AcessoUsuarioEditor, { props: { usuario: alvo() } })

    expect(wrapper.find('[data-test="papel-ADMINISTRADOR_LOCAL"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="papel-GESTOR"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="papel-ADMINISTRADOR_GERAL"]').exists()).toBe(false)
  })

  it('marcar gestor e salvar envia os papeis', async () => {
    entrarComo('ADMINISTRADOR')
    const alterar = vi.spyOn(cadastrosAdminService, 'alterarPapeis').mockResolvedValue(alvo({ papeis: ['GESTOR'] }))
    const wrapper = mount(AcessoUsuarioEditor, { props: { usuario: alvo() } })

    await wrapper.get('[data-test="papel-GESTOR"]').setValue(true)
    await wrapper.get('[data-test="salvar-acesso"]').trigger('click')
    await flushPromises()

    expect(alterar).toHaveBeenCalledWith('u-9', { papeis: ['GESTOR'] })
    expect(wrapper.emitted('salvo')).toHaveLength(1)
  })

  it('ultimo administrador local mostra a mensagem da unidade', async () => {
    entrarComo('ADMINISTRADOR_GERAL')
    vi.spyOn(cadastrosAdminService, 'alterarPapeis').mockRejectedValue({
      isAxiosError: true,
      response: { status: 409, data: { codigo: 'ULTIMO_ADMINISTRADOR_LOCAL', message: 'x' } },
    })
    const wrapper = mount(AcessoUsuarioEditor, { props: { usuario: alvo({ papeis: ['ADMINISTRADOR_LOCAL'] }) } })

    await wrapper.get('[data-test="papel-ADMINISTRADOR_LOCAL"]').setValue(false)
    await wrapper.get('[data-test="salvar-acesso"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('A Unidade precisa de pelo menos um administrador local ativo.')
  })

  it('trocar so a categoria chama o ajuste de categoria', async () => {
    entrarComo('GESTOR')
    const papeis = vi.spyOn(cadastrosAdminService, 'alterarPapeis')
    const categoria = vi.spyOn(cadastrosAdminService, 'alterarCategoriaCargo').mockResolvedValue(alvo({ categoriaCargo: 'ESTAGIARIO' }))
    const wrapper = mount(AcessoUsuarioEditor, { props: { usuario: alvo() } })

    await wrapper.get('[data-test="categoria"]').setValue('ESTAGIARIO')
    await wrapper.get('[data-test="salvar-acesso"]').trigger('click')
    await flushPromises()

    expect(categoria).toHaveBeenCalledWith('u-9', { categoriaCargo: 'ESTAGIARIO' })
    expect(papeis).not.toHaveBeenCalled()
  })

  it('a propria pessoa nao edita o proprio acesso', () => {
    entrarComo('ADMINISTRADOR_GERAL')
    const wrapper = mount(AcessoUsuarioEditor, { props: { usuario: alvo({ id: 'eu' }) } })

    expect(wrapper.get('[data-test="salvar-acesso"]').attributes('disabled')).toBeDefined()
  })

  it('mostra o cargo da Embrapa sem permitir edicao', () => {
    entrarComo('ADMINISTRADOR_GERAL')
    const wrapper = mount(AcessoUsuarioEditor, { props: { usuario: alvo() } })

    expect(wrapper.text()).toContain('PESQUISADOR A')
  })
})
