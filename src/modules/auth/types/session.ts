import type { LaboratorioResumo } from '@/modules/projetos/types/projetos'

/** Accumulable system roles. "Responsável" is not one: it comes from `responsavelPor`. */
export type PapelSistema = 'ADMINISTRADOR_GERAL' | 'ADMINISTRADOR_LOCAL' | 'GESTOR'

/** Job category from the corporate cargo; drives intern and advisor rules, never access. */
export type CategoriaCargo = 'TECNICO' | 'ANALISTA' | 'PESQUISADOR' | 'ESTAGIARIO'

export type SituacaoUsuario = 'PENDENTE_VINCULACAO' | 'ATIVO'

export interface UsuarioSessao {
  id: string
  nome: string
  email: string
  papeis: PapelSistema[]
  categoriaCargo: CategoriaCargo | null
  cargo: string | null
  /** Laboratórios ativos de que a pessoa é responsável. */
  responsavelPor: LaboratorioResumo[]
  situacao: SituacaoUsuario
  unidadeId: string | null
  unidadeNome: string | null
  unidadeSigla: string | null
  laboratorios: LaboratorioResumo[]
  ativo: boolean
}

export interface LoginResponse {
  token: string
  expiraEm: string
  usuario: UsuarioSessao
}

export interface AuthConfig {
  devLoginAtivo: boolean
}
