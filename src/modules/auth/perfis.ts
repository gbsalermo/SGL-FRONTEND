import type { PerfilUsuario, SituacaoUsuario } from './types/session'

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

const TODOS_OS_PERFIS: PerfilUsuario[] = ['ADMINISTRADOR_GERAL', 'ADMINISTRADOR', 'GESTOR', ...PERFIS_SOLICITANTE]

/** Rule 3b, mirrored from the backend PerfilPolicy.podeConceder only to filter the options shown. */
export function perfisConcedidosPor(concedente?: PerfilUsuario | null): PerfilUsuario[] {
  switch (concedente) {
    case 'ADMINISTRADOR_GERAL':
      return [...TODOS_OS_PERFIS]
    case 'ADMINISTRADOR':
      return TODOS_OS_PERFIS.filter((perfil) => !PERFIS_ADMIN.includes(perfil))
    case 'GESTOR':
      return [...PERFIS_SOLICITANTE]
    default:
      return []
  }
}

export const ROTULOS_PERFIL: Record<PerfilUsuario, string> = {
  ADMINISTRADOR_GERAL: 'Administrador geral',
  ADMINISTRADOR: 'Administrador',
  GESTOR: 'Gestor',
  TECNICO: 'Técnico',
  ANALISTA: 'Analista',
  PESQUISADOR: 'Pesquisador',
  ESTAGIARIO: 'Estagiário',
}

/**
 * Usuário que entrou pelo AD como colaborador e ainda não foi aprovado. Trocar perfil ou laboratório
 * dele não libera o acesso (a API recusa com USUARIO_PENDENTE): só "Aprovar", na aba Pendentes, faz isso.
 */
export function aguardaAprovacao(usuario?: { situacao?: SituacaoUsuario | null } | null) {
  return usuario?.situacao === 'PENDENTE_VINCULACAO'
}

/** Onde a gestão aprova pendentes: tela de Vínculos já aberta na aba Pendentes. */
export const ROTA_APROVAR_PENDENTES = { path: '/administracao/cadastros/vinculos', query: { aba: 'PENDENTES' } }
