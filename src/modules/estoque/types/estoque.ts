export type TipoEmbalagem = 'UNITARIO' | 'FRASCO' | 'AMPOLA' | 'GARRAFA' | 'GALAO' | 'CAIXA' | 'KIT' | 'PACOTE' | 'SACO' | 'TUBO' | 'POTE' | 'PAR' | 'OUTRO'

export interface ApresentacaoFisicaEstoque {
  tipoEmbalagem: TipoEmbalagem
  capacidade: number
  unidadeMedida: string
  fechados: number
  abertos: number
  esgotados: number
}

export interface EstoqueCentralResponse {
  id: string
  unidadeId: string
  unidadeNome: string
  unidadeSigla: string
  produtoId: string
  produtoNome: string
  produtoCodigoReferencia: string | null
  produtoLocalizacaoFisica: string | null
  produtoUnidadeArmazenamento: string
  produtoUnidadeMedida: string
  apresentacoesFisicas?: ApresentacaoFisicaEstoque[]
  quantidadeAtual: number
  quantidadeMinima: number
  ativo: boolean
}

export interface LoteResponse {
  id: string
  estoqueCentralId: string
  produtoId: string
  produtoNome: string
  unidadeId: string
  unidadeNome: string
  codigoInterno: string
  numeroLote: string
  tipoEmbalagem: TipoEmbalagem
  apresentacao: string | null
  quantidadeApresentacoes: number | null
  conteudoPorApresentacao: number | null
  fracionavel: boolean | null
  observacao: string | null
  unidadeBase: string
  quantidadeInicial: number
  quantidadeDisponivel: number
  dataEntrada: string
  dataValidade: string | null
  ativo: boolean
}

export interface MovimentacaoLoteResponse {
  id: string
  pedidoId: string | null
  pedidoSolicitanteNome: string | null
  usuarioNome: string
  loteId: string | null
  codigoInternoLote: string | null
  tipoMovimentacao: string
  quantidadeMovimentada: number
  dataMovimentacao: string
  observacao: string | null
}

export interface EntradaLoteRequest {
  numeroLote: string
  tipoEmbalagem: TipoEmbalagem
  apresentacao: string | null
  quantidade: number
  conteudoPorApresentacao: number
  fracionavel: boolean
  dataValidade: string | null
  origem: string
  observacao: string | null
}

export interface AtualizarLoteRequest {
  numeroLote: string
  tipoEmbalagem: TipoEmbalagem
  apresentacao: string | null
  fracionavel: boolean
  observacao: string | null
  dataValidade: string | null
  ativo: boolean
}

export interface DescarteProdutoRequest {
  quantidade: number
  justificativa: string
}
