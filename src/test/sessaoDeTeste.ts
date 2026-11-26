import type { CategoriaCargo, PapelSistema, UsuarioSessao } from '@/modules/auth/types/session'

/**
 * Former single profiles, kept so specs can still say "a GESTOR" or "a TECNICO": a management
 * profile becomes that role, a job profile becomes the category with no role.
 */
export type PerfilDeTeste = PapelSistema | 'ADMINISTRADOR' | CategoriaCargo

export function acessoDe(perfil: PerfilDeTeste): Pick<UsuarioSessao, 'papeis' | 'categoriaCargo'> {
  if (perfil === 'ADMINISTRADOR') return { papeis: ['ADMINISTRADOR_LOCAL'], categoriaCargo: null }
  if (perfil === 'ADMINISTRADOR_GERAL' || perfil === 'ADMINISTRADOR_LOCAL' || perfil === 'GESTOR') {
    return { papeis: [perfil], categoriaCargo: null }
  }
  return { papeis: [], categoriaCargo: perfil }
}

export function usuarioDeTeste(perfil: PerfilDeTeste, extra: Partial<UsuarioSessao> = {}): UsuarioSessao {
  return {
    id: 'u-1', nome: 'Fulano', email: 'f@embrapa.br', situacao: 'ATIVO',
    unidadeId: 'unidade-1', unidadeNome: 'Mandioca', unidadeSigla: 'CNPMF',
    laboratorios: [], ativo: true, cargo: null, responsavelPor: [],
    ...acessoDe(perfil),
    ...extra,
  }
}
