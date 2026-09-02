import type { PerfilUsuario } from '@/modules/auth/types/session'
import type { TipoBolsaEstagiario } from '@/modules/estagiarios/types/estagiario'

export interface PessoaLaboratorioRelatorioItem {
  usuarioId: string
  nome: string
  email: string
  perfil: PerfilUsuario
  ativo: boolean
  responsavelLaboratorio: boolean
  tipoVinculoEstagio: TipoBolsaEstagiario | null
  dataInicioEstagio: string | null
  dataFimEstagio: string | null
}

export interface RelatorioPessoasLaboratorioResponse {
  geradoEm: string
  laboratorioId: string
  laboratorioNome: string
  unidadeId: string | null
  unidadeNome: string | null
  responsavelId: string | null
  responsavelNome: string | null
  responsavelEmail: string | null
  totalPessoas: number
  ativos: number
  inativos: number
  porPerfil: Partial<Record<PerfilUsuario, number>>
  pessoas: PessoaLaboratorioRelatorioItem[]
}

export interface RelatorioPessoasLaboratorioFiltros {
  laboratorioId: string
  perfil?: PerfilUsuario
  ativo?: boolean
}
