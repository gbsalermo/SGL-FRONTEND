import { http } from '@/services/http'
import { type ComAcesso, ehGestao } from '@/modules/auth/papeis'

export interface LaboratorioOperacional {
  id: string
  unidadeId: string
  nome: string
  ativo: boolean
}
export function podeEscolherLaboratorio(usuario: ComAcesso | null | undefined) {
  return ehGestao(usuario)
}
export async function listarLaboratoriosOperacionais(unidadeId: string) {
  const { data } = await http.get<LaboratorioOperacional[]>('/v1/laboratorios')
  return data.filter(lab => lab.ativo && lab.unidadeId === unidadeId).sort((a,b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}
