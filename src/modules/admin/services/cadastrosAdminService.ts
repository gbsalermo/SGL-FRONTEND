import { http } from '@/services/http'
import type {
  AlterarPerfilRequest,
  LaboratorioCadastro,
  LaboratorioRequest,
  ProdutoCadastro,
  ProdutoRequest,
  ProjetoCadastro,
  ProjetoRequest,
  UnidadeCadastro,
  UsuarioPermissao,
} from '@/modules/admin/types/cadastros'

export const cadastrosAdminService = {
  async listarUnidades() {
    const { data } = await http.get<UnidadeCadastro[]>('/v1/unidades')
    return data
  },

  async listarLaboratorios() {
    const { data } = await http.get<LaboratorioCadastro[]>('/v1/laboratorios')
    return data
  },

  async criarLaboratorio(payload: LaboratorioRequest) {
    const { data } = await http.post<LaboratorioCadastro>('/v1/laboratorios', payload)
    return data
  },

  async atualizarLaboratorio(id: string, payload: LaboratorioRequest) {
    const { data } = await http.put<LaboratorioCadastro>(`/v1/laboratorios/${id}`, payload)
    return data
  },

  async listarProjetos() {
    const { data } = await http.get<ProjetoCadastro[]>('/v1/projetos')
    return data
  },

  async criarProjeto(payload: ProjetoRequest) {
    const { data } = await http.post<ProjetoCadastro>('/v1/projetos', payload)
    return data
  },

  async atualizarProjeto(id: string, payload: ProjetoRequest) {
    const { data } = await http.put<ProjetoCadastro>(`/v1/projetos/${id}`, payload)
    return data
  },

  async listarProdutos() {
    const { data } = await http.get<ProdutoCadastro[]>('/v1/produtos')
    return data
  },

  async criarProduto(payload: ProdutoRequest) {
    const { data } = await http.post<ProdutoCadastro>('/v1/produtos', payload)
    return data
  },

  async atualizarProduto(id: string, payload: ProdutoRequest) {
    const { data } = await http.put<ProdutoCadastro>(`/v1/produtos/${id}`, payload)
    return data
  },

  async listarUsuarios() {
    const { data } = await http.get<UsuarioPermissao[]>('/v1/usuarios')
    return data
  },

  async alterarPerfil(id: string, payload: AlterarPerfilRequest) {
    const { data } = await http.put<UsuarioPermissao>(`/v1/usuarios/${id}/perfil`, payload)
    return data
  },
}
