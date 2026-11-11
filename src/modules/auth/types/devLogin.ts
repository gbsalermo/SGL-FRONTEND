import type { LaboratorioResumo } from '@/modules/projetos/types/projetos'

import type { PerfilUsuario } from './session'

export interface UsuarioDeTeste {
  id: string
  nome: string
  login: string
  perfil: PerfilUsuario
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
  contagemPorPerfil: Record<PerfilUsuario, number>
  unidades: UnidadeOpcao[]
}
