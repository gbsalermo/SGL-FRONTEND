import type { LaboratorioResumo } from '@/modules/projetos/types/projetos'

import type { PerfilLegado } from '../perfilLegado'
import type { CategoriaCargo, PapelSistema } from './session'

export interface UsuarioDeTeste {
  id: string
  nome: string
  login: string
  papeis: PapelSistema[]
  categoriaCargo: CategoriaCargo | null
  unidadeId: string | null
  unidadeSigla: string | null
  laboratorios: LaboratorioResumo[]
}

export interface UnidadeOpcao {
  id: string
  sigla: string
  nome: string
}

export interface ResumoDeTeste {
  contagemPorPerfil: Record<PerfilLegado, number>
  unidades: UnidadeOpcao[]
}
