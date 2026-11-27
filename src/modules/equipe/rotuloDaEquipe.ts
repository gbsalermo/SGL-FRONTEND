import { ehAdmin } from '@/modules/auth/papeis'
import type { UsuarioSessao } from '@/modules/auth/types/session'

/**
 * Name of the team screen for this person. An administrator manages every laboratory of the
 * Unidade, so "Meu laboratório" would mislead them; a responsável manages their own.
 */
export function rotuloDaEquipe(usuario: UsuarioSessao | null | undefined): string {
  return ehAdmin(usuario) ? 'Equipes dos laboratórios' : 'Meu laboratório'
}
