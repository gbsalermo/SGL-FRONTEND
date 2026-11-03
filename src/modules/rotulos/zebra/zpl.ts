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
  categoria?: 'SOLUCAO' | 'ENTRADA_LOTE'
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

const POL_MILIMETROS = 25.4

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
export function gerarDocumentoZpl(documento: DocumentoZpl, config: ConfiguracaoZpl, marcas?: MarcasZpl): string {
  validar(config)
  const w = milimetrosParaPontos(config.larguraMm, config.dpi)
  const h = milimetrosParaPontos(config.alturaMm, config.dpi)
  const k = config.dpi / 203
  const p = (base: number) => Math.max(1, Math.round(base * k))
  const m = p(22)
  const util = w - m * 2
  const pequeno = p(14)
  const label = p(15)
  const valor = p(19)
  const titulo = p(30)
  const secaoFont = p(21)
  const espaco = p(5)
  const rodapeH = p(42)
  const limite = h - m - rodapeH
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
    y += p(9)
    verificar(y + p(27))
    retangulo(m, y + p(1), p(5), p(21), p(5))
    escrever(m + p(14), y, nome.toUpperCase(), secaoFont, util - p(18), p(1))
    y += p(29)
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
        let v = escrever(x, ini + p(6), item.rotulo.toUpperCase(), label, colW, p(1))
        v = escrever(x, v + p(2), item.valor, valor, colW, p(2))
        fim = Math.max(fim, v)
      }
      y = fim + p(7)
      if (i + colunas < dados.length) {
        linha(y)
        y += p(2)
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
    let cab = escrever(m, y + p(5), 'COMPONENTE', pequeno, nomeW)
    cab = Math.max(cab, escrever(xQtd, y + p(5), 'QUANTIDADE', pequeno, quantidadeW))
    y = cab + p(6)
    linha(y, m, util, p(2))
    y += p(5)
    for (const item of dados) {
      const fimNome = escrever(m, y + p(5), item.rotulo, valor, nomeW)
      const fimQtd = escrever(xQtd, y + p(5), item.valor, valor, quantidadeW)
      y = Math.max(fimNome, fimQtd) + p(5)
      linha(y)
      y += p(2)
    }
    y += p(1)
  }
  function notas(campos: CampoZpl[]): void {
    for (const item of camposValidos(campos)) {
      const inicio = y + p(5)
      retangulo(m, inicio, p(3), p(20), p(3))
      const fimLabel = escrever(m + p(12), inicio, item.rotulo.toUpperCase(), label, util - p(20))
      y = escrever(m + p(12), fimLabel + p(3), item.valor, valor, util - p(24)) + p(7)
      linha(y)
      y += p(3)
    }
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
  escrever(m, y, 'SISTEMA DE GESTÃO DE LABORATÓRIOS', pequeno, util)
  y += pequeno + p(9)
  linha(y, m, util, p(2))
  y += p(13)

  // Faixa sólida: identificação do documento e estado.
  const faixaH = p(38)
  retangulo(m, y, util, faixaH, faixaH)
  escrever(m + p(10), y + p(9), documento.titulo.toUpperCase(), p(19), util - p(20), p(1), true)
  y += faixaH + p(11)

  const assunto = documento.subtitulo || documento.identificador
  y = escrever(m, y, assunto, titulo, util, p(2)) + p(6)
  if (documento.situacao) {
    const v = escrever(m, y, documento.situacao.toUpperCase(), p(18), util)
    y = v + p(7)
  }
  y = escrever(m, y, 'CÓDIGO SGL / IDENTIFICADOR', pequeno, util, p(1))
  y = escrever(m, y + p(2), documento.identificador, p(18), util, p(1)) + p(7)

  for (const secao of documento.secoes) {
    const itens = camposValidos(secao.campos)
    if (!itens.length) continue
    tituloSecao(secao.titulo)
    if (/componente/i.test(secao.titulo)) tabelaComponentes(secao.campos)
    else if (/instruç|observa|instruco/i.test(secao.titulo)) notas(secao.campos)
    else camposEmGrade(secao.campos)
  }

  if (documento.avisoFinal) {
    y += p(5)
    const avisoY = y
    const textoY = escrever(m + p(9), y + p(7), documento.avisoFinal, pequeno, util - p(18), p(2))
    retangulo(m, avisoY, util, textoY - avisoY + p(5), 1)
    y = textoY + p(9)
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
