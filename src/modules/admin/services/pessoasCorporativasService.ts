import { isAxiosError } from 'axios'

import type { PerfilUsuario, SituacaoUsuario, UsuarioSessao } from '@/modules/auth/types/session'
import { http } from '@/services/http'

export type TipoPessoaCorporativa = 'EMPREGADO' | 'COLABORADOR'

/** A person from the Embrapa bases. The CPF never reaches the browser; `referencia` identifies them. */
export interface PessoaCorporativa {
  referencia: string
  tipo: TipoPessoaCorporativa
  nome: string
  matricula: string | null
  cargo: string | null
  sublotacao: string | null
  unidadeNome: string | null
  email: string | null
  jaCadastrado: boolean
  situacao: SituacaoUsuario | null
  perfilSugerido: PerfilUsuario | null
}

export interface ImportarPessoaRequest {
  tipo: TipoPessoaCorporativa
  referencia: string
  perfil: PerfilUsuario
  laboratorioBaseId: string
}

/** One read-only line of Embrapa data shown in the import/approval drawer. */
export interface DadoEmbrapa {
  rotulo: string
  valor: string | null
}

export const TERMO_MINIMO = 3

export async function buscarPessoas(tipo: TipoPessoaCorporativa, termo: string) {
  const { data } = await http.get<PessoaCorporativa[]>('/v1/pessoas-corporativas', {
    params: { tipo, termo: termo.trim() },
  })
  return data
}

export async function importarPessoa(req: ImportarPessoaRequest) {
  try {
    const { data } = await http.post<UsuarioSessao>('/v1/pessoas-corporativas/importar', req)
    return data
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 409 && error.response.data?.codigo === 'JA_CADASTRADO') {
      throw new Error('Pessoa já cadastrada no SGL.')
    }
    throw error
  }
}
