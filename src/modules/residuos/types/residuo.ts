export type NivelRiscoResiduo = 'NENHUM' | 'BAIXO' | 'MEDIO' | 'ALTO'

export type TipoRiscoResiduo =
  | 'NENHUM'
  | 'INFLAMAVEL'
  | 'RADIOATIVO'
  | 'TOXICO'
  | 'CORROSIVO'
  | 'BIOLOGICO'
  | 'IRRITANTE'
  | 'PERIGO_SAUDE'
  | 'OXIDANTE'
  | 'EXPLOSIVO'
  | 'GAS_PRESSURIZADO'
  | 'PERIGO_AMBIENTAL'

export type UnidadeMedidaResiduo =
  | 'ML'
  | 'L'
  | 'MG'
  | 'G'
  | 'KG'
  | 'UNIDADE'
  | 'REACAO'
  | 'CAIXA'
  | 'FRASCO'
  | 'AMPOLA'
  | 'PAR'
  | 'METRO'
  | 'OUTRO'

export interface ComponenteResiduoRequest {
  produtoId: string | null
  nomeComponente: string | null
  principal: boolean
  concentracaoOuQuantidade: string | null
  observacao: string | null
}

export interface CriarResiduoRequest {
  usuarioGeradorId: string
  laboratorioId: string
  projetoId: string | null
  descricao: string
  processoOrigem: string
  recipiente: string
  quantidade: number
  unidadeMedida: UnidadeMedidaResiduo
  nivelRiscoInformado: NivelRiscoResiduo
  riscosInformados: TipoRiscoResiduo[]
  observacaoGerador: string | null
  componentes: ComponenteResiduoRequest[]
}

export interface ComponenteResiduoResponse {
  id: string
  produtoId: string | null
  produtoNomeCatalogo: string | null
  nomeComponente: string
  principal: boolean | null
  concentracaoOuQuantidade: string | null
  observacao: string | null
}

export interface ResiduoResponse {
  id: string
  usuarioGeradorId: string
  usuarioGeradorNome: string
  laboratorioId: string
  laboratorioNome: string
  projetoId: string | null
  projetoNome: string | null
  descricao: string
  processoOrigem: string
  recipiente: string
  quantidade: number
  unidadeMedida: UnidadeMedidaResiduo
  nivelRiscoInformado: NivelRiscoResiduo
  riscosInformados: TipoRiscoResiduo[]
  observacaoGerador: string | null
  status: 'INFORMADO' | 'EM_ANALISE' | 'LIBERADO_PARA_ARMAZENAMENTO' | 'ARMAZENADO_TEMPORARIAMENTE' | 'DESPACHADO'
  dataInformacao: string
  codigoRastreio: string | null
  qrCodeConteudo: string | null
  componentes: ComponenteResiduoResponse[]
}

export interface ProjetoResiduoResponse {
  id: string
  nome: string
  ativo: boolean
}

export interface ProdutoResiduoResponse {
  id: string
  nome: string
  codigoReferencia: string | null
  unidadeMedida: UnidadeMedidaResiduo
  unidadeArmazenamento: string | null
  risco: NivelRiscoResiduo | null
  tipoRisco: TipoRiscoResiduo | null
  ativo: boolean
}

export interface ApiErrorResponse {
  message?: string
  fieldErrors?: Record<string, string> | Array<{ field?: string; message?: string }> | null
}
