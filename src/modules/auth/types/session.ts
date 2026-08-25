export type PerfilUsuario =
  | 'ADMINISTRADOR'
  | 'GESTOR'
  | 'TECNICO'
  | 'ANALISTA'
  | 'PESQUISADOR'
  | 'ESTAGIARIO'

export interface UsuarioSessao {
  id: string
  nome: string
  email: string
  perfil: PerfilUsuario
  unidadeId: string | null
  unidadeNome: string | null
  laboratorioId: string | null
  laboratorioNome: string | null
  ativo: boolean
}
