/**
 * Layout térmico institucional do SGL: comandos ZPL II, sem dependência do modelo.
 * As medidas físicas dependem da mídia e da largura real do cabeçote Zebra.
 * Nenhum gráfico de segurança GHS é gerado por esta versão informativa.
 */
export type ResolucaoZebra = 203 | 300

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
export const ALTURAS_PADRAO_ZEBRA_MM = [125, 140, 150, 160, 175, 180, 200, 225, 250, 275, 300] as const

export function alturaInicialZpl(documento: DocumentoZpl): number {
  return documento.categoria === 'PRODUTO' ? 200 : 125
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
  // Na etiqueta de Resíduo o risco fica na coluna lateral, ao lado do nome.
  return Math.min(Math.round((categoria === 'RESIDUO' ? 72 : 92) * fator), coluna - Math.round(8 * fator))
}

/** Confere o encaixe usando o tamanho real dos pictogramas, sem carregar imagens. */
export function validarEspacoZpl(documento: DocumentoZpl, config: ConfiguracaoZpl): void {
  const lado = ladoPictogramaZpl(config.larguraMm, config.dpi, documento.categoria)
  const simulados: PictogramaZpl[] = (documento.pictogramas ?? []).map(p => ({
    ...p,
    imagem: { comando: '^GFA,1,1,1,FF', largura: lado, altura: lado },
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
): ConfiguracaoZpl {
  const minimo = alturaInicialZpl(documento)
  for (const alturaMm of ALTURAS_PADRAO_ZEBRA_MM) {
    if (alturaMm < minimo) continue
    const configuracao: ConfiguracaoZpl = { larguraMm, alturaMm, dpi }
    try {
      validarEspacoZpl(documento, configuracao)
      return configuracao
    } catch (e) {
      if (!(e instanceof Error) ||
          !/não cabe|não há espaço para o rodapé/i.test(e.message)) throw e
    }
  }
  throw new Error('Este conteúdo não cabe nos formatos sugeridos (até 300 mm). Aumente a largura ou use a impressão A4.')
}

export function milimetrosParaPontos(mm: number, dpi: ResolucaoZebra): number {
  return Math.round(mm * dpi / POL_MILIMETROS)
}

function validar(config: ConfiguracaoZpl): void {
  if (config.dpi !== 203 && config.dpi !== 300) {
    throw new Error('Selecione resolução Zebra de 203 ou 300 dpi.')
  }
  if (!Number.isFinite(config.larguraMm) || config.larguraMm < 40 || config.larguraMm > 110) {
    throw new Error('A largura do piloto ZPL deve estar entre 40 e 110 mm.')
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
  const w = milimetrosParaPontos(config.larguraMm, config.dpi)
  const h = milimetrosParaPontos(config.alturaMm, config.dpi)
  const k = config.dpi / 203
  const p = (base: number) => Math.max(1, Math.round(base * k))
  const compacto = documento.categoria === 'RESIDUO'
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
   * Resíduos: risco ao lado do nome, com legenda RISCO, sem criar uma seção
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
