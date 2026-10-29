// Execute com: node --experimental-strip-types --test src/modules/rotulos/zebra/zpl.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { escaparCampoZpl, gerarDocumentoZpl, milimetrosParaPontos } from './zpl.ts'

const base = {
  titulo: 'DOCUMENTO DE ENTRADA',
  identificador: 'LOTE-EXEMPLO-001',
  secoes: [
    { titulo: 'Dados do lote', campos: [
      { rotulo: 'Produto', valor: 'Acido Cloridrico 37%' },
      { rotulo: 'Quantidade', valor: '8000 mL' },
    ] },
  ],
}

test('converte dimensoes mm para pontos em ambas as resolucoes', () => {
  assert.equal(milimetrosParaPontos(25.4, 203), 203)
  assert.equal(milimetrosParaPontos(25.4, 300), 300)
})

test('escapa dados do usuario inclusive comandos ZPL e caracteres UTF8', () => {
  const zpl = gerarDocumentoZpl({
    ...base,
    secoes: [{ titulo: 'Dados', campos: [{ rotulo: 'Observacao', valor: 'Ácido ^XA ~JA _Z' }] }],
  }, { larguraMm: 90, alturaMm: 125, dpi: 203 })
  assert.ok(zpl.startsWith('^XA\n^CI28\n'))
  assert.ok(zpl.endsWith('^PQ1\n^XZ'))
  assert.ok(zpl.includes('^PW719'))
  assert.ok(zpl.includes('_5E_58_41'))
  assert.ok(zpl.includes('_7E_4A_41'))
  assert.ok(zpl.includes('_C3_81'))
  assert.equal(zpl.match(/\^XA/g)?.length, 1)
  assert.equal(zpl.match(/\^XZ/g)?.length, 1)
  assert.equal(escaparCampoZpl('^XZ'), '_5E_58_5A')
})

test('nao gera arquivo com largura/dpi invalidos', () => {
  assert.throws(() => gerarDocumentoZpl(base, { larguraMm: 180, alturaMm: 125, dpi: 203 }), /largura/)
  assert.throws(() => gerarDocumentoZpl(base, { larguraMm: 90, alturaMm: 125, dpi: 600 }), /203 ou 300 dpi/)
})

test('nao corta silenciosamente rotulos com textos que excedem a altura', () => {
  const documento = {
    ...base,
    secoes: [{ titulo: 'Observacoes', campos: [
      { rotulo: 'Texto', valor: 'Observacao extensa. '.repeat(350) },
    ] }],
  }
  assert.throws(() => gerarDocumentoZpl(documento, { larguraMm: 90, alturaMm: 50, dpi: 203 }), /não cabe/)
})

test('dados comuns de recebimento cabem no piloto 90 x 125 mm', () => {
  const zpl = gerarDocumentoZpl(base, { larguraMm: 90, alturaMm: 125, dpi: 203 })
  assert.ok(zpl.includes('^LL999'))
  assert.ok(zpl.includes('^CI28'))
})
