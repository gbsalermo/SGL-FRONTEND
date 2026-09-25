import { http } from '@/services/http'
import type {
  AtividadeOperacional,
  AtividadeRequest,
  ProjetoOperacional,
  SciOperacional,
  SciRequest,
} from '@/modules/projetos/types/projetos'

export const projetosService = {
  async listarProjetos() {
    const { data } = await http.get<ProjetoOperacional[]>('/v1/projetos')
    return data
  },

  async listarScisPorProjeto(projetoId: string) {
    const { data } = await http.get<SciOperacional[]>('/v1/scis/por-projeto', {
      params: { projetoId },
    })
    return data
  },

  async listarAtividadesPorProjeto(projetoId: string) {
    const { data } = await http.get<AtividadeOperacional[]>('/v1/atividades/por-projeto', {
      params: { projetoId },
    })
    return data
  },

  async criarSci(payload: SciRequest) {
    const { data } = await http.post<SciOperacional>('/v1/scis', payload)
    return data
  },

  async atualizarSci(id: string, payload: SciRequest) {
    const { data } = await http.put<SciOperacional>(`/v1/scis/${id}`, payload)
    return data
  },

  async criarAtividade(payload: AtividadeRequest) {
    const { data } = await http.post<AtividadeOperacional>('/v1/atividades', payload)
    return data
  },

  async atualizarAtividade(id: string, payload: AtividadeRequest) {
    const { data } = await http.put<AtividadeOperacional>(`/v1/atividades/${id}`, payload)
    return data
  },
}
