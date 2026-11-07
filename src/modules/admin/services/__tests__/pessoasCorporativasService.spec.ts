import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { buscarPessoas, importarPessoa } from '@/modules/admin/services/pessoasCorporativasService'
import { http } from '@/services/http'
import { fakeAdapter } from '@/test/fakeAdapter'

describe('pessoasCorporativasService', () => {
  const adapterOriginal = http.defaults.adapter
  beforeEach(() => localStorage.clear())
  afterEach(() => { http.defaults.adapter = adapterOriginal })

  it('buscarPessoas monta query tipo e termo', async () => {
    const fake = fakeAdapter(() => ({ status: 200, data: [] }))
    http.defaults.adapter = fake.adapter

    await buscarPessoas('COLABORADOR', ' joão ')

    expect(fake.requests[0].url).toBe('/v1/pessoas-corporativas')
    expect(fake.requests[0].params).toEqual({ tipo: 'COLABORADOR', termo: 'joão' })
  })

  it('importarPessoa com 409 lanca erro com mensagem "Pessoa já cadastrada no SGL."', async () => {
    http.defaults.adapter = fakeAdapter(() => ({ status: 409, data: { codigo: 'JA_CADASTRADO' } })).adapter

    await expect(importarPessoa({
      tipo: 'EMPREGADO', referencia: '344136', perfil: 'TECNICO', laboratorioIds: ['lab-1'],
    })).rejects.toThrow('Pessoa já cadastrada no SGL.')
  })

  it('importarPessoa envia so a referencia, nunca CPF', async () => {
    const fake = fakeAdapter(() => ({ status: 201, data: { id: 'u-1' } }))
    http.defaults.adapter = fake.adapter

    await importarPessoa({ tipo: 'EMPREGADO', referencia: '344136', perfil: 'TECNICO', laboratorioIds: ['lab-1'] })

    expect(fake.requests[0].url).toBe('/v1/pessoas-corporativas/importar')
    expect(JSON.parse(fake.requests[0].data)).toEqual({
      tipo: 'EMPREGADO', referencia: '344136', perfil: 'TECNICO', laboratorioIds: ['lab-1'],
    })
  })
})
