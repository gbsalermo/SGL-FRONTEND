import { describe, expect, it } from 'vitest'

import {
  aguardaAprovacao,
  ehAdmin,
  ehAdministradorGeral,
  ehEstagiario,
  ehGestao,
  ehResponsavel,
  listaAcesso,
  papeisConcedidosPor,
  rotuloAcesso,
  ROTA_APROVAR_PENDENTES,
} from '@/modules/auth/papeis'

describe('papeis acumulaveis', () => {
  it('quem nao tem papel nao e gestao', () => {
    expect(ehGestao({ papeis: [] })).toBe(false)
    expect(ehGestao(null)).toBe(false)
  })

  it('papeis se somam: gestor que tambem e administrador local e admin', () => {
    const usuario = { papeis: ['GESTOR', 'ADMINISTRADOR_LOCAL'] as const }
    expect(ehGestao(usuario)).toBe(true)
    expect(ehAdmin(usuario)).toBe(true)
    expect(ehAdministradorGeral(usuario)).toBe(false)
  })

  it('gestor sozinho nao e admin', () => {
    expect(ehAdmin({ papeis: ['GESTOR'] })).toBe(false)
  })

  it('responsavel vem dos laboratorios sob responsabilidade', () => {
    const usuario = { papeis: [], responsavelPor: [{ id: 'lab-1', nome: 'Lab', ativo: true }] }
    expect(ehResponsavel(usuario)).toBe(true)
    expect(ehResponsavel(usuario, 'lab-1')).toBe(true)
    expect(ehResponsavel(usuario, 'lab-2')).toBe(false)
    expect(ehResponsavel({ papeis: [] })).toBe(false)
  })

  it('estagiario depende so da categoria, e categoria nula nao e estagiario', () => {
    expect(ehEstagiario({ categoriaCargo: 'ESTAGIARIO' })).toBe(true)
    expect(ehEstagiario({ categoriaCargo: null })).toBe(false)
    expect(ehEstagiario(null)).toBe(false)
  })
})

describe('papeisConcedidosPor', () => {
  it('administrador geral concede todos', () => {
    expect(papeisConcedidosPor({ papeis: ['ADMINISTRADOR_GERAL'] })).toEqual([
      'ADMINISTRADOR_GERAL', 'ADMINISTRADOR_LOCAL', 'GESTOR',
    ])
  })

  it('administrador local concede administrador local e gestor', () => {
    expect(papeisConcedidosPor({ papeis: ['ADMINISTRADOR_LOCAL'] })).toEqual(['ADMINISTRADOR_LOCAL', 'GESTOR'])
  })

  it('gestor e quem nao tem papel nao concedem nada', () => {
    expect(papeisConcedidosPor({ papeis: ['GESTOR'] })).toEqual([])
    expect(papeisConcedidosPor(null)).toEqual([])
  })
})

describe('rotuloAcesso', () => {
  it('mostra os papeis, ou a categoria de quem nao tem papel', () => {
    expect(rotuloAcesso({ papeis: ['GESTOR', 'ADMINISTRADOR_LOCAL'], categoriaCargo: 'PESQUISADOR' }))
      .toBe('Administrador local · Gestor')
    expect(rotuloAcesso({ papeis: [], categoriaCargo: 'PESQUISADOR' })).toBe('Pesquisador')
    expect(rotuloAcesso({ papeis: [], categoriaCargo: null })).toBe('—')
  })
})

describe('aguardaAprovacao', () => {
  it('so a situacao PENDENTE_VINCULACAO conta como aguardando aprovacao', () => {
    expect(aguardaAprovacao({ situacao: 'PENDENTE_VINCULACAO' })).toBe(true)
    expect(aguardaAprovacao({ situacao: 'ATIVO' })).toBe(false)
    expect(aguardaAprovacao({})).toBe(false)
    expect(aguardaAprovacao(null)).toBe(false)
  })

  it('a rota de aprovacao abre a aba Pendentes de Vinculos', () => {
    expect(ROTA_APROVAR_PENDENTES).toEqual({ path: '/administracao/cadastros/vinculos', query: { aba: 'PENDENTES' } })
  })
})

describe('listaAcesso', () => {
  it('lista papeis na ordem da gestao e depois as responsabilidades', () => {
    expect(listaAcesso({
      papeis: ['GESTOR', 'ADMINISTRADOR_LOCAL'],
      responsavelPor: [{ id: 'lab-a', nome: 'Lab A' }],
    })).toEqual(['Administrador local', 'Gestor', 'Responsável por Lab A'])
  })

  it('sem papeis mostra a categoria', () => {
    expect(listaAcesso({ papeis: [], categoriaCargo: 'TECNICO' })).toEqual(['Técnico'])
  })

  it('sem nada devolve lista vazia', () => {
    expect(listaAcesso({})).toEqual([])
    expect(listaAcesso(null)).toEqual([])
  })

  it('responsavel sem nome e ignorado', () => {
    expect(listaAcesso({ papeis: ['GESTOR'], responsavelPor: [{ id: 'lab-a' }] })).toEqual(['Gestor'])
  })
})
