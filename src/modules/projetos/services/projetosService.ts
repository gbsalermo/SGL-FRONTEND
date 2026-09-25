import { http } from '@/services/http'
import type {
  AtividadeOperacional,
  ProjetoOperacional,
  SciOperacional,
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
}
