import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import UsuarioTesteCard from '@/modules/auth/components/UsuarioTesteCard.vue'
import type { UsuarioDeTeste } from '@/modules/auth/types/devLogin'

function usuario(sobrescrever: Partial<UsuarioDeTeste> = {}): UsuarioDeTeste {
  return {
    id: 'u-1',
    nome: 'Ana Beatriz Moreira',
    login: 'teste.gestor.1',
    perfil: 'GESTOR',
    unidadeId: 'unidade-1',
    unidadeSigla: 'CNPMA',
    laboratorios: [],
    ...sobrescrever,
  }
}

describe('UsuarioTesteCard', () => {
  it('mostraPrimeiroLaboratorioEMaisN', () => {
    const wrapper = mount(UsuarioTesteCard, {
      props: {
        usuario: usuario({
          laboratorios: [
            { id: 'l-1', nome: 'Lab. Microbiologia', ativo: true },
            { id: 'l-2', nome: 'Lab. Química', ativo: true },
            { id: 'l-3', nome: 'Lab. Solos', ativo: true },
          ],
        }),
      },
    })

    const texto = wrapper.text()
    expect(texto).toContain('Ana Beatriz Moreira')
    expect(texto).toContain('AM')
    expect(texto).toContain('teste.gestor.1')
    expect(texto).toContain('Gestor')
    expect(texto).toContain('CNPMA')
    expect(texto).toContain('Lab. Microbiologia')
    expect(texto).toContain('+2')
    expect(texto).not.toContain('Lab. Química')
  })

  it('semUnidadeNemLaboratorio_naoQuebra', () => {
    const wrapper = mount(UsuarioTesteCard, {
      props: { usuario: usuario({ nome: 'Ana', unidadeId: null, unidadeSigla: null, laboratorios: [] }) },
    })

    expect(wrapper.text()).toContain('Ana')
    expect(wrapper.find('[data-test="entrar"]').text()).toBe('Entrar como Ana')
    expect(wrapper.text()).not.toContain('null')
    expect(wrapper.text()).not.toContain('+')
  })

  it('emiteEntrarComLogin', async () => {
    const wrapper = mount(UsuarioTesteCard, { props: { usuario: usuario() } })

    await wrapper.find('[data-test="entrar"]').trigger('click')

    expect(wrapper.emitted('entrar')).toEqual([['teste.gestor.1']])
  })
})
