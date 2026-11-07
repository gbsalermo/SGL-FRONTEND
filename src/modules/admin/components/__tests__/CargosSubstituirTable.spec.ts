import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import CargosSubstituirTable from '@/modules/admin/components/CargosSubstituirTable.vue'
import type { CargoSubstituicao } from '@/modules/admin/types/cadastros'
import { PERFIS_ADMIN, PERFIS_GESTAO } from '@/modules/auth/perfis'
import type { PerfilUsuario, UsuarioSessao } from '@/modules/auth/types/session'
import { http } from '@/services/http'
import { useSessionStore } from '@/stores/session'
import { fakeAdapter } from '@/test/fakeAdapter'

const cargos: CargoSubstituicao[] = [
  { tipo: 'RESPONSAVEL_LABORATORIO', registroId: 'lab-1', descricao: 'Responsável pelo laboratório Química', ocupanteId: 'u-9', ocupanteNome: 'Beltrano' },
  { tipo: 'ORIENTADOR_ESTAGIO', registroId: 'vin-1', descricao: 'Orientador de Ana', ocupanteId: 'u-8', ocupanteNome: 'Fulano' },
]

const vazio = { template: '<div />' }

// Mesmas regras de perfil das rotas reais que a tabela abre.
function criarRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: vazio },
      { path: '/administracao/cadastros', component: vazio, meta: { perfis: PERFIS_ADMIN } },
      { path: '/estagiarios', component: vazio, meta: { perfis: PERFIS_GESTAO } },
      { path: '/residuos', component: vazio, meta: { perfis: PERFIS_GESTAO } },
    ],
  })
}

function entrarComo(perfil: PerfilUsuario) {
  const usuario: UsuarioSessao = {
    id: 'u-1', nome: 'Gestor', email: 'g@embrapa.br', perfil, situacao: 'ATIVO',
    unidadeId: 'unidade-1', unidadeNome: 'Mandioca e Fruticultura', unidadeSigla: 'CNPMF',
    laboratorios: [], ativo: true,
  }
  useSessionStore().$patch({ token: 'jwt', usuario, expiraEm: Date.now() + 60_000 })
}

async function montar() {
  const router = criarRouter()
  await router.push('/')
  const wrapper = mount(CargosSubstituirTable, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('CargosSubstituirTable', () => {
  const adapterOriginal = http.defaults.adapter
  let fake: ReturnType<typeof fakeAdapter>

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    fake = fakeAdapter(() => ({ status: 200, data: cargos }))
    http.defaults.adapter = fake.adapter
  })
  afterEach(() => { http.defaults.adapter = adapterOriginal })

  it('lista os cargos com rotulo do tipo e ocupante', async () => {
    entrarComo('ADMINISTRADOR')
    const wrapper = await montar()

    expect(fake.requests[0].url).toBe('/v1/cargos-a-substituir')
    const linhas = wrapper.findAll('tbody tr')
    expect(linhas).toHaveLength(2)
    expect(linhas[0].text()).toContain('Responsável de laboratório')
    expect(linhas[0].text()).toContain('Beltrano')
    expect(linhas[1].text()).toContain('Orientador de estágio')
  })

  it('leva o administrador ao laboratorio filtrado pelo nome', async () => {
    entrarComo('ADMINISTRADOR')
    const wrapper = await montar()

    const link = wrapper.findAll('tbody tr')[0].find('a')
    expect(link.attributes('href')).toBe('/administracao/cadastros?secao=laboratorios&busca=Qu%C3%ADmica')
  })

  it('gestor nao recebe link para cadastros restritos ao administrador', async () => {
    entrarComo('GESTOR')
    const wrapper = await montar()

    const [laboratorio, orientador] = wrapper.findAll('tbody tr')
    expect(laboratorio.find('a').exists()).toBe(false)
    expect(laboratorio.text()).toContain('Peça a um administrador')
    expect(orientador.find('a').attributes('href')).toBe('/estagiarios')
  })

  it('mostra estado vazio', async () => {
    fake = fakeAdapter(() => ({ status: 200, data: [] }))
    http.defaults.adapter = fake.adapter
    entrarComo('GESTOR')
    const wrapper = await montar()

    expect(wrapper.text()).toContain('Nenhum cargo precisa de substituição.')
  })

  it('mostra a mensagem da API quando falha', async () => {
    fake = fakeAdapter(() => ({ status: 403, data: { message: 'Apenas gestão pode ver os cargos a substituir.' } }))
    http.defaults.adapter = fake.adapter
    entrarComo('GESTOR')
    const wrapper = await montar()

    expect(wrapper.find('[role="alert"]').text()).toBe('Apenas gestão pode ver os cargos a substituir.')
  })
})
