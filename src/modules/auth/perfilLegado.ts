import { type ComAcesso, PAPEIS_GESTAO } from './papeis'

/**
 * The former single profile. Two API filters kept it (`?perfil=` on the test login and on the
 * pessoas-por-laboratório report), with the same meaning: a management profile matches whoever holds
 * that role; a job profile matches people with that category and no role.
 */
export type PerfilLegado =
  | 'ADMINISTRADOR_GERAL'
  | 'ADMINISTRADOR'
  | 'GESTOR'
  | 'TECNICO'
  | 'ANALISTA'
  | 'PESQUISADOR'
  | 'ESTAGIARIO'

export const ROTULOS_PERFIL_LEGADO: Record<PerfilLegado, string> = {
  ADMINISTRADOR_GERAL: 'Administrador geral',
  ADMINISTRADOR: 'Administrador local',
  GESTOR: 'Gestor',
  TECNICO: 'Técnico',
  ANALISTA: 'Analista',
  PESQUISADOR: 'Pesquisador',
  ESTAGIARIO: 'Estagiário',
}

/** Mirrors the backend Perfil.descreve, for the legacy "filter by profile" selects. */
export function descrevePerfilLegado(perfil: PerfilLegado, usuario: ComAcesso | null | undefined) {
  const papel = perfil === 'ADMINISTRADOR' ? 'ADMINISTRADOR_LOCAL'
    : perfil === 'ADMINISTRADOR_GERAL' || perfil === 'GESTOR' ? perfil : null
  if (papel) return Boolean(usuario?.papeis?.includes(papel))
  return (usuario?.papeis?.length ?? 0) === 0 && usuario?.categoriaCargo === perfil
}

/** Mirrors the backend Perfil.legadoDe: the highest role wins, otherwise the job category. */
export function perfilLegadoDe(usuario: ComAcesso | null | undefined): PerfilLegado {
  const papel = PAPEIS_GESTAO.find((item) => usuario?.papeis?.includes(item))
  if (papel === 'ADMINISTRADOR_LOCAL') return 'ADMINISTRADOR'
  if (papel) return papel
  return usuario?.categoriaCargo ?? 'TECNICO'
}
