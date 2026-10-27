import type { PerfilUsuario } from './types/session'

// Mirrors the backend PerfilPolicy: the general administrator counts as both gestão and admin.
export const PERFIS_GESTAO: PerfilUsuario[] = ['GESTOR', 'ADMINISTRADOR', 'ADMINISTRADOR_GERAL']
export const PERFIS_ADMIN: PerfilUsuario[] = ['ADMINISTRADOR', 'ADMINISTRADOR_GERAL']
export const PERFIS_SOLICITANTE: PerfilUsuario[] = ['TECNICO', 'ANALISTA', 'PESQUISADOR', 'ESTAGIARIO']

export function ehPerfilGestao(perfil?: PerfilUsuario | null) {
  return Boolean(perfil && PERFIS_GESTAO.includes(perfil))
}

export function ehPerfilAdmin(perfil?: PerfilUsuario | null) {
  return Boolean(perfil && PERFIS_ADMIN.includes(perfil))
}
