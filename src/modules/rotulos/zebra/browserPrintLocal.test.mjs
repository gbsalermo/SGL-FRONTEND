// Testes do transporte local sem acessar impressoras reais.
// node --experimental-strip-types --test src/modules/rotulos/zebra/browserPrintLocal.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  enderecoBrowserPrint, listarImpressorasZebra, enviarZplParaZebra,
} from './browserPrintLocal.ts'

const impressora = {
  uid: 'TESTE-USB-001',
  name: 'Zebra de testes',
  deviceType: 'printer',
  connection: 'usb',
  provider: 'com.zebra.printer',
  manufacturer: 'Zebra Technologies',
}

test('usa apenas a conexão local compatível com o protocolo da página', () => {
  assert.equal(enderecoBrowserPrint('https:'), 'https://localhost:9101')
  assert.equal(enderecoBrowserPrint('http:'), 'http://localhost:9100')
})

test('busca impressoras na API local, ignorando dispositivos que não são impressoras', async () => {
  let chamada = ''
  const mock = async (url, opts) => {
    chamada = String(url)
    assert.equal(opts.method, 'GET')
    return new Response(JSON.stringify({
      printer: [impressora, { uid: 'NAO-PRINTER', name: 'Leitor', deviceType: 'scanner' }],
    }), { status: 200 })
  }
  const lista = await listarImpressorasZebra('https:', mock)
  assert.equal(chamada, 'https://localhost:9101/available')
  assert.deepEqual(lista, [impressora])
})

test('envia exatamente um ZPL para a impressora escolhida', async () => {
  const zpl = '^XA\n^FO25,50^FDExemplo^FS\n^XZ'
  let chamada = false
  const mock = async (url, opts) => {
    chamada = true
    assert.equal(url, 'http://localhost:9100/write')
    assert.equal(opts.method, 'POST')
    assert.deepEqual(JSON.parse(opts.body), { device: { ...impressora, version: 2 }, data: zpl })
    return new Response('', { status: 200 })
  }
  await enviarZplParaZebra('http:', impressora, zpl, mock)
  assert.ok(chamada)
})

test('nunca envia ZPL inválido ou dispositivo de outro tipo', async () => {
  const falso = async () => { throw new Error('A rede não pode ser chamada') }
  await assert.rejects(
    enviarZplParaZebra('https:', impressora, 'teste', falso), /arquivo ZPL não é válido/,
  )
  await assert.rejects(
    enviarZplParaZebra('https:', { ...impressora, deviceType: 'scanner' }, '^XA^XZ', falso),
    /impressora Zebra válida/,
  )
})

test('não transforma resposta de acesso negado em impressão concluída', async () => {
  const mock = async () => new Response('Acesso negado', { status: 403 })
  await assert.rejects(
    enviarZplParaZebra('https:', impressora, '^XA^XZ', mock),
    /Autorize o SGL/,
  )
})

test('informa indisponibilidade do aplicativo ou certificado sem impressão fictícia', async () => {
  const mock = async () => { throw new Error('Failed to fetch') }
  await assert.rejects(
    listarImpressorasZebra('https:', mock), /Não foi possível acessar o Zebra Browser Print/,
  )
})
