import type { ConfiguracaoZpl, MarcaZpl, MarcasZpl } from './zpl'
import { milimetrosParaPontos } from './zpl'

/**
 * Rasteriza as marcas oficiais que já existem no frontend em bitmap monocromático.
 * A imagem não sai do navegador. ZPL ^GFA com hexadecimal ASCII, sem upload.
 */
async function converterMarca(caminho: string, largura: number, altura: number): Promise<MarcaZpl> {
  const imagem = new Image()
  imagem.src = caminho
  try {
    await imagem.decode()
  } catch {
    throw new Error('Não foi possível carregar a marca institucional para a etiqueta Zebra: ' + caminho)
  }
  const canvas = document.createElement('canvas')
  canvas.width = largura
  canvas.height = altura
  const contexto = canvas.getContext('2d', { willReadFrequently: true })
  if (!contexto) throw new Error('O navegador não oferece suporte à rasterização de logotipos.')
  contexto.fillStyle = '#FFFFFF'
  contexto.fillRect(0, 0, largura, altura)
  const fator = Math.min(largura / imagem.naturalWidth, altura / imagem.naturalHeight)
  const w = imagem.naturalWidth * fator
  const h = imagem.naturalHeight * fator
  contexto.drawImage(imagem, (largura - w) / 2, (altura - h) / 2, w, h)

  const pixels = contexto.getImageData(0, 0, largura, altura).data
  const bytesPorLinha = Math.ceil(largura / 8)
  const bytes = new Uint8Array(bytesPorLinha * altura)
  let pixelsPretos = 0
  for (let y = 0; y < altura; y++) {
    for (let x = 0; x < largura; x++) {
      const i = (y * largura + x) * 4
      const luminancia = pixels[i] * 0.2126 + pixels[i + 1] * 0.7152 + pixels[i + 2] * 0.0722
      if (luminancia < 200) {
        bytes[y * bytesPorLinha + (x >> 3)] |= 0x80 >> (x & 7)
        pixelsPretos++
      }
    }
  }
  if (pixelsPretos < 10) throw new Error('A marca institucional ficou ilegível em monocromia.')
  const hex = Array.from(bytes, valor => valor.toString(16).toUpperCase().padStart(2, '0')).join('')
  return {
    comando: '^GFA,' + bytes.length + ',' + bytes.length + ',' + bytesPorLinha + ',' + hex,
    largura,
    altura,
  }
}

export async function prepararMarcasZpl(config: ConfiguracaoZpl): Promise<MarcasZpl> {
  const width = milimetrosParaPontos(config.larguraMm, config.dpi)
  const k = config.dpi / 203
  const margem = Math.round(22 * k)
  const total = width - margem * 2
  const larguraLogo = Math.max(40, Math.floor((total - Math.round(18 * k)) / 2))
  const alturaLogo = Math.round(42 * k)
  const [sgl, embrapa] = await Promise.all([
    converterMarca('/assets/residuos/marcas/sgl-logo.png.png', larguraLogo, alturaLogo),
    converterMarca('/assets/residuos/marcas/embrapa.png', larguraLogo, alturaLogo),
  ])
  return { sgl, embrapa }
}
