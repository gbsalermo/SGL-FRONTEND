import { http } from '@/services/http'
import type { PerfilUsuario } from '@/modules/auth/types/session'

export interface LaboratorioOperacional {
  id: string
  unidadeId: string
  nome: string
  ativo: boolean
}
export function podeEscolherLaboratorio(perfil: PerfilUsuario | null | undefined) {
  return perfil === 'GESTOR' || perfil === 'ADMINISTRADOR'
}
export async function listarLaboratoriosOperacionais(unidadeId: string) {
  const { data } = await http.get<LaboratorioOperacional[]>('/v1/laboratorios')
  return data.filter(lab => lab.ativo && lab.unidadeId === unidadeId).sort((a,b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}
