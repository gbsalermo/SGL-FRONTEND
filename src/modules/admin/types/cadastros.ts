import type { PerfilUsuario, UsuarioSessao } from '@/modules/auth/types/session'

export interface UnidadeCadastro {
  id: string
  nome: string
  sigla: string | null
}

export interface LaboratorioCadastro {
  id: string
  unidadeId: string
  nome: string
  descricao: string | null
  responsavelId: string | null
  responsavelNome: string | null
  ativo: boolean
}

export interface LaboratorioRequest {
  unidadeId: string
  nome: string
  descricao: string | null
  responsavelId: string | null
  ativo: boolean
}

export interface ProjetoCadastro {
  id: string
  laboratorioId: string
  laboratorioNome: string
  nome: string
  descricao: string | null
  dataInicio: string | null
  dataFim: string | null
  responsavel: string | null
  ativo: boolean
}

export interface ProjetoRequest {
  laboratorioId: string
  nome: string
  descricao: string | null
  dataInicio: string | null
  dataFim: string | null
  responsavel: string | null
  ativo: boolean
}

export type UnidadeMedidaCadastro =
  | 'ML' | 'L' | 'MG' | 'G' | 'KG' | 'UNIDADE' | 'REACAO'
  | 'CAIXA' | 'FRASCO' | 'AMPOLA' | 'PAR' | 'METRO' | 'OUTRO'

export type NivelRiscoCadastro = 'NENHUM' | 'BAIXO' | 'MEDIO' | 'ALTO'

export type TipoRiscoCadastro =
  | 'NENHUM' | 'INFLAMAVEL' | 'RADIOATIVO' | 'TOXICO' | 'CORROSIVO'
  | 'BIOLOGICO' | 'IRRITANTE' | 'PERIGO_SAUDE' | 'OXIDANTE' | 'EXPLOSIVO'
  | 'GAS_PRESSURIZADO' | 'PERIGO_AMBIENTAL'

export type TipoPerecivelCadastro = 'NENHUM' | 'QUIMICO' | 'MICROBIANO' | 'VEGETAL' | 'ANIMAL'

export type OrgaoFiscalizadorCadastro =
  | 'POLICIA_FEDERAL' | 'VIGILANCIA_SANITARIA' | 'ANVISA' | 'EXERCITO' | 'OUTRO'

export interface ProdutoCadastro {
  id: string
  nome: string
  descricao: string | null
  codigoReferencia: string
  unidadeMedida: UnidadeMedidaCadastro
  localizacaoFisica: string | null
  risco: NivelRiscoCadastro
  tipoRisco: TipoRiscoCadastro | null
  descricaoRisco: string | null
  perecivel: boolean
  tipoPerecivel: TipoPerecivelCadastro | null
  condicoesArmazenamento: string | null
  unidadeArmazenamento: string | null
  fiscalizado: boolean
  orgaosFiscalizadores: OrgaoFiscalizadorCadastro[]
  observacaoFiscalizacao: string | null
  ativo: boolean
}

export interface ProdutoRequest {
  nome: string
  descricao: string | null
  codigoReferencia: string
  unidadeMedida: UnidadeMedidaCadastro
  localizacaoFisica: string | null
  risco: NivelRiscoCadastro
  tipoRisco: TipoRiscoCadastro | null
  descricaoRisco: string | null
  perecivel: boolean
  tipoPerecivel: TipoPerecivelCadastro | null
  condicoesArmazenamento: string | null
  unidadeArmazenamento: string | null
  fiscalizado: boolean
  orgaosFiscalizadores: OrgaoFiscalizadorCadastro[]
  observacaoFiscalizacao: string | null
  ativo: boolean
}

export interface UsuarioPermissao extends UsuarioSessao {}

export interface AlterarPerfilRequest {
  perfil: PerfilUsuario
}

export interface ApiErrorAdmin {
  message?: string
}
