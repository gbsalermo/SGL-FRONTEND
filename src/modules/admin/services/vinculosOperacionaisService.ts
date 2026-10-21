import { http } from '@/services/http'

export interface VinculoOperacional {
  id: string
  usuarioId: string
  laboratorioId: string
  laboratorioNome: string
  projetoId: string | null
  projetoNome: string | null
  sciId: string | null
  sciNome: string | null
  atividadeId: string | null
  atividadeNome: string | null
  dataInicio: string
  dataFim: string | null
  encerrado: boolean
  observacao: string | null
}
export interface NovoVinculoOperacional {
  usuarioId: string
  laboratorioId: string
  projetoId: string | null
  sciId: string | null
  atividadeId: string | null
  dataInicio: string
  dataFim: string | null
  observacao: string | null
}
export interface ResumoVinculosUsuario {
  usuarioId: string
  vinculosVigentes: number
  vinculosEncerrados: number
  laboratoriosAdicionais: string[]
}
export const vinculosOperacionaisService = {
  async resumo() {
    const { data } = await http.get<ResumoVinculosUsuario[]>('/v1/vinculos-operacionais/resumo')
    return data
  },
  async listar(usuarioId: string) {
    const { data } = await http.get<VinculoOperacional[]>(`/v1/vinculos-operacionais/usuarios/${usuarioId}`)
    return data
  },
  async criar(payload: NovoVinculoOperacional) {
    const { data } = await http.post<VinculoOperacional>('/v1/vinculos-operacionais', payload)
    return data
  },
  async encerrar(id: string) {
    const { data } = await http.put<VinculoOperacional>(`/v1/vinculos-operacionais/${id}/encerrar`)
    return data
  },
  async atualizarBase(usuarioId: string, laboratorioId: string | null) {
    await http.put(`/v1/vinculos-operacionais/usuarios/${usuarioId}/laboratorio-base`, { laboratorioId })
  },
}
