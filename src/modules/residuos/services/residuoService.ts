import { http } from '@/services/http'
import type {
  AnalisarResiduoRequest,
  ArmazenarResiduoRequest,
  CriarResiduoRequest,
  DespacharResiduoRequest,
  HistoricoResiduoResponse,
  ProdutoResiduoResponse,
  ProjetoResiduoResponse,
  ReceberResiduoRequest,
  ResiduoResponse,
  RotuloResiduoResponse,
  StatusResiduo,
} from '@/modules/residuos/types/residuo'

export const residuoService = {
  async criar(payload: CriarResiduoRequest) {
    const { data } = await http.post<ResiduoResponse>('/v1/residuos', payload)
    return data
  },

  async listarTodos() {
    const { data } = await http.get<ResiduoResponse[]>('/v1/residuos')
    return data
  },

  async listarPorGerador(usuarioGeradorId: string) {
    const { data } = await http.get<ResiduoResponse[]>('/v1/residuos/por-gerador', {
      params: { usuarioGeradorId },
    })
    return data
  },

  async listarPorStatus(status: StatusResiduo) {
    const { data } = await http.get<ResiduoResponse[]>('/v1/residuos/por-status', {
      params: { status },
    })
    return data
  },

  async buscarPorId(id: string) {
    const { data } = await http.get<ResiduoResponse>(`/v1/residuos/${id}`)
    return data
  },

  async receber(id: string, payload: ReceberResiduoRequest) {
    const { data } = await http.put<ResiduoResponse>(`/v1/residuos/${id}/receber`, payload)
    return data
  },

  async analisarELiberar(id: string, payload: AnalisarResiduoRequest) {
    const { data } = await http.put<ResiduoResponse>(`/v1/residuos/${id}/analisar-liberar`, payload)
    return data
  },

  async armazenar(id: string, payload: ArmazenarResiduoRequest) {
    const { data } = await http.put<ResiduoResponse>(`/v1/residuos/${id}/armazenar`, payload)
    return data
  },

  async despachar(id: string, payload: DespacharResiduoRequest) {
    const { data } = await http.put<ResiduoResponse>(`/v1/residuos/${id}/despachar`, payload)
    return data
  },

  async buscarHistorico(id: string) {
    const { data } = await http.get<HistoricoResiduoResponse[]>(`/v1/residuos/${id}/historico`)
    return data
  },

  async buscarDadosRotulo(id: string) {
    const { data } = await http.get<RotuloResiduoResponse>(`/v1/residuos/${id}/rotulo`)
    return data
  },

  async listarProjetosPorLaboratorio(laboratorioId: string) {
    const { data } = await http.get<ProjetoResiduoResponse[]>('/v1/projetos/por-laboratorio', {
      params: { laboratorioId },
    })
    return data.filter((projeto) => projeto.ativo)
  },

  async listarProdutosAtivos() {
    const { data } = await http.get<ProdutoResiduoResponse[]>('/v1/produtos')
    return data
      .filter((produto) => produto.ativo)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  },
}
