// Execute com: node --experimental-strip-types --test src/modules/rotulos/zebra/zpl.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { escaparCampoZpl, gerarDocumentoZpl, milimetrosParaPontos } from './zpl.ts'
import { encontrarLimitesConteudo } from './recorteMarca.ts'

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

test('usa composição institucional com faixa inversa, grade, tabela e moldura', () => {
  const zpl = gerarDocumentoZpl({
    ...base,
    titulo: 'RÓTULO DE SOLUÇÃO',
    situacao: 'EM PREPARAÇÃO',
    subtitulo: 'Tampão analítico demonstrativo',
    secoes: [
      { titulo: 'Origem', campos: [{ rotulo: 'Laboratório', valor: 'Biologia Molecular' }] },
      { titulo: 'Componentes informados', campos: [
        { rotulo: 'Tampão PBS 10X', valor: '4 mL' },
        { rotulo: 'Cloreto de Potássio', valor: '2 g' },
      ] },
    ],
    avisoFinal: 'Rótulo de uso interno',
  }, { larguraMm: 90, alturaMm: 125, dpi: 203 })
  assert.ok(zpl.includes('^GB'))
  assert.ok(zpl.includes('^FR'))
  assert.ok(zpl.includes(escaparCampoZpl('COMPONENTE')))
  assert.ok(zpl.includes(escaparCampoZpl('QUANTIDADE')))
  assert.ok(zpl.includes(escaparCampoZpl('Tampão PBS 10X')))
  assert.ok(zpl.endsWith('^PQ1\n^XZ'))
})

test('posiciona as duas marcas em GFA sem duplicar a identificação textual do cabeçalho', () => {
  const logo = { comando: '^GFA,1,1,1,FF', largura: 80, altura: 24 }
  const zpl = gerarDocumentoZpl(base, { larguraMm: 90, alturaMm: 125, dpi: 203 },
    { sgl: logo, embrapa: logo })
  assert.equal(zpl.match(/\^GFA/g)?.length, 2)
  assert.ok(zpl.includes('^FO22,22^GFA,1,1,1,FF^FS'))
})

test('rejeita marcas grandes demais para a mídia escolhida', () => {
  const logo = { comando: '^GFA,1,1,1,FF', largura: 500, altura: 24 }
  assert.throws(() => gerarDocumentoZpl(base, { larguraMm: 90, alturaMm: 125, dpi: 203 },
    { sgl: logo, embrapa: logo }), /marcas excedem/)
})

test('cabe o exemplo realista de solução em 90 x 125 mm, sem omitir observações', () => {
  const zpl = gerarDocumentoZpl({
    titulo: 'RÓTULO DE SOLUÇÃO',
    situacao: 'EM PREPARAÇÃO',
    subtitulo: 'Tampão analítico demonstrativo',
    identificador: '34a61146-ccba-4f33-8995-18f634bfc1e9',
    secoes: [
      { titulo: 'Origem', campos: [
        { rotulo: 'Unidade', valor: 'CNPMF — Embrapa Mandioca e Fruticultura' },
        { rotulo: 'Laboratório', valor: 'Laboratório de Biologia Molecular' },
        { rotulo: 'Projeto', valor: 'Genotipagem de variedades de mandioca' },
      ] },
      { titulo: 'Aprovação', campos: [
        { rotulo: 'Solicitante', valor: 'Camila Menezes' },
        { rotulo: 'Preparação aprovada por', valor: 'Não identificado nas movimentações' },
        { rotulo: 'Registro de aprovação', valor: 'Não registrada' },
        { rotulo: 'Situação', valor: 'EM_PREPARACAO' },
      ] },
      { titulo: 'Componentes informados', campos: [
        { rotulo: 'Tampão PBS 10X', valor: '4 mL' },
        { rotulo: 'Cloreto de Potássio P.A.', valor: '2 g' },
      ] },
      { titulo: 'Instruções e observações', campos: [
        { rotulo: 'Instruções', valor: 'Seguir procedimento interno autorizado pela Gestão.' },
        { rotulo: 'Observações', valor: 'Pedido aprovado e em preparação; nenhuma retirada final foi simulada.' },
      ] },
    ],
    avisoFinal: 'IDENTIFICA O PEDIDO; NAO COMPROVA O PREPARO FISICO, VOLUME FINAL, CONCENTRACAO OU VALIDADE.',
  }, { larguraMm: 90, alturaMm: 125, dpi: 203 })
  assert.ok(zpl.includes(escaparCampoZpl('OBSERVAÇÕES')))
  assert.ok(zpl.includes(escaparCampoZpl('4 mL')))
  assert.ok(zpl.includes('^PQ1'))
})

test('recorta margens brancas e transparentes sem deslocar o desenho real', () => {
  const largura = 8, altura = 6
  const rgba = new Uint8ClampedArray(largura * altura * 4)
  for (let i = 0; i < largura * altura; i++) rgba.set([255, 255, 255, 255], i * 4)
  for (let y = 2; y <= 4; y++) {
    for (let x = 3; x <= 5; x++) rgba.set([12, 30, 70, 255], (y * largura + x) * 4)
  }
  rgba.set([0, 0, 0, 0], 0) // margem transparente não deve contar
  assert.deepEqual(encontrarLimitesConteudo(rgba, largura, altura), {
    x: 3, y: 2, largura: 3, altura: 3,
  })
})

test('não tenta rasterizar marca sem conteúdo visível', () => {
  const branca = new Uint8ClampedArray(4 * 4 * 4).fill(255)
  assert.equal(encontrarLimitesConteudo(branca, 4, 4), null)
  assert.equal(encontrarLimitesConteudo(branca, 0, 4), null)
})

test('impede etiqueta de Produto/Resíduo com pictogramas ausentes ou diferentes', () => {
  const documento = {
    ...base,
    pictogramas: [
      { caminho: '/assets/residuos/pictogramas/corrosivo.png', rotulo: 'Corrosivo' },
      { caminho: '/assets/residuos/pictogramas/toxico.png', rotulo: 'Tóxico' },
    ],
  }
  const config = { larguraMm: 90, alturaMm: 200, dpi: 203 }
  assert.throws(() => gerarDocumentoZpl(documento, config), /Nem todos os pictogramas/)
  const imagem = { comando: '^GFA,1,1,1,FF', largura: 80, altura: 80 }
  const incompleto = [{ ...documento.pictogramas[0], imagem }]
  assert.throws(() => gerarDocumentoZpl(documento, config, undefined, incompleto), /Nem todos os pictogramas/)
  const incorreto = documento.pictogramas.map((p, i) => ({
    ...p,
    rotulo: i === 0 ? 'Inflamável' : p.rotulo,
    imagem,
  }))
  assert.throws(() => gerarDocumentoZpl(documento, config, undefined, incorreto), /Nem todos os pictogramas/)
})

test('mantém todos os símbolos e seus nomes na versão Zebra', () => {
  const pictograma = { caminho: '/assets/residuos/pictogramas/corrosivo.png', rotulo: 'Corrosivo' }
  const imagem = { comando: '^GFA,1,1,1,FF', largura: 80, altura: 80 }
  const zpl = gerarDocumentoZpl({
    ...base, pictogramas: [pictograma],
  }, { larguraMm: 90, alturaMm: 200, dpi: 203 }, undefined, [{ ...pictograma, imagem }])
  assert.ok(zpl.includes(escaparCampoZpl('PICTOGRAMAS DE RISCO')))
  assert.ok(zpl.includes('^GFA,1,1,1,FF'))
  assert.ok(zpl.includes(escaparCampoZpl('Corrosivo')))
  assert.ok(zpl.endsWith('^PQ1\n^XZ'))
})
