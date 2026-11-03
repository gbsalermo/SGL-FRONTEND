/**
 * Adaptador do protocolo local Zebra Browser Print (/available, /write).
 * Só acessa localhost (9100/9101), pelo navegador do operador, após ação explícita.
 * A aplicação Zebra Browser Print precisa estar instalada e o host autorizado nela.
 */
export interface ImpressoraZebraLocal {
  uid: string
  name: string
  deviceType: string
  connection?: string
  provider?: string
  manufacturer?: string
  version?: number
}

export type SolicitarLocal = typeof fetch

export function enderecoBrowserPrint(protocolo: string): string {
  return protocolo === 'https:' ? 'https://localhost:9101' : 'http://localhost:9100'
}

async function consultar(
  url: string,
  metodo: 'GET' | 'POST',
  corpo?: string,
  solicitar: SolicitarLocal = fetch,
): Promise<Response> {
  let resposta: Response
  try {
    resposta = await solicitar(url, {
      method: metodo,
      ...(corpo ? { body: corpo } : {}),
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    throw new Error('Não foi possível acessar o Zebra Browser Print neste computador. Instale/inicie o aplicativo oficial, autorize o endereço do SGL e, se necessário, aceite o certificado local.')
  }
  if (!resposta.ok) {
    if (resposta.status === 403) throw new Error('O Zebra Browser Print bloqueou este endereço. Autorize o SGL na lista de hosts aceitos do aplicativo.')
    throw new Error(`O Zebra Browser Print retornou erro ${resposta.status}. Verifique o aplicativo e a impressora selecionada.`)
  }
  return resposta
}

export async function listarImpressorasZebra(
  protocolo: string,
  solicitar?: SolicitarLocal,
): Promise<ImpressoraZebraLocal[]> {
  const resposta = await consultar(
    enderecoBrowserPrint(protocolo) + '/available', 'GET', undefined, solicitar,
  )
  let dados: unknown
  try {
    dados = await resposta.json()
  } catch {
    throw new Error('O Zebra Browser Print retornou uma lista de impressoras inválida.')
  }
  if (!dados || typeof dados !== 'object') throw new Error('Resposta inválida do Zebra Browser Print.')
  const lista = (dados as { printer?: unknown }).printer
  if (!Array.isArray(lista)) throw new Error('Não foi possível interpretar as impressoras disponíveis.')
  return lista.filter((item): item is ImpressoraZebraLocal =>
    !!item && typeof item === 'object' &&
    typeof item.uid === 'string' && !!item.uid.trim() &&
    typeof item.name === 'string' &&
    item.deviceType === 'printer',
  )
}

export async function enviarZplParaZebra(
  protocolo: string,
  impressora: ImpressoraZebraLocal,
  zpl: string,
  solicitar?: SolicitarLocal,
): Promise<void> {
  if (impressora.deviceType !== 'printer' || !impressora.uid.trim()) {
    throw new Error('Selecione uma impressora Zebra válida antes de imprimir.')
  }
  if (!zpl.startsWith('^XA') || !zpl.trimEnd().endsWith('^XZ')) {
    throw new Error('O arquivo ZPL não é válido para envio.')
  }
  if (new TextEncoder().encode(zpl).length > 2 * 1024 * 1024) {
    throw new Error('O trabalho excede o limite de 2 MB do Zebra Browser Print.')
  }
  await consultar(
    enderecoBrowserPrint(protocolo) + '/write',
    'POST',
    JSON.stringify({ device: impressora, data: zpl }),
    solicitar,
  )
  // Sucesso no transporte não garante a conclusão física da impressão.
}
