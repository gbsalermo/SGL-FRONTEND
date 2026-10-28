export type PerfilUsuario =
  | 'ADMINISTRADOR_GERAL'
  | 'ADMINISTRADOR'
  | 'GESTOR'
  | 'TECNICO'
  | 'ANALISTA'
  | 'PESQUISADOR'
  | 'ESTAGIARIO'

export type SituacaoUsuario = 'PENDENTE_VINCULACAO' | 'ATIVO'

export interface UsuarioSessao {
  id: string
  nome: string
  email: string
  perfil: PerfilUsuario
  situacao: SituacaoUsuario
  unidadeId: string | null
  unidadeNome: string | null
  unidadeSigla: string | null
  laboratorioId: string | null
  laboratorioNome: string | null
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
