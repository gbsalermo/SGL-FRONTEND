import type { TipoPessoaCorporativa } from '@/modules/admin/services/pessoasCorporativasService'
import type { CategoriaCargo, PapelSistema } from '@/modules/auth/types/session'

/** One person of a laboratory's team: permanent (in their list) and/or with temporary access. */
export interface MembroEquipe {
  usuarioId: string
  nome: string
  email: string | null
  papeis: PapelSistema[]
  categoriaCargo: CategoriaCargo | null
  cargo: string | null
  permanente: boolean
  acessoTemporarioAte: string | null
  responsavel: boolean
}

export interface ItemImportacao {
  tipo: TipoPessoaCorporativa
  referencia: string
  categoriaCargo: CategoriaCargo | null
}

export type ResultadoImportacaoTipo = 'CADASTRADA' | 'JA_CADASTRADA' | 'NAO_ENCONTRADA' | 'ERRO'

export interface ResultadoImportacao {
  referencia: string
  nome: string | null
  resultado: ResultadoImportacaoTipo
  mensagem: string | null
}
