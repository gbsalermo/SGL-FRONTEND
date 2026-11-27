import { describe, expect, it } from 'vitest'

import { responsaveisElegiveis } from '@/modules/admin/responsaveisElegiveis'
import type { UsuarioPermissao } from '@/modules/admin/types/cadastros'

function usuario(id: string, nome: string, extra: Partial<UsuarioPermissao> = {}) {
  return { id, nome, ativo: true, situacao: 'ATIVO', unidadeId: 'un-1', ...extra } as UsuarioPermissao
}

describe('responsaveisElegiveis', () => {
  it('oferece so pessoas ativas, ja aprovadas e da mesma unidade, em ordem alfabetica', () => {
    const lista = [
      usuario('1', 'Zé'),
      usuario('2', 'Ana'),
      usuario('3', 'Pendente', { situacao: 'PENDENTE_VINCULACAO' }),
      usuario('4', 'Inativo', { ativo: false }),
      usuario('5', 'Outra unidade', { unidadeId: 'un-2' }),
    ]

    expect(responsaveisElegiveis(lista, 'un-1').map((u) => u.nome)).toEqual(['Ana', 'Zé'])
    expect(responsaveisElegiveis(lista, '')).toEqual([])
  })
})
