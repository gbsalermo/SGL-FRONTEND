import { http } from '@/services/http'
import type {
  AtividadeOperacional,
  AtividadeRequest,
  CorrecaoCodigoSegRequest,
  HistoricoCorrecaoCodigoSeg,
  HistoricoProrrogacao,
  ProjetoOperacional,
  ProrrogacaoRequest,
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

  async prorrogarProjeto(id: string, payload: ProrrogacaoRequest) {
    const { data } = await http.post<HistoricoProrrogacao>(`/v1/projetos/${id}/prorrogacoes`, payload)
    return data
  },

  async prorrogarSci(id: string, payload: ProrrogacaoRequest) {
    const { data } = await http.post<HistoricoProrrogacao>(`/v1/scis/${id}/prorrogacoes`, payload)
    return data
  },

  async prorrogarAtividade(id: string, payload: ProrrogacaoRequest) {
    const { data } = await http.post<HistoricoProrrogacao>(`/v1/atividades/${id}/prorrogacoes`, payload)
    return data
  },

  async corrigirCodigoSegProjeto(id: string, payload: CorrecaoCodigoSegRequest) {
    const { data } = await http.post<HistoricoCorrecaoCodigoSeg[]>(
      `/v1/projetos/${id}/correcoes-codigo-seg`,
      payload,
    )
    return data
  },

  async corrigirCodigoSegSci(id: string, payload: CorrecaoCodigoSegRequest) {
    const { data } = await http.post<HistoricoCorrecaoCodigoSeg[]>(
      `/v1/scis/${id}/correcoes-codigo-seg`,
      payload,
    )
    return data
  },

  async corrigirCodigoSegAtividade(id: string, payload: CorrecaoCodigoSegRequest) {
    const { data } = await http.post<HistoricoCorrecaoCodigoSeg[]>(
      `/v1/atividades/${id}/correcoes-codigo-seg`,
      payload,
    )
    return data
  },

  async listarProrrogacoesProjeto(id: string) {
    const { data } = await http.get<HistoricoProrrogacao[]>(`/v1/projetos/${id}/prorrogacoes`)
    return data
  },

  async listarProrrogacoesSci(id: string) {
    const { data } = await http.get<HistoricoProrrogacao[]>(`/v1/scis/${id}/prorrogacoes`)
    return data
  },

  async listarProrrogacoesAtividade(id: string) {
    const { data } = await http.get<HistoricoProrrogacao[]>(`/v1/atividades/${id}/prorrogacoes`)
    return data
  },

  async listarCorrecoesProjeto(id: string) {
    const { data } = await http.get<HistoricoCorrecaoCodigoSeg[]>(
      `/v1/projetos/${id}/correcoes-codigo-seg`,
    )
    return data
  },

  async listarCorrecoesSci(id: string) {
    const { data } = await http.get<HistoricoCorrecaoCodigoSeg[]>(
      `/v1/scis/${id}/correcoes-codigo-seg`,
    )
    return data
  },

  async listarCorrecoesAtividade(id: string) {
    const { data } = await http.get<HistoricoCorrecaoCodigoSeg[]>(
      `/v1/atividades/${id}/correcoes-codigo-seg`,
    )
    return data
  },
}
