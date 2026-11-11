import type { ResumoDeTeste, UsuarioDeTeste } from '@/modules/auth/types/devLogin'
import type { PerfilUsuario } from '@/modules/auth/types/session'
import { http } from '@/services/http'

interface FiltrosDeUsuariosDeTeste {
  perfil?: PerfilUsuario | null
  unidadeId?: string | null
  busca?: string
}

export async function buscarUsuariosDeTeste(filtros: FiltrosDeUsuariosDeTeste): Promise<UsuarioDeTeste[]> {
  // Empty filters are left out so the API sees "no filter" rather than an empty value.
  const params: Record<string, string> = {}
  if (filtros.perfil) params.perfil = filtros.perfil
  if (filtros.unidadeId) params.unidadeId = filtros.unidadeId
  const busca = filtros.busca?.trim()
  if (busca) params.busca = busca

  const { data } = await http.get<UsuarioDeTeste[]>('/v1/auth/dev/usuarios', { params })
  return data
}

export async function carregarResumoDeTeste(unidadeId?: string | null): Promise<ResumoDeTeste> {
  const { data } = await http.get<ResumoDeTeste>('/v1/auth/dev/resumo', {
    params: unidadeId ? { unidadeId } : {},
  })
  return data
}
