import { http } from '@/services/http'
import type { EstagiarioRequest, EstagiarioResponse } from '@/modules/estagiarios/types/estagiario'

export const estagiarioService = {
  async listarTodos() {
    const { data } = await http.get<EstagiarioResponse[]>('/v1/estagiarios')
    return data
  },

  async listarAtivos() {
    const { data } = await http.get<EstagiarioResponse[]>('/v1/estagiarios/ativos')
    return data
  },

  async listarPorLaboratorio(laboratorioId: string) {
    const { data } = await http.get<EstagiarioResponse[]>('/v1/estagiarios/por-laboratorio', {
      params: { laboratorioId },
    })
    return data
  },

  async buscarPorId(id: string) {
    const { data } = await http.get<EstagiarioResponse>(`/v1/estagiarios/${id}`)
    return data
  },

  async criar(payload: EstagiarioRequest) {
    const { data } = await http.post<EstagiarioResponse>('/v1/estagiarios', payload)
    return data
  },

  async atualizar(id: string, payload: EstagiarioRequest) {
    const { data } = await http.put<EstagiarioResponse>(`/v1/estagiarios/${id}`, payload)
    return data
  },

  async encerrar(id: string) {
    const { data } = await http.put<EstagiarioResponse>(`/v1/estagiarios/${id}/encerrar`)
    return data
  },
}
