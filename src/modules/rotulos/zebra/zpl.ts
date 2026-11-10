/**
 * Layout térmico institucional do SGL: comandos ZPL II, sem dependência do modelo.
 * As medidas físicas dependem da mídia e da largura real do cabeçote Zebra.
 * Nenhum gráfico de segurança GHS é gerado por esta versão informativa.
 */
export type ResolucaoZebra = 203 | 300
export type OrientacaoConteudoZpl = 'VERTICAL' | 'HORIZONTAL'

export interface CampoZpl {
  rotulo: string
  valor: string | number | null | undefined
}
export interface SecaoZpl {
  titulo: string
  campos: CampoZpl[]
}
export interface DocumentoZpl {
  titulo: string
  identificador: string
  subtitulo?: string
  situacao?: string
  categoria?: 'SOLUCAO' | 'ENTRADA_LOTE' | 'PRODUTO' | 'RESIDUO'
  /** Pictogramas do cadastro real. Obrigatórios na exportação quando presentes. */
  pictogramas?: Array<{ caminho: string; rotulo: string }>
  secoes: SecaoZpl[]
  avisoFinal?: string
}
export interface ConfiguracaoZpl {
  larguraMm: number
  alturaMm: number
  dpi: ResolucaoZebra
  /** Gira apenas a composição e seus gráficos, nunca a dimensão da mídia. */
  orientacao?: OrientacaoConteudoZpl
}
export interface MarcaZpl {
  comando: string
  largura: number
  altura: number
}
export interface MarcasZpl {
  sgl: MarcaZpl
  embrapa: MarcaZpl
}
export interface PictogramaZpl {
  caminho: string
  rotulo: string
  imagem: MarcaZpl
}

const POL_MILIMETROS = 25.4

/** Tamanhos iniciais sugeridos para mídia térmica; não são padrões físicos universais. */
export const LARGURA_PADRAO_ZPL_MM = 110
export const LARGURA_MAXIMA_ZPL_MM = 168

export const ALTURAS_PADRAO_ZEBRA_MM = [125, 140, 150, 160, 175, 180, 200, 225, 250, 275, 300] as const
/** Na horizontal, comprimentos menores também podem acomodar o mesmo conteúdo. */
export const ALTURAS_HORIZONTAIS_ZEBRA_MM = [90, 100, 110, 120, ...ALTURAS_PADRAO_ZEBRA_MM] as const

export function alturaInicialZpl(documento: DocumentoZpl): number {
  return 125
}

/** Mesma geometria usada pelo rasterizador para que a pré-verificação seja fiel. */
export function ladoPictogramaZpl(
  larguraMm: number, dpi: ResolucaoZebra, categoria?: DocumentoZpl['categoria'],
): number {
  const fator = dpi / 203
  const largura = milimetrosParaPontos(larguraMm, dpi)
  const margem = Math.round(22 * fator)
  const larguraUtil = largura - 2 * margem
  const colunas = larguraMm >= 75 ? 3 : 2
  const distancia = Math.round(8 * fator)
  const coluna = Math.floor((larguraUtil - distancia * (colunas - 1)) / colunas)
  // Produto e Resíduo usam o mesmo pictograma lateral, junto do nome.
  const riscoLateral = categoria === 'PRODUTO' || categoria === 'RESIDUO'
  return Math.min(Math.round((riscoLateral ? 72 : 92) * fator), coluna - Math.round(8 * fator))
}

/** Confere o encaixe usando o tamanho real dos pictogramas, sem carregar imagens. */
export function validarEspacoZpl(documento: DocumentoZpl, config: ConfiguracaoZpl): void {
  const lado = ladoPictogramaZpl(config.larguraMm, config.dpi, documento.categoria)
  // Simulação com bitmap de dimensões reais: também suporta giro de gráficos.
  const bytesLinha = Math.ceil(lado / 8)
  const total = bytesLinha * lado
  const imagem = { comando: '^GFA,' + total + ',' + total + ',' + bytesLinha + ',' + '00'.repeat(total), largura: lado, altura: lado }
  const simulados: PictogramaZpl[] = (documento.pictogramas ?? []).map(p => ({
    ...p, imagem,
  }))
  gerarDocumentoZpl(documento, config, undefined, simulados)
}

/**
 * Calcula o menor padrão de altura adequado ao documento, conservando a largura
 * escolhida pelo usuário. A simulação usa a geometria real dos pictogramas,
 * sem carregar imagens; o download valida novamente as imagens oficiais.
 */
export function recomendarConfiguracaoZpl(
  documento: DocumentoZpl,
  larguraMm: number,
  dpi: ResolucaoZebra,
  orientacao: OrientacaoConteudoZpl = 'VERTICAL',
): ConfiguracaoZpl {
  const minimo = orientacao === 'HORIZONTAL' ? 90 : alturaInicialZpl(documento)
  const opcoes = orientacao === 'HORIZONTAL'
    ? ALTURAS_HORIZONTAIS_ZEBRA_MM : ALTURAS_PADRAO_ZEBRA_MM
  for (const alturaMm of opcoes) {
    if (alturaMm < minimo) continue
    const configuracao: ConfiguracaoZpl = { larguraMm, alturaMm, dpi, ...(orientacao === 'HORIZONTAL' ? { orientacao } : {}) }
    try {
      validarEspacoZpl(documento, configuracao)
      return configuracao
    } catch (e) {
      if (!(e instanceof Error) ||
          !/não cabe|não há espaço|excede|ultrapassa|pequena demais|muito grande|estreita demais|não há largura|quadro horizontal/i.test(e.message)) throw e
    }
  }
  throw new Error(orientacao === 'HORIZONTAL'
    ? 'O conteúdo horizontal não cabe nos formatos compatíveis até 300 mm. Experimente outra largura física ou a orientação vertical.'
    : 'Este conteúdo não cabe nos formatos sugeridos (até 300 mm). Aumente a largura ou use a impressão A4.')
}

export function milimetrosParaPontos(mm: number, dpi: ResolucaoZebra): number {
  return Math.round(mm * dpi / POL_MILIMETROS)
}

function validar(config: ConfiguracaoZpl): void {
  if (config.dpi !== 203 && config.dpi !== 300) {
    throw new Error('Selecione resolução Zebra de 203 ou 300 dpi.')
  }
  if (!Number.isFinite(config.larguraMm) || config.larguraMm < 40 || config.larguraMm > LARGURA_MAXIMA_ZPL_MM) {
    throw new Error('A largura do ZPL deve estar entre 40 e 168 mm. Acima de 110 mm, confirme que sua Zebra suporta mídia larga.')
  }
  if (!Number.isFinite(config.alturaMm) || config.alturaMm < 40 || config.alturaMm > 300) {
    throw new Error('A altura do piloto ZPL deve estar entre 40 e 300 mm.')
  }
}

/** Trata como dados cada byte UTF-8, incluindo ^, ~ e _. */
export function escaparCampoZpl(valor: string): string {
  return Array.from(new TextEncoder().encode(valor), b => '_' + b.toString(16).toUpperCase().padStart(2, '0')).join('')
}

/** Quebra determinística, sem truncamento; largura estimada conservadora para fonte ^A0. */
function quebrarTexto(valor: string, largura: number, tamanho: number): string[] {
  const limite = Math.max(3, Math.floor(largura / (tamanho * 0.68)))
  const texto = valor.replace(/\s+/g, ' ').trim()
  if (!texto) return ['Não informado']
  const linhas: string[] = []
  let atual = ''
  for (const palavra of texto.split(' ')) {
    let parte = palavra
    while (parte.length > limite) {
      if (atual) {
        linhas.push(atual)
        atual = ''
      }
      linhas.push(parte.slice(0, limite))
      parte = parte.slice(limite)
    }
    if (!parte) continue
    if (!atual) atual = parte
    else if (atual.length + parte.length + 1 <= limite) atual += ' ' + parte
    else {
      linhas.push(atual)
      atual = parte
    }
  }
  if (atual) linhas.push(atual)
  return linhas
}

function camposValidos(campos: CampoZpl[]): Array<{ rotulo: string; valor: string }> {
  return campos
    .filter(c => c.valor !== null && c.valor !== undefined && String(c.valor).trim() !== '')
    .map(c => ({ rotulo: c.rotulo, valor: String(c.valor) }))
}

/**
 * Gera layout Zebra monocromático:
 * marcas SGL/Embrapa, situação, identificação, cartões de metadados, composição
 * em tabela e notas. A geração lança erro se houver risco de corte.
 * Marcas são opcionais para testes puros; o painel prepara os logos reais em ^GFA.
 */
export function gerarDocumentoZpl(
  documento: DocumentoZpl,
  config: ConfiguracaoZpl,
  marcas?: MarcasZpl,
  pictogramas: PictogramaZpl[] = [],
): string {
  const esperados = documento.pictogramas ?? []
  if (esperados.length !== pictogramas.length ||
    esperados.some((item, i) =>
      item.caminho !== pictogramas[i]?.caminho ||
      item.rotulo !== pictogramas[i]?.rotulo
    )
  ) {
    throw new Error('Nem todos os pictogramas de risco foram carregados. O ZPL não pode omitir símbolos.')
  }
  validar(config)
  if (config.orientacao && config.orientacao !== 'VERTICAL' && config.orientacao !== 'HORIZONTAL') {
    throw new Error('Orientação do conteúdo Zebra inválida.')
  }
  if (config.orientacao === 'HORIZONTAL') {
    return gerarDocumentoZplHorizontal(documento, config, marcas, pictogramas)
  }
  const w = milimetrosParaPontos(config.larguraMm, config.dpi)
  const h = milimetrosParaPontos(config.alturaMm, config.dpi)
  const k = config.dpi / 203
  const p = (base: number) => Math.max(1, Math.round(base * k))
  const compacto = documento.categoria === 'RESIDUO' || documento.categoria === 'PRODUTO'
  const m = p(22)
  const util = w - m * 2
  const pequeno = p(compacto ? 13 : 14)
  const label = p(compacto ? 14 : 15)
  const valor = p(compacto ? 18 : 19)
  const titulo = p(compacto ? 28 : 30)
  const secaoFont = p(compacto ? 19 : 21)
  const passo = (normal: number, reduzido: number) => p(compacto ? reduzido : normal)
  const limite = h - p(7) // limite físico; o espaço do rodapé é validado antes do retorno
  const comandos: string[] = ['^XA', '^CI28', '^LH0,0', '^PW' + w, '^LL' + h]
  let y = m

  function verificar(ateY: number): void {
    if (ateY > limite) {
      throw new Error('O conteúdo não cabe nesta etiqueta. Aumente a altura, a largura ou use a impressão A4.')
    }
  }
  function retangulo(x: number, top: number, largura: number, altura: number, espessura = 1): void {
    verificar(top + altura)
    comandos.push('^FO' + x + ',' + top + '^GB' + largura + ',' + altura + ',' + espessura + '^FS')
  }
  function linha(top: number, x = m, largura = util, espessura = 1): void {
    retangulo(x, top, largura, Math.max(1, espessura), Math.max(1, espessura))
  }
  function escrever(x: number, top: number, conteudo: string, fonte: number, largura: number, entre = p(2), invertido = false): number {
    let yy = top
    const linhas = quebrarTexto(conteudo, largura, fonte)
    for (const trecho of linhas) {
      verificar(yy + fonte)
      comandos.push('^FO' + x + ',' + yy + '^A0N,' + fonte + ',' + fonte
        + (invertido ? '^FR' : '') + '^FH_^FD' + escaparCampoZpl(trecho) + '^FS')
      yy += fonte + entre
    }
    return yy
  }
  function tituloSecao(nome: string): void {
    y += passo(5, 3)
    verificar(y + passo(24, 22))
    retangulo(m, y + p(1), p(5), passo(21, 19), p(5))
    escrever(m + p(14), y, nome.toUpperCase(), secaoFont, util - p(18), p(1))
    y += passo(25, 22)
  }
  function camposEmGrade(campos: CampoZpl[]): void {
    const dados = camposValidos(campos)
    if (!dados.length) return
    const colunas = config.larguraMm >= 75 ? 2 : 1
    const gap = p(15)
    const colW = Math.floor((util - gap * (colunas - 1)) / colunas)
    for (let i = 0; i < dados.length; i += colunas) {
      const ini = y
      let fim = ini
      for (let j = 0; j < colunas && i + j < dados.length; j++) {
        const item = dados[i + j]
        const x = m + j * (colW + gap)
        let v = escrever(x, ini + passo(4, 2), item.rotulo.toUpperCase(), label, colW, p(1))
        v = escrever(x, v + passo(2, 1), item.valor, valor, colW, passo(2, 1))
        fim = Math.max(fim, v)
      }
      y = fim + passo(5, 3)
      if (i + colunas < dados.length) {
        linha(y)
        y += passo(2, 1)
      }
    }
    y += p(1)
  }
  function tabelaComponentes(campos: CampoZpl[]): void {
    const dados = camposValidos(campos)
    if (!dados.length) return
    const quantidadeW = Math.round(util * (config.larguraMm >= 75 ? 0.26 : 0.36))
    const nomeW = util - quantidadeW - p(12)
    const xQtd = m + util - quantidadeW
    let cab = escrever(m, y + passo(5, 3), 'COMPONENTE', pequeno, nomeW)
    cab = Math.max(cab, escrever(xQtd, y + passo(5, 3), 'QUANTIDADE', pequeno, quantidadeW))
    y = cab + passo(6, 4)
    linha(y, m, util, p(2))
    y += passo(5, 3)
    for (const item of dados) {
      const fimNome = escrever(m, y + passo(5, 3), item.rotulo, valor, nomeW)
      const fimQtd = escrever(xQtd, y + passo(5, 3), item.valor, valor, quantidadeW)
      y = Math.max(fimNome, fimQtd) + passo(5, 3)
      linha(y)
      y += passo(2, 1)
    }
    y += p(1)
  }
  function notas(campos: CampoZpl[]): void {
    for (const item of camposValidos(campos)) {
      const inicio = y + passo(3, 2)
      retangulo(m, inicio, p(3), p(20), p(3))
      const fimLabel = escrever(m + p(12), inicio, item.rotulo.toUpperCase(), label, util - p(20))
      y = escrever(m + p(12), fimLabel + passo(3, 2), item.valor, valor, util - p(24)) + passo(5, 3)
      linha(y)
      y += passo(3, 2)
    }
  }

  function desenharPictogramas(): void {
    if (!pictogramas.length) return
    tituloSecao(compacto ? 'Risco' : 'Pictogramas de risco')
    const colunas = config.larguraMm >= 75 ? 3 : 2
    const distancia = p(8)
    const coluna = Math.floor((util - distancia * (colunas - 1)) / colunas)
    const lado = Math.min(p(92), coluna - p(8))
    const margemInterna = p(4)
    for (let i = 0; i < pictogramas.length; i += colunas) {
      const inicio = y
      let maiorLegenda = 0
      for (let j = 0; j < colunas && i + j < pictogramas.length; j++) {
        const item = pictogramas[i + j]
        if (item.imagem.largura > lado || item.imagem.altura > lado) {
          throw new Error('Pictograma maior que a área disponível da etiqueta Zebra.')
        }
        const x = m + j * (coluna + distancia)
        const centroX = x + Math.round((coluna - item.imagem.largura) / 2)
        const posY = inicio + margemInterna + Math.round((lado - item.imagem.altura) / 2)
        verificar(posY + item.imagem.altura)
        comandos.push('^FO' + centroX + ',' + posY + item.imagem.comando + '^FS')
        const fim = escrever(x, inicio + lado + p(8), item.rotulo, pequeno, coluna, p(1))
        maiorLegenda = Math.max(maiorLegenda, fim)
      }
      y = maiorLegenda + p(8)
      if (i + colunas < pictogramas.length) {
        linha(y)
        y += p(4)
      }
    }
  }

  /**
   * Produtos e Resíduos: risco ao lado do nome, com legenda RISCO, sem criar uma seção
   * vertical inteira. Se houver vários símbolos, a coluna lateral acomoda
   * todos em linhas; o nome/código nunca é apagado nem truncado.
   */
  function riscoAoLado(x: number, inicio: number, largura: number): number {
    let top = escrever(x, inicio, 'RISCO', secaoFont, largura, p(1)) + p(4)
    const colunas = pictogramas.length > 1 ? 2 : 1
    const gap = p(5)
    const coluna = Math.floor((largura - gap * (colunas - 1)) / colunas)
    const lado = ladoPictogramaZpl(config.larguraMm, config.dpi, documento.categoria)
    if (lado > coluna) throw new Error('Etiqueta estreita demais para pictogramas legíveis.')
    for (let i = 0; i < pictogramas.length; i += colunas) {
      let fim = top
      for (let j = 0; j < colunas && i + j < pictogramas.length; j++) {
        const item = pictogramas[i + j]
        if (item.imagem.largura > lado || item.imagem.altura > lado) {
          throw new Error('Pictograma maior que a área disponível da etiqueta Zebra.')
        }
        const xColuna = x + j * (coluna + gap)
        const imagemX = xColuna + Math.floor((coluna - item.imagem.largura) / 2)
        const imagemY = top
        verificar(imagemY + item.imagem.altura)
        comandos.push('^FO' + imagemX + ',' + imagemY + item.imagem.comando + '^FS')
        const legendaY = escrever(xColuna, top + lado + p(3), item.rotulo, pequeno, coluna, p(1))
        fim = Math.max(fim, legendaY)
      }
      top = fim + p(4)
    }
    return top
  }

  // Moldura e marcas em preto e branco, preparadas no navegador a partir dos logos.
  const logoH = p(42)
  const metade = Math.floor((util - p(18)) / 2)
  if (marcas) {
    if (marcas.sgl.largura > metade || marcas.embrapa.largura > metade
      || marcas.sgl.altura > logoH || marcas.embrapa.altura > logoH) {
      throw new Error('As marcas excedem o espaço previsto no cabeçalho térmico.')
    }
    comandos.push('^FO' + m + ',' + y + marcas.sgl.comando + '^FS')
    comandos.push('^FO' + (w - m - marcas.embrapa.largura) + ',' + y + marcas.embrapa.comando + '^FS')
  } else {
    escrever(m, y, 'SGL', p(31), metade)
    escrever(m + metade + p(18), y, 'EMBRAPA', p(20), metade)
  }
  y += logoH + p(3)
  // Alinhamento da legenda do SGL aprovado visualmente para a versão térmica.
  y = escrever(m + p(48), y, 'SISTEMA DE GESTÃO DE LABORATÓRIOS', pequeno, util - p(48)) + p(7)
  linha(y, m, util, p(2))
  y += p(13)

  // Faixa sólida: identificação do documento e estado.
  const faixaH = p(38)
  retangulo(m, y, util, faixaH, faixaH)
  escrever(m + p(10), y + p(9), documento.titulo.toUpperCase(), p(19), util - p(20), p(1), true)
  y += faixaH + p(11)

  const assunto = documento.subtitulo || documento.identificador
  const riscoLateral = compacto && pictogramas.length > 0 && config.larguraMm >= 75
  const larguraRisco = riscoLateral ? Math.round(util * 0.35) : 0
  const textoUtil = riscoLateral ? util - larguraRisco - p(12) : util
  const inicioAssunto = y
  y = escrever(m, y, assunto, titulo, textoUtil, p(2)) + passo(6, 3)
  if (documento.situacao) {
    const v = escrever(m, y, documento.situacao.toUpperCase(), p(18), textoUtil)
    y = v + passo(7, 4)
  }
  y = escrever(m, y, 'CÓDIGO SGL / IDENTIFICADOR', pequeno, textoUtil, p(1))
  y = escrever(m, y + passo(2, 1), documento.identificador, p(18), textoUtil, p(1)) + passo(7, 4)
  if (riscoLateral) {
    const yRisco = riscoAoLado(m + util - larguraRisco, inicioAssunto, larguraRisco)
    y = Math.max(y, yRisco) + p(3)
  } else {
    desenharPictogramas()
  }

  for (const secao of documento.secoes) {
    const itens = camposValidos(secao.campos)
    if (!itens.length) continue
    tituloSecao(secao.titulo)
    if (/componente/i.test(secao.titulo)) tabelaComponentes(secao.campos)
    else if (/instruç|observa|instruco/i.test(secao.titulo)) notas(secao.campos)
    else camposEmGrade(secao.campos)
  }

  if (documento.avisoFinal) {
    y += p(3)
    const avisoY = y
    const textoY = escrever(m + p(9), y + p(5), documento.avisoFinal, pequeno, util - p(18), p(2))
    retangulo(m, avisoY, util, textoY - avisoY + p(4), 1)
    y = textoY + p(6)
  }
  verificar(y)

  // Identificação da origem no pé, de forma independente do comprimento do corpo.
  const baseY = h - m - p(33)
  if (y > baseY - p(7)) {
    throw new Error('Não há espaço para o rodapé nesta mídia. Aumente a altura.')
  }
  linha(baseY, m, util, p(2))
  escrever(m, baseY + p(8), 'SGL  |  EMBRAPA', pequeno, util)
  escrever(m, baseY + p(24), 'RASTREABILIDADE INTERNA', p(12), util)
  // Borda do documento: sempre dentro da mídia física.
  comandos.push('^FO' + p(7) + ',' + p(7) + '^GB' + (w - p(14)) + ',' + (h - p(14)) + ',1^FS')
  comandos.push('^PQ1', '^XZ')
  return comandos.join('\n')
}


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
  const dados = new Uint8Array(total)
  for (let i = 0; i < total; i++) {
    dados[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return { dados, porLinha: bytes }
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

  // Experimente distribuições de 1 a N colunas: a escolha leva em conta
  // o espaço real utilizado e evita grandes áreas vazias entre os quadros.
  // Seções nunca são truncadas; todas devem caber integralmente.
  const maxColunas = Math.max(1, Math.min(6, Math.floor((util + gap) / (px(225) + gap))))
  const secoes = documento.secoes.map(secao => ({
    secao, campos: validos(secao.campos),
  })).filter(item => item.campos.length > 0)

  type BlocoHorizontal = {
    secao: SecaoZpl
    campos: DadosValidos[]
    medida: number
    indice: number
    coluna: number
    topo: number
  }
  let melhor: { blocos: BlocoHorizontal[]; colunas: number; largura: number; ocupacao: number } | null = null

  for (let numero = 1; numero <= maxColunas; numero++) {
    const largura = Math.floor((util - (numero - 1) * gap) / numero)
    const alturas = Array.from({ length: numero }, () => bodyY)
    const blocos: BlocoHorizontal[] = []
    let cabe = true

    const medidas = secoes.map((item, indice) => {
      const larguraTexto = largura - px(16)
      const tituloLinhas = quebrar(item.secao.titulo.toUpperCase(), largura - px(21), px(16)).length
      let medida = px(7) + tituloLinhas * (px(16) + px(2)) + px(5)
      for (const campo of item.campos) {
        medida += quebrar(campo.rotulo.toUpperCase(), larguraTexto, rotulo).length * (rotulo + px(2))
        medida += px(1) + quebrar(campo.valor, larguraTexto, fonte).length * (fonte + px(2)) + px(4)
      }
      return { ...item, indice, medida: medida + px(7) }
    })
    // Distribuir maiores quadros primeiro evita colunas cheias e outras vazias.
    for (const item of medidas.sort((a, b) => b.medida - a.medida)) {
      const indice = alturas.indexOf(Math.min(...alturas))
      const topo = alturas[indice]
      if (topo + item.medida > finalCorpo) { cabe = false; break }
      blocos.push({ ...item, coluna: indice, topo })
      alturas[indice] += item.medida + gap
    }
    if (!cabe) continue
    // Priorizar menos colunas e maior ocupação da altura útil, diminuindo as
    // lacunas entre quadros; usar mais colunas somente se o conteúdo exigir.
    const ocupacao = (Math.max(...alturas) - bodyY) / Math.max(px(1), finalCorpo - bodyY)
    const pontuacao = numero * 100 - ocupacao
    if (!melhor || pontuacao < melhor.colunas * 100 - melhor.ocupacao) {
      melhor = { blocos, colunas: numero, largura, ocupacao }
    }
  }

  if (!melhor) {
    throw new Error('O conteúdo horizontal não cabe nesta etiqueta. Aumente a altura física ou use o modo vertical.')
  }

  // Manter a ordem lógica do documento na sequência de comandos ZPL.
  for (const bloco of melhor.blocos.sort((a, b) => a.indice - b.indice)) {
    const x = m + bloco.coluna * (melhor.largura + gap)
    const yy = bloco.topo
    retangulo(x, yy, melhor.largura, bloco.medida, px(1))
    let campoY = yy + px(7)
    retangulo(x + px(4), campoY + px(2), px(4), px(17), px(4))
    campoY = escrever(x + px(13), campoY, bloco.secao.titulo.toUpperCase(), px(16), melhor.largura - px(21)) + px(5)
    for (const campo of bloco.campos) {
      campoY = escrever(x + px(8), campoY, campo.rotulo.toUpperCase(), rotulo, melhor.largura - px(16))
      campoY = escrever(x + px(8), campoY + px(1), campo.valor, fonte, melhor.largura - px(16)) + px(4)
    }
    if (campoY > yy + bloco.medida - px(2)) {
      throw new Error('Os campos ultrapassaram o quadro horizontal; a impressão foi bloqueada.')
    }
  }

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
