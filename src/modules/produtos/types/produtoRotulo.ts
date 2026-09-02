import type { NivelRiscoResiduo, TipoRiscoResiduo, UnidadeMedidaResiduo } from '@/modules/residuos/types/residuo'

export type OrgaoFiscalizadorProduto =
  | 'POLICIA_FEDERAL'
  | 'VIGILANCIA_SANITARIA'
  | 'ANVISA'
  | 'EXERCITO'
  | 'OUTRO'

export interface ProdutoRotuloResponse {
  id: string
  nome: string
  descricao: string | null
  codigoReferencia: string | null
  unidadeMedida: UnidadeMedidaResiduo
  localizacaoFisica: string | null
  risco: NivelRiscoResiduo | null
  tipoRisco: TipoRiscoResiduo | null
  descricaoRisco: string | null
  perecivel: boolean
  tipoPerecivel: string | null
  condicoesArmazenamento: string | null
  unidadeArmazenamento: string | null
  fiscalizado: boolean
  orgaosFiscalizadores: OrgaoFiscalizadorProduto[]
  observacaoFiscalizacao: string | null
  ativo: boolean
}
