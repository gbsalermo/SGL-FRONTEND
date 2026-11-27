import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { equipeService } from '@/modules/equipe/equipeService'
import type { ItemImportacao } from '@/modules/equipe/types'
import { http } from '@/services/http'
import { fakeAdapter } from '@/test/fakeAdapter'

describe('equipeService', () => {
  const adapterOriginal = http.defaults.adapter

  afterEach(() => {
    http.defaults.adapter = adapterOriginal
  })

  describe('importar', () => {
    let fake: ReturnType<typeof fakeAdapter>

    beforeEach(() => {
      fake = fakeAdapter((config) => {
        const { itens } = JSON.parse(config.data as string) as { itens: ItemImportacao[] }
        return {
          status: 200,
          data: itens.map((item) => ({ referencia: item.referencia, nome: null, resultado: 'CADASTRADA', mensagem: null })),
        }
      })
      http.defaults.adapter = fake.adapter
    })

    it('divide em blocos de 50 e junta os resultados na ordem', async () => {
      const itens: ItemImportacao[] = Array.from({ length: 120 }, (_, i) => ({
        tipo: 'COLABORADOR', referencia: String(i + 1), categoriaCargo: 'ESTAGIARIO',
      }))

      const resultados = await equipeService.importar('lab-1', itens)

      expect(fake.requests.map((r) => JSON.parse(r.data as string).itens.length)).toEqual([50, 50, 20])
      expect(fake.requests[0].url).toBe('/v1/laboratorios/lab-1/equipe/importar')
      expect(resultados).toHaveLength(120)
      expect(resultados[119].referencia).toBe('120')
    })
  })

  it('aprovarPendente envia so a categoria', async () => {
    const fake = fakeAdapter(() => ({ status: 200, data: { id: 'u-9' } }))
    http.defaults.adapter = fake.adapter

    await equipeService.aprovarPendente('lab-1', 'u-9', 'ESTAGIARIO')

    expect(fake.requests[0].url).toBe('/v1/laboratorios/lab-1/equipe/pendentes/u-9/aprovar')
    expect(JSON.parse(fake.requests[0].data as string)).toEqual({ categoriaCargo: 'ESTAGIARIO' })
  })
})
