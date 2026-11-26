import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fakeAdapter } from '@/test/fakeAdapter'
import { acessoDe, type PerfilDeTeste } from '@/test/sessaoDeTeste'

function salvarSessao(perfil: PerfilDeTeste, unidadeOperacaoId: string | null = null, extra: object = {}) {
  localStorage.setItem('sgl.session', JSON.stringify({
    token: 'jwt-1',
    expiraEm: Date.now() + 60_000,
    unidadeOperacaoId,
    usuario: { id: 'u-1', ...acessoDe(perfil), situacao: 'ATIVO', unidadeId: 'unidade-1', ...extra },
  }))
}

async function carregar() {
  vi.resetModules()
  return import('@/services/http')
}

describe('http', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('envia Authorization em toda requisicao', async () => {
    salvarSessao('GESTOR')
    const { http } = await carregar()
    const fake = fakeAdapter(() => ({ status: 200, data: [] }))
    http.defaults.adapter = fake.adapter

    await http.get('/v1/pedidos')

    expect(fake.requests[0].headers.get('Authorization')).toBe('Bearer jwt-1')
  })

  it('so envia X-SGL-Unidade-Id para administrador geral com unidade selecionada', async () => {
    const { http } = await carregar()
    const fake = fakeAdapter(() => ({ status: 200, data: [] }))
    http.defaults.adapter = fake.adapter

    salvarSessao('GESTOR', 'unidade-2')
    await http.get('/v1/pedidos')
    salvarSessao('ADMINISTRADOR_GERAL')
    await http.get('/v1/pedidos')
    salvarSessao('ADMINISTRADOR_GERAL', 'unidade-2')
    await http.get('/v1/pedidos')

    expect(fake.requests[0].headers.has('X-SGL-Unidade-Id')).toBe(false)
    expect(fake.requests[1].headers.has('X-SGL-Unidade-Id')).toBe(false)
    expect(fake.requests[2].headers.get('X-SGL-Unidade-Id')).toBe('unidade-2')
  })

  it('administrador geral que acumula outros papeis continua escolhendo a unidade', async () => {
    const { http } = await carregar()
    const fake = fakeAdapter(() => ({ status: 200, data: [] }))
    http.defaults.adapter = fake.adapter

    salvarSessao('GESTOR', 'unidade-2', { papeis: ['GESTOR', 'ADMINISTRADOR_GERAL'] })
    await http.get('/v1/pedidos')

    expect(fake.requests[0].headers.get('X-SGL-Unidade-Id')).toBe('unidade-2')
  })

  it('401 limpa a sessao', async () => {
    salvarSessao('GESTOR')
    const { http, configurarRespostasDeSessao } = await carregar()
    const aoExpirar = vi.fn()
    configurarRespostasDeSessao({ aoExpirar, aoPendente: vi.fn() })
    http.defaults.adapter = fakeAdapter(() => ({ status: 401, data: { codigo: 'SESSAO_INVALIDA' } })).adapter

    await expect(http.get('/v1/pedidos')).rejects.toBeTruthy()

    expect(localStorage.getItem('sgl.session')).toBeNull()
    expect(aoExpirar).toHaveBeenCalledOnce()
  })

  it('401 do proprio login nao encerra sessao nem redireciona', async () => {
    const { http, configurarRespostasDeSessao } = await carregar()
    const aoExpirar = vi.fn()
    configurarRespostasDeSessao({ aoExpirar, aoPendente: vi.fn() })
    http.defaults.adapter = fakeAdapter(() => ({ status: 401, data: { codigo: 'CREDENCIAIS_INVALIDAS' } })).adapter

    await expect(http.post('/v1/auth/login', {})).rejects.toBeTruthy()

    expect(aoExpirar).not.toHaveBeenCalled()
  })

  it('401 de /v1/auth/me encerra a sessao (pendente recusado ou desativado)', async () => {
    salvarSessao('TECNICO')
    const { http, configurarRespostasDeSessao } = await carregar()
    const aoExpirar = vi.fn()
    configurarRespostasDeSessao({ aoExpirar, aoPendente: vi.fn() })
    http.defaults.adapter = fakeAdapter(() => ({ status: 401, data: { codigo: 'NAO_AUTENTICADO' } })).adapter

    await expect(http.get('/v1/auth/me')).rejects.toBeTruthy()

    expect(localStorage.getItem('sgl.session')).toBeNull()
    expect(aoExpirar).toHaveBeenCalledOnce()
  })

  it('403 USUARIO_PENDENTE aciona a tela de espera', async () => {
    salvarSessao('TECNICO')
    const { http, configurarRespostasDeSessao } = await carregar()
    const aoPendente = vi.fn()
    configurarRespostasDeSessao({ aoExpirar: vi.fn(), aoPendente })
    http.defaults.adapter = fakeAdapter(() => ({ status: 403, data: { codigo: 'USUARIO_PENDENTE' } })).adapter

    await expect(http.get('/v1/pedidos')).rejects.toBeTruthy()

    expect(aoPendente).toHaveBeenCalledOnce()
    expect(localStorage.getItem('sgl.session')).not.toBeNull()
  })
})
