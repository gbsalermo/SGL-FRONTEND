import type { ConfiguracaoZpl, DocumentoZpl, MarcaZpl, MarcasZpl, PictogramaZpl } from './zpl'

/**
 * Layout opcional para leitura horizontal de uma etiqueta física inalterada:
 * coordenadas e gráficos são girados 90°; ^PW e ^LL permanecem referentes
 * à largura e ao comprimento reais da mídia.
 *
 * Não usa comandos persistentes de configuração da impressora (^FW ou SGD).
 */
const mm = (v: number, dpi: number) => Math.round(v * dpi / 25.4)
const escapeZpl = (v: string) =>
  Array.from(new TextEncoder().encode(v), b => '_' + b.toString(16).toUpperCase().padStart(2, '0')).join('')

function quebrar(s: string, largura: number, fonte: number): string[] {
  const max = Math.max(3, Math.floor(largura / (fonte * .68)))
  const resultado: string[] = []
  let linha = ''
  for (const token of (s.replace(/\s+/g, ' ').trim() || 'Não informado').split(' ')) {
    let restante = token
    while (restante.length > max) {
      if (linha) { resultado.push(linha); linha = '' }
      resultado.push(restante.slice(0, max))
      restante = restante.slice(max)
    }
    if (!restante) continue
    if (!linha) linha = restante
    else if (linha.length + restante.length + 1 <= max) linha += ' ' + restante
    else { resultado.push(linha); linha = restante }
  }
  if (linha) resultado.push(linha)
  return resultado
}

function validarBitmap(marca: MarcaZpl): { dados: Uint8Array; porLinha: number } {
  const match = /^\^GFA,(\d+),(\d+),(\d+),([\dA-F]+)$/i.exec(marca.comando)
  if (!match) throw new Error('Não foi possível girar um gráfico ZPL. Verifique a imagem oficial.')
  const total = Number(match[1]), bytes = Number(match[3]), hex = match[4]
  if (total !== Number(match[2]) || bytes < 1 || total < 1 ||
      hex.length !== total * 2 || marca.largura > bytes * 8 ||
      marca.altura * bytes !== total) {
    throw new Error('Gráfico ZPL inválido para orientação horizontal.')
  }
  return {
    dados: Uint8Array.from({ length: total }, (_, i) => parseInt(hex.slice(i * 2, i * 2 + 2), 16)),
    porLinha: bytes,
  }
}

/** Roda o bitmap ^GFA em 90° no sentido horário, sem espelhar o conteúdo. */
export function rotacionarGraficoZpl(marca: MarcaZpl): MarcaZpl {
  const { dados, porLinha } = validarBitmap(marca)
  const novaLargura = marca.altura
  const novaAltura = marca.largura
  const linhaNova = Math.ceil(novaLargura / 8)
  const saida = new Uint8Array(linhaNova * novaAltura)
  for (let y = 0; y < marca.altura; y++) {
    for (let x = 0; x < marca.largura; x++) {
      if ((dados[y * porLinha + (x >> 3)] & (0x80 >> (x & 7))) === 0) continue
      const novoX = marca.altura - 1 - y
      const novoY = x
      saida[novoY * linhaNova + (novoX >> 3)] |= 0x80 >> (novoX & 7)
    }
  }
  const hexadecimal = Array.from(saida, b => b.toString(16).toUpperCase().padStart(2, '0')).join('')
  return {
    largura: novaLargura, altura: novaAltura,
    comando: '^GFA,' + saida.length + ',' + saida.length + ',' + linhaNova + ',' + hexadecimal,
  }
}

type DadosValidos = { rotulo: string; valor: string }
const validos = (campos: DocumentoZpl['secoes'][number]['campos']): DadosValidos[] =>
  campos.filter(c => c.valor !== null && c.valor !== undefined && String(c.valor).trim())
    .map(c => ({ rotulo: c.rotulo, valor: String(c.valor) }))

export function gerarDocumentoZplHorizontal(
  documento: DocumentoZpl, config: ConfiguracaoZpl, marcas?: MarcasZpl,
  pictogramas: PictogramaZpl[] = [],
): string {
  const fator = config.dpi / 203
  const px = (n: number) => Math.max(1, Math.round(n * fator))
  const larguraFisica = mm(config.larguraMm, config.dpi)
  const alturaFisica = mm(config.alturaMm, config.dpi)
  const w = alturaFisica // largura de leitura após girar o conteúdo
  const h = larguraFisica
  const m = px(16), gap = px(10)
  const util = w - m * 2
  const fonte = px(16), rotulo = px(12), pequeno = px(11), destaque = px(24)
  const comandos = ['^XA', '^CI28', '^LH0,0', '^PON', '^PW' + larguraFisica, '^LL' + alturaFisica]
  if (util < px(260) || h < px(360)) {
    throw new Error('Mídia pequena demais para o rótulo horizontal com leitura e riscos legíveis.')
  }
  const finalCorpo = h - m - px(36)

  // A orientação é aplicada por campo; não é uma preferência persistente da Zebra.
  const conferir = (x: number, y: number, largura: number, altura: number) => {
    if (x < 0 || y < 0 || x + largura > w - px(4) || y + altura > h - px(4)) {
      throw new Error('O conteúdo horizontal não cabe nesta etiqueta. Aumente a altura física ou use o modo vertical.')
    }
  }
  const escrever = (x: number, y: number, texto: string, tamanho: number, largura: number, reverso = false): number => {
    let yy = y
    for (const linha of quebrar(texto, largura, tamanho)) {
      conferir(x, yy, Math.max(tamanho, px(2)), tamanho)
      const xp = h - yy - tamanho
      comandos.push('^FO' + xp + ',' + x + '^A0R,' + tamanho + ',' + tamanho
        + (reverso ? '^FR' : '') + '^FH_^FD' + escapeZpl(linha) + '^FS')
      yy += tamanho + px(2)
    }
    return yy
  }
  const retangulo = (x: number, y: number, largura: number, altura: number, borda = 1) => {
    conferir(x, y, largura, altura)
    comandos.push('^FO' + (h - y - altura) + ',' + x + '^GB' + altura + ',' + largura + ',' + borda + '^FS')
  }
  const imagem = (x: number, y: number, marca: MarcaZpl) => {
    conferir(x, y, marca.largura, marca.altura)
    comandos.push('^FO' + (h - y - marca.altura) + ',' + x
      + rotacionarGraficoZpl(marca).comando + '^FS')
  }

  // Marcas aprovadas, agora no eixo horizontal de leitura.
  const logoY = m
  const alturaLogo = px(42)
  if (marcas) {
    if (marcas.sgl.largura + marcas.embrapa.largura + gap > util ||
        marcas.sgl.altura > alturaLogo || marcas.embrapa.altura > alturaLogo) {
      throw new Error('Não há largura horizontal suficiente para as duas marcas.')
    }
    imagem(m, logoY, marcas.sgl)
    imagem(w - m - marcas.embrapa.largura, logoY, marcas.embrapa)
  } else {
    escrever(m, logoY, 'SGL', px(26), util / 2)
    escrever(m + util / 2, logoY, 'EMBRAPA', px(21), util / 2)
  }
  escrever(m, m + alturaLogo + px(3), 'SGL — SISTEMA DE GESTÃO DE LABORATÓRIOS', pequeno, util)
  let y = m + alturaLogo + px(24)
  retangulo(m, y, util, px(30), px(30))
  escrever(m + px(7), y + px(6), documento.titulo.toUpperCase(), px(18), util - px(14), true)
  y += px(40)

  const riscado = pictogramas.length > 0
  const riscoLargura = riscado ? Math.min(px(250), Math.round(util * .30)) : 0
  const larguraNome = util - riscoLargura - (riscado ? gap : 0)
  const tituloY = y
  y = escrever(m, y, documento.subtitulo || documento.identificador, destaque, larguraNome) + px(5)
  if (documento.situacao) y = escrever(m, y, documento.situacao.toUpperCase(), fonte, larguraNome) + px(3)
  y = escrever(m, y, 'CÓDIGO SGL', pequeno, larguraNome)
  y = escrever(m, y + px(2), documento.identificador, fonte, larguraNome) + px(7)
  if (riscado) {
    const xRisco = w - m - riscoLargura
    let riscoY = escrever(xRisco, tituloY, 'RISCO', fonte, riscoLargura) + px(4)
    const cols = Math.min(3, pictogramas.length)
    const colW = Math.floor((riscoLargura - gap * (cols - 1)) / cols)
    for (let i = 0; i < pictogramas.length; i += cols) {
      let maxY = riscoY
      for (let j = 0; j < cols && i + j < pictogramas.length; j++) {
        const pic = pictogramas[i + j]
        if (pic.imagem.largura > colW) throw new Error('Pictograma muito grande para a área de risco horizontal.')
        const x = xRisco + j * (colW + gap)
        imagem(x + Math.floor((colW - pic.imagem.largura) / 2), riscoY, pic.imagem)
        const fim = escrever(x, riscoY + pic.imagem.altura + px(2), pic.rotulo, pequeno, colW)
        maxY = Math.max(maxY, fim)
      }
      riscoY = maxY + px(4)
    }
    y = Math.max(y, riscoY)
  }
  y += px(6)
  retangulo(m, y, util, px(1))
  y += px(12)
  const bodyY = y
  const disponivelY = finalCorpo - bodyY
  if (disponivelY < px(100)) {
    throw new Error('O cabeçalho horizontal excede o espaço útil da etiqueta.')
  }

  // Blocos independentes: colunas distribuídas na largura útil, sem cortar
  // observações ou perder campos de risco e fiscalização.
  const cols = Math.min(7, Math.max(1, Math.floor((util + gap) / (px(280) + gap))))
  const colW = Math.floor((util - (cols - 1) * gap) / cols)
  const alturas = Array.from({ length: cols }, () => bodyY)
  const blocos = documento.secoes.map(secao => {
    const campos = validos(secao.campos)
    if (!campos.length) return null
    let medida = px(32)
    for (const campo of campos) {
      const validoW = colW - px(16)
      medida += px(2)
        + quebrar(campo.rotulo.toUpperCase(), validoW, rotulo).length * (rotulo + px(2))
        + quebrar(campo.valor, validoW, fonte).length * (fonte + px(2)) + px(4)
    }
    return { secao, campos, medida: medida + px(8) }
  }).filter((s): s is NonNullable<typeof s> => s !== null)

  for (const bloco of blocos) {
    const indice = alturas.indexOf(Math.min(...alturas))
    const x = m + indice * (colW + gap)
    const yy = alturas[indice]
    if (yy + bloco.medida > finalCorpo) {
      throw new Error('O conteúdo horizontal não cabe nesta etiqueta. Aumente a altura física ou use o modo vertical.')
    }
    retangulo(x, yy, colW, bloco.medida, px(1))
    let campoY = yy + px(7)
    retangulo(x + px(4), campoY + px(2), px(4), px(17), px(4))
    campoY = escrever(x + px(13), campoY, bloco.secao.titulo.toUpperCase(), px(16), colW - px(21)) + px(5)
    for (const campo of bloco.campos) {
      campoY = escrever(x + px(8), campoY, campo.rotulo.toUpperCase(), rotulo, colW - px(16))
      campoY = escrever(x + px(8), campoY + px(1), campo.valor, fonte, colW - px(16)) + px(4)
    }
    alturas[indice] = yy + bloco.medida + gap
  }
  const fimDados = Math.max(bodyY, ...alturas)
  if (fimDados > finalCorpo + gap) throw new Error('O conteúdo horizontal ultrapassa a área útil.')

  // Aviso e identificação no rodapé, sem cortar informações.
  const footerY = h - m - px(30)
  retangulo(m, footerY, util, px(1))
  const aviso = documento.avisoFinal || 'IDENTIFICAÇÃO INTERNA SGL'
  const maxAvisoW = util - px(160)
  if (maxAvisoW < px(100) || quebrar(aviso, maxAvisoW, pequeno).length > 2) {
    throw new Error('O aviso de segurança não cabe no rodapé horizontal.')
  }
  escrever(m, footerY + px(7), aviso, pequeno, maxAvisoW)
  escrever(w - m - px(150), footerY + px(7), 'SGL | EMBRAPA', pequeno, px(150))
  retangulo(px(5), px(5), w - px(10), h - px(10))
  comandos.push('^PQ1', '^XZ')
  return comandos.join('\n')
}
