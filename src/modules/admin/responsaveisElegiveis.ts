import type { UsuarioPermissao } from './types/cadastros'

/**
 * People who can be a laboratory's responsável: active, already approved and of the lab's Unidade.
 * Same rule as the API, so the form never offers a choice that would be refused.
 */
export function responsaveisElegiveis(usuarios: UsuarioPermissao[], unidadeId: string): UsuarioPermissao[] {
  if (!unidadeId) return []
  return usuarios
    .filter((u) => u.ativo && u.situacao !== 'PENDENTE_VINCULACAO' && u.unidadeId === unidadeId)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}
