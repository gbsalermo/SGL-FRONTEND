import type { PessoaCorporativa, TipoPessoaCorporativa } from '@/modules/admin/services/pessoasCorporativasService'
import type {
  NovoVinculoOperacional,
  VinculoOperacional,
} from '@/modules/admin/services/vinculosOperacionaisService'
import type { CategoriaCargo, UsuarioSessao } from '@/modules/auth/types/session'
import { http } from '@/services/http'

import type { ItemImportacao, MembroEquipe, ResultadoImportacao } from './types'

/** The API accepts at most this many people per batch registration call. */
export const TAMANHO_DO_LOTE = 50

const base = (laboratorioId: string) => `/v1/laboratorios/${laboratorioId}/equipe`

export const equipeService = {
  async listar(laboratorioId: string) {
    const { data } = await http.get<MembroEquipe[]>(base(laboratorioId))
    return data
  },

  async incluir(laboratorioId: string, usuarioId: string) {
    await http.post(`${base(laboratorioId)}/${usuarioId}`)
  },

  async retirar(laboratorioId: string, usuarioId: string) {
    await http.delete(`${base(laboratorioId)}/${usuarioId}`)
  },

  async listarPendentes(laboratorioId: string) {
    const { data } = await http.get<UsuarioSessao[]>(`${base(laboratorioId)}/pendentes`)
    return data
  },

  async aprovarPendente(laboratorioId: string, usuarioId: string, categoriaCargo: CategoriaCargo | null) {
    const { data } = await http.post<UsuarioSessao>(
      `${base(laboratorioId)}/pendentes/${usuarioId}/aprovar`, { categoriaCargo })
    return data
  },

  async candidatos(laboratorioId: string, tipo: TipoPessoaCorporativa, termo: string) {
    const { data } = await http.get<PessoaCorporativa[]>(`${base(laboratorioId)}/candidatos-embrapa`, {
      params: { tipo, termo: termo.trim() },
    })
    return data
  },

  /** Sends the selection in blocks the API accepts and returns every person's result, in order. */
  async importar(laboratorioId: string, itens: ItemImportacao[]) {
    const resultados: ResultadoImportacao[] = []
    for (let inicio = 0; inicio < itens.length; inicio += TAMANHO_DO_LOTE) {
      const bloco = itens.slice(inicio, inicio + TAMANHO_DO_LOTE)
      const { data } = await http.post<ResultadoImportacao[]>(`${base(laboratorioId)}/importar`, { itens: bloco })
      resultados.push(...data)
    }
    return resultados
  },

  async listarVinculos(laboratorioId: string) {
    const { data } = await http.get<VinculoOperacional[]>(`${base(laboratorioId)}/vinculos`)
    return data
  },

  async criarVinculo(laboratorioId: string, req: NovoVinculoOperacional) {
    const { data } = await http.post<VinculoOperacional>(`${base(laboratorioId)}/vinculos`, req)
    return data
  },

  async editarVinculo(laboratorioId: string, vinculoId: string, req: { dataFim: string | null; observacao: string | null }) {
    const { data } = await http.put<VinculoOperacional>(`${base(laboratorioId)}/vinculos/${vinculoId}`, req)
    return data
  },

  async encerrarVinculo(laboratorioId: string, vinculoId: string) {
    const { data } = await http.put<VinculoOperacional>(`${base(laboratorioId)}/vinculos/${vinculoId}/encerrar`)
    return data
  },
}
