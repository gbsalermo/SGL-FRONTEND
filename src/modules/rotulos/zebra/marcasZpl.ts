import type { ConfiguracaoZpl, DocumentoZpl, MarcaZpl, MarcasZpl, PictogramaZpl } from './zpl'
import { ladoPictogramaZpl, milimetrosParaPontos } from './zpl'
import { encontrarLimitesConteudo } from './recorteMarca'

/**
 * Usa as marcas oficiais já servidas no frontend. Recorta margens visuais vazias,
 * centraliza a arte dentro de caixas simétricas e rasteriza em ZPL monocromático.
 * Nenhum bitmap sai do navegador ou é enviado a um servidor externo.
 */
async function converterMarca(
  caminho: string,
  larguraDestino: number,
  alturaDestino: number,
  escalaAjuste: number,
  deslocamentoY: number,
): Promise<MarcaZpl> {
  const imagem = new Image()
  imagem.src = caminho
  try {
    await imagem.decode()
  } catch {
    throw new Error('Não foi possível carregar a marca institucional para a etiqueta Zebra: ' + caminho)
  }

  if (!imagem.naturalWidth || !imagem.naturalHeight) {
    throw new Error('A marca institucional não possui dimensões válidas: ' + caminho)
  }

  // Desenha a fonte sobre branco: transparência e espaços claros não influem
  // na identificação dos contornos. Não redimensionar antes de recortar.
  const original = document.createElement('canvas')
  original.width = imagem.naturalWidth
  original.height = imagem.naturalHeight
  const ctxOriginal = original.getContext('2d', { willReadFrequently: true })
  if (!ctxOriginal) throw new Error('O navegador não oferece suporte à rasterização de logotipos.')
  ctxOriginal.fillStyle = '#FFFFFF'
  ctxOriginal.fillRect(0, 0, original.width, original.height)
  ctxOriginal.drawImage(imagem, 0, 0)

  const pixelsOriginais = ctxOriginal.getImageData(0, 0, original.width, original.height)
  const limites = encontrarLimitesConteudo(pixelsOriginais.data, original.width, original.height)
  if (!limites) throw new Error('A marca institucional está vazia ou ilegível: ' + caminho)

  // Caixas de mesmo tamanho; deslocamento vertical independente sem alterar escala.
  const final = document.createElement('canvas')
  final.width = larguraDestino
  final.height = alturaDestino
  const ctxFinal = final.getContext('2d', { willReadFrequently: true })
  if (!ctxFinal) throw new Error('O navegador não oferece suporte à rasterização final de logotipos.')
  ctxFinal.fillStyle = '#FFFFFF'
  ctxFinal.fillRect(0, 0, final.width, final.height)

  const fator = Math.min(
    larguraDestino / limites.largura,
    alturaDestino / limites.altura,
  ) * escalaAjuste
  const larguraArte = limites.largura * fator
  const alturaArte = limites.altura * fator
  const xArte = (larguraDestino - larguraArte) / 2
  const centroY = (alturaDestino - alturaArte) / 2
  const yArte = Math.max(0, Math.min(alturaDestino - alturaArte, centroY + deslocamentoY))
  ctxFinal.drawImage(
    original,
    limites.x, limites.y, limites.largura, limites.altura,
    xArte, yArte, larguraArte, alturaArte,
  )

  const pixels = ctxFinal.getImageData(0, 0, larguraDestino, alturaDestino).data
  const bytesPorLinha = Math.ceil(larguraDestino / 8)
  const bytes = new Uint8Array(bytesPorLinha * alturaDestino)
  let pixelsPretos = 0

  for (let y = 0; y < alturaDestino; y++) {
    for (let x = 0; x < larguraDestino; x++) {
      const i = (y * larguraDestino + x) * 4
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
    largura: larguraDestino,
    altura: alturaDestino,
  }
}

export async function prepararMarcasZpl(config: ConfiguracaoZpl): Promise<MarcasZpl> {
  const larguraMidia = milimetrosParaPontos(config.larguraMm, config.dpi)
  const fator = config.dpi / 203
  const margem = Math.round(22 * fator)
  const larguraUtil = larguraMidia - 2 * margem
  const larguraLogo = Math.max(40, Math.floor((larguraUtil - Math.round(18 * fator)) / 2))
  const alturaLogo = Math.round(42 * fator)

  const [sgl, embrapa] = await Promise.all([
    // Correção óptica: SGL sobe e Embrapa desce; tamanhos originais preservados.
    converterMarca('/assets/residuos/marcas/sgl-logo.png.png', larguraLogo, alturaLogo, 0.88, Math.round(-4 * fator)),
    converterMarca('/assets/residuos/marcas/embrapa.png', larguraLogo, alturaLogo, 0.82, Math.round(4 * fator)),
  ])
  return { sgl, embrapa }
}

/**
 * Rasteriza todos os pictogramas existentes no catálogo do SGL.
 * Se uma imagem falhar, rejeita toda a exportação: não emitir etiqueta de risco
 * com símbolos ausentes ou substitutos inventados.
 */
export async function prepararPictogramasZpl(
  config: ConfiguracaoZpl,
  pictogramas: NonNullable<DocumentoZpl['pictogramas']>,
  categoria?: DocumentoZpl['categoria'],
): Promise<PictogramaZpl[]> {
  if (!pictogramas.length) return []
  const fator = config.dpi / 203
  const lado = ladoPictogramaZpl(config.larguraMm, config.dpi, categoria)
  if (lado < 32 * fator) throw new Error('Etiqueta estreita demais para pictogramas legíveis.')
  return Promise.all(pictogramas.map(async pictograma => {
    if (!pictograma.caminho.startsWith('/assets/residuos/pictogramas/')) {
      throw new Error('Caminho de pictograma não reconhecido no catálogo do SGL.')
    }
    return {
      caminho: pictograma.caminho,
      rotulo: pictograma.rotulo,
      imagem: await converterMarca(pictograma.caminho, lado, lado, 0.94, 0),
    }
  }))
}
