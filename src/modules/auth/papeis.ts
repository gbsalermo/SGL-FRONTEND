import type { CategoriaCargo, PapelSistema, SituacaoUsuario } from './types/session'

/** Anything that carries a person's access: the session user, a user row, a report item. */
export interface ComAcesso {
  papeis?: readonly PapelSistema[] | null
  categoriaCargo?: CategoriaCargo | null
  responsavelPor?: readonly { id: string; nome?: string }[] | null
}

// Mirrors the backend PapelPolicy: roles accumulate, so every check asks "does any role allow it".
export const PAPEIS_GESTAO: PapelSistema[] = ['ADMINISTRADOR_GERAL', 'ADMINISTRADOR_LOCAL', 'GESTOR']
export const PAPEIS_ADMIN: PapelSistema[] = ['ADMINISTRADOR_GERAL', 'ADMINISTRADOR_LOCAL']
export const CATEGORIAS: CategoriaCargo[] = ['TECNICO', 'ANALISTA', 'PESQUISADOR', 'ESTAGIARIO']

export function temAlgumPapel(usuario: ComAcesso | null | undefined, papeis: readonly PapelSistema[]) {
  return Boolean(usuario?.papeis?.some((papel) => papeis.includes(papel)))
}

export function ehGestao(usuario: ComAcesso | null | undefined) {
  return temAlgumPapel(usuario, PAPEIS_GESTAO)
}

export function ehAdmin(usuario: ComAcesso | null | undefined) {
  return temAlgumPapel(usuario, PAPEIS_ADMIN)
}

export function ehAdministradorGeral(usuario: ComAcesso | null | undefined) {
  return temAlgumPapel(usuario, ['ADMINISTRADOR_GERAL'])
}

/** Being responsável is an association with the laboratory, not a stored role. */
export function ehResponsavel(usuario: ComAcesso | null | undefined, laboratorioId?: string) {
  const laboratorios = usuario?.responsavelPor ?? []
  return laboratorioId ? laboratorios.some((lab) => lab.id === laboratorioId) : laboratorios.length > 0
}

export function ehEstagiario(usuario: ComAcesso | null | undefined) {
  return usuario?.categoriaCargo === 'ESTAGIARIO'
}

/** Mirrors PapelPolicy.podeConceder, only to filter the options shown; the API decides. */
export function papeisConcedidosPor(usuario: ComAcesso | null | undefined): PapelSistema[] {
  if (ehAdministradorGeral(usuario)) return [...PAPEIS_GESTAO]
  if (temAlgumPapel(usuario, ['ADMINISTRADOR_LOCAL'])) return ['ADMINISTRADOR_LOCAL', 'GESTOR']
  return []
}

export const ROTULOS_PAPEL: Record<PapelSistema, string> = {
  ADMINISTRADOR_GERAL: 'Administrador geral',
  ADMINISTRADOR_LOCAL: 'Administrador local',
  GESTOR: 'Gestor',
}

export const ROTULOS_CATEGORIA: Record<CategoriaCargo, string> = {
  TECNICO: 'Técnico',
  ANALISTA: 'Analista',
  PESQUISADOR: 'Pesquisador',
  ESTAGIARIO: 'Estagiário',
}

/** One line describing someone's access: their roles, or their job category when they have none. */
export function rotuloAcesso(usuario: ComAcesso | null | undefined): string {
  const papeis = PAPEIS_GESTAO.filter((papel) => usuario?.papeis?.includes(papel))
  if (papeis.length > 0) return papeis.map((papel) => ROTULOS_PAPEL[papel]).join(' · ')
  return usuario?.categoriaCargo ? ROTULOS_CATEGORIA[usuario.categoriaCargo] : '—'
}

/**
 * Every item of someone's access, for places that show them one by one: the roles (or the job category
 * when there are none), then each laboratory they are responsible for. Laboratories without a name in
 * the payload are skipped because "Responsável por" alone says nothing.
 */
export function listaAcesso(usuario: ComAcesso | null | undefined): string[] {
  const papeis = PAPEIS_GESTAO.filter((papel) => usuario?.papeis?.includes(papel)).map((papel) => ROTULOS_PAPEL[papel])
  const base = papeis.length > 0 ? papeis : usuario?.categoriaCargo ? [ROTULOS_CATEGORIA[usuario.categoriaCargo]] : []
  const responsabilidades = (usuario?.responsavelPor ?? [])
    .filter((laboratorio) => laboratorio.nome)
    .map((laboratorio) => `Responsável por ${laboratorio.nome}`)
  return [...base, ...responsabilidades]
}

/**
 * Usuário que entrou pelo AD como colaborador e ainda não foi aprovado. Trocar papel ou laboratório
 * dele não libera o acesso (a API recusa com USUARIO_PENDENTE): só "Aprovar", na aba Pendentes, faz isso.
 */
export function aguardaAprovacao(usuario?: { situacao?: SituacaoUsuario | null } | null) {
  return usuario?.situacao === 'PENDENTE_VINCULACAO'
}

/** Onde a gestão aprova pendentes: tela de Vínculos já aberta na aba Pendentes. */
export const ROTA_APROVAR_PENDENTES = { path: '/administracao/cadastros/vinculos', query: { aba: 'PENDENTES' } }
