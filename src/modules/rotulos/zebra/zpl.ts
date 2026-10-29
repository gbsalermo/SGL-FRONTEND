/**
 * Etapa 10 — piloto ZPL para etiquetas informativas.
 * Não imprime diretamente, não substitui a etiqueta HTML e NÃO é uma etiqueta
 * de segurança GHS: pictogramas e logos ainda precisam de arte monocromática.
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
  secoes: SecaoZpl[]
  avisoFinal?: string
}

export interface ConfiguracaoZpl {
  larguraMm: number
  alturaMm: number
  dpi: ResolucaoZebra
}

const POL_MILIMETROS = 25.4
const MARGEM_MM = 3

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

/** Escapa TODOS os bytes UTF-8 para evitar execução de ^ ou ~ no conteúdo. */
export function escaparCampoZpl(valor: string): string {
  return Array.from(new TextEncoder().encode(valor), byte => '_' + byte.toString(16).toUpperCase().padStart(2, '0')).join('')
}

function quebrarTexto(valor: string, limite: number): string[] {
  const limpo = valor.replace(/\s+/g, ' ').trim()
  if (!limpo) return ['Não informado']
  const tokens = limpo.split(' ')
  const linhas: string[] = []
  let linha = ''
  for (const token of tokens) {
    let restante = token
    while (restante.length > limite) {
      if (linha) {
        linhas.push(linha)
        linha = ''
      }
      linhas.push(restante.slice(0, limite))
      restante = restante.slice(limite)
    }
    if (!restante) continue
    if (!linha) linha = restante
    else if (linha.length + restante.length + 1 <= limite) linha += ' ' + restante
    else {
      linhas.push(linha)
      linha = restante
    }
  }
  if (linha) linhas.push(linha)
  return linhas
}

/**
 * Gera uma etiqueta textual monocromática. Se todos os dados não couberem na
 * mídia especificada, a operação FALHA, em vez de cortar observações silenciosamente.
 * Largura física deve ser validada contra o modelo real da impressora.
 */
export function gerarDocumentoZpl(documento: DocumentoZpl, config: ConfiguracaoZpl): string {
  validar(config)
  const largura = milimetrosParaPontos(config.larguraMm, config.dpi)
  const altura = milimetrosParaPontos(config.alturaMm, config.dpi)
  const margem = milimetrosParaPontos(MARGEM_MM, config.dpi)
  const larguraUtil = largura - 2 * margem
  const fator = config.dpi / 203
  const corpo = Math.round(20 * fator)
  const pequeno = Math.round(17 * fator)
  const titulo = Math.round(27 * fator)
  const intervalo = Math.round(6 * fator)
  const linhas: string[] = ['^XA', '^CI28', '^LH0,0', '^PW' + largura, '^LL' + altura]
  let y = margem

  function escrever(texto: string, tamanho: number): void {
    const limite = Math.max(8, Math.floor(larguraUtil / (tamanho * 0.68)))
    for (const linha of quebrarTexto(texto, limite)) {
      if (y + tamanho + margem >= altura) {
        throw new Error('O conteúdo não cabe nesta etiqueta. Aumente a altura, a largura ou use a impressão A4.')
      }
      linhas.push('^FO' + margem + ',' + y + '^A0N,' + tamanho + ',' + tamanho + '^FH_^FD' + escaparCampoZpl(linha) + '^FS')
      y += tamanho + intervalo
    }
  }

  function separar(): void {
    if (y + margem >= altura) {
      throw new Error('O conteúdo não cabe nesta etiqueta. Aumente suas dimensões.')
    }
    linhas.push('^FO' + margem + ',' + y + '^GB' + larguraUtil + ',1,1^FS')
    y += intervalo * 2
  }

  escrever('SGL  /  EMBRAPA', pequeno)
  escrever(documento.titulo, titulo)
  escrever(documento.identificador, corpo)
  if (documento.subtitulo) escrever(documento.subtitulo, pequeno)
  separar()

  for (const secao of documento.secoes) {
    escrever(secao.titulo.toUpperCase(), corpo)
    for (const campo of secao.campos) {
      if (campo.valor === null || campo.valor === undefined || String(campo.valor).trim() === '') continue
      escrever(campo.rotulo + ': ' + String(campo.valor), pequeno)
    }
    separar()
  }

  if (documento.avisoFinal) escrever(documento.avisoFinal, pequeno)
  linhas.push('^PQ1', '^XZ')
  return linhas.join('\n')
}
