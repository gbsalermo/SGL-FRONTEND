import { ehPerfilGestao } from '@/modules/auth/perfis'
import type { UsuarioSessao } from '@/modules/auth/types/session'

export function destinoAposLogin(usuario: UsuarioSessao): string {
  if (usuario.situacao === 'PENDENTE_VINCULACAO') return '/aguardando-aprovacao'
  return ehPerfilGestao(usuario.perfil) ? '/dashboard' : '/inicio'
}
