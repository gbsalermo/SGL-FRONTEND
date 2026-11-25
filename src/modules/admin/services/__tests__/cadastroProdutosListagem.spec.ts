import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { cadastrosAdminService } from '@/modules/admin/services/cadastrosAdminService'
import { http } from '@/services/http'
import { fakeAdapter } from '@/test/fakeAdapter'

const produtoSemEstoque = {
  id: 'produto-cadastrado',
  nome: 'BDA Batata Dextrose Agar',
  codigoReferencia: 'BDA-500',
  ativo: true,
}

describe('listagem administrativa de produtos', () => {
  const original = http.defaults.adapter
  let fake: ReturnType<typeof fakeAdapter>

  beforeEach(() => {
    fake = fakeAdapter((config) => {
      if (config.url === '/v1/produtos/catalogo') {
        return { status: 200, data: [produtoSemEstoque] }
      }
      return { status: 200, data: [] }
    })
    http.defaults.adapter = fake.adapter
  })

  afterEach(() => { http.defaults.adapter = original })

  it('usa o catalogo administrativo para enxergar produto sem estoque', async () => {
    const lista = await cadastrosAdminService.listarProdutos()
    expect(lista).toHaveLength(1)
    expect(lista[0]?.codigoReferencia).toBe('BDA-500')
    expect(fake.requests.map((r) => r.url)).toEqual(['/v1/produtos/catalogo'])
  })

  it('mantem compatibilidade com o endpoint antigo enquanto o backend nao for atualizado', async () => {
    http.defaults.adapter = fakeAdapter((config) => (
      config.url === '/v1/produtos/catalogo'
        ? { status: 404, data: { message: 'rota indisponivel' } }
        : { status: 200, data: [produtoSemEstoque] }
    )).adapter

    const lista = await cadastrosAdminService.listarProdutos()
    expect(lista).toHaveLength(1)
  })

  it('nao mascara outros erros do servidor tentando o endpoint antigo', async () => {
    const adapter = fakeAdapter((config) => (
      config.url === '/v1/produtos/catalogo'
        ? { status: 500, data: { message: 'falha interna' } }
        : { status: 200, data: [] }
    ))
    http.defaults.adapter = adapter.adapter

    await expect(cadastrosAdminService.listarProdutos()).rejects.toThrow()
    expect(adapter.requests.map((r) => r.url)).toEqual(['/v1/produtos/catalogo'])
  })
})
