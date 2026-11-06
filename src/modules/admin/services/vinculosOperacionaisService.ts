import type { PerfilUsuario, UsuarioSessao } from '@/modules/auth/types/session'
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
export interface AprovarUsuarioRequest {
  perfil: PerfilUsuario
  laboratorioIds: string[]
}
export const vinculosOperacionaisService = {
  async listarPendentes() {
    const { data } = await http.get<UsuarioSessao[]>('/v1/usuarios/pendentes')
    return data
  },
  async aprovar(usuarioId: string, req: AprovarUsuarioRequest) {
    const { data } = await http.post<UsuarioSessao>(`/v1/usuarios/${usuarioId}/aprovar`, req)
    return data
  },
  async recusar(usuarioId: string) {
    await http.delete(`/v1/usuarios/${usuarioId}/pendente`)
  },
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
  async editar(id: string, payload: { dataFim: string | null; observacao: string | null }) {
    const { data } = await http.put<VinculoOperacional>('/v1/vinculos-operacionais/' + id, payload)
    return data
  },
  async encerrar(id: string) {
    const { data } = await http.put<VinculoOperacional>(`/v1/vinculos-operacionais/${id}/encerrar`)
    return data
  },
  async definirLaboratorios(usuarioId: string, laboratorioIds: string[]) {
    await http.put(`/v1/vinculos-operacionais/usuarios/${usuarioId}/laboratorios`, { laboratorioIds })
  },
}
