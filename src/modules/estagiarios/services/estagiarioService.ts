import { http } from '@/services/http'
import type {
  AtividadeDisponivelEstagioResponse,
  AtualizarVinculoEstagioRequest,
  CulturaEstagioResponse,
  CursoEstagioResponse,
  EstagiarioRequest,
  EstagiarioResponse,
  ObservacaoVinculoEstagioResponse,
  VinculoEstagioAtividadeRequest,
  VinculoEstagioAtividadeResponse,
  UsuarioOpcaoEstagioResponse,
  VinculoEstagioResponse,
} from '@/modules/estagiarios/types/estagiario'

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

  async atualizarVinculo(vinculoId: string, payload: AtualizarVinculoEstagioRequest) {
    const { data } = await http.put<VinculoEstagioResponse>(
      `/v1/vinculos-estagio/${vinculoId}`,
      payload,
    )
    return data
  },

  async listarCursosAtivos() {
    const { data } = await http.get<CursoEstagioResponse[]>('/v1/cursos/ativos')
    return data
  },

  async listarUsuarios() {
    const { data } = await http.get<UsuarioOpcaoEstagioResponse[]>('/v1/usuarios')
    return data
  },

  async listarObservacoes(vinculoId: string) {
    const { data } = await http.get<ObservacaoVinculoEstagioResponse[]>(
      `/v1/vinculos-estagio/${vinculoId}/observacoes`,
    )
    return data
  },

  async adicionarObservacao(vinculoId: string, usuarioId: string, texto: string) {
    const { data } = await http.post<ObservacaoVinculoEstagioResponse>(
      `/v1/vinculos-estagio/${vinculoId}/observacoes`,
      { usuarioId, texto },
    )
    return data
  },

  async alterarTreinamento(
    vinculoId: string,
    usuarioId: string,
    concluido: boolean,
    observacao?: string | null,
  ) {
    const { data } = await http.put<ObservacaoVinculoEstagioResponse>(
      `/v1/vinculos-estagio/${vinculoId}/treinamento-seguranca`,
      { usuarioId, concluido, observacao: observacao || null },
    )
    return data
  },

  async listarAtividadesDisponiveis() {
    const { data } = await http.get<AtividadeDisponivelEstagioResponse[]>('/v1/atividades/ativos')
    return data
  },

  async associarAtividade(vinculoId: string, payload: VinculoEstagioAtividadeRequest) {
    const { data } = await http.post<VinculoEstagioAtividadeResponse>(
      `/v1/vinculos-estagio/${vinculoId}/atividades`,
      payload,
    )
    return data
  },

  async listarCulturasAtivas() {
    const { data } = await http.get<CulturaEstagioResponse[]>('/v1/culturas/ativos')
    return data
  },

  async criarCultura(unidadeId: string, nome: string) {
    const { data } = await http.post<CulturaEstagioResponse>('/v1/culturas', {
      unidadeId,
      nome,
      ativo: true,
    })
    return data
  },

  async atualizarCulturas(participacaoId: string, culturaIds: string[]) {
    const { data } = await http.put<VinculoEstagioAtividadeResponse>(
      `/v1/vinculos-estagio/participacoes/${participacaoId}/culturas`,
      { culturaIds },
    )
    return data
  },
}
