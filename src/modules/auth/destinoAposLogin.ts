import { ehGestao } from '@/modules/auth/papeis'
import type { UsuarioSessao } from '@/modules/auth/types/session'

export function destinoAposLogin(usuario: UsuarioSessao): string {
  if (usuario.situacao === 'PENDENTE_VINCULACAO') return '/aguardando-aprovacao'
  return ehGestao(usuario) ? '/dashboard' : '/inicio'
}
